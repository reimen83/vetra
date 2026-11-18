import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { deepSearch, whatsappUrl } from "./search.js";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const PRICE = Number(process.env.VETRA_PIX_PRICE || 17);
const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET;
const APP_URL = (process.env.APP_URL || "").replace(/\/$/, "");
const COOKIE_NAME = "vetra_session";
const sessions = new Map();
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined })
  : null;

const schema = `
CREATE TABLE IF NOT EXISTS vetra_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  license_active BOOLEAN NOT NULL DEFAULT FALSE,
  licensed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS vetra_payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES vetra_users(id),
  provider_payment_id TEXT UNIQUE,
  status TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  checkout_token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS vetra_payments_user_id_idx ON vetra_payments(user_id);
`;

let dbReady = false;
async function initializeDatabase() {
  if (!pool) return;
  await pool.query(schema);
  dbReady = true;
  console.log("Vetra database ready");
}

function json(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(payload),
    ...extraHeaders
  });
  res.end(payload);
}

function parseBody(req, maxBytes = 32_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(Object.assign(new Error("Requisição muito grande"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(Object.assign(new Error("JSON inválido"), { status: 400 })); }
    });
    req.on("error", reject);
  });
}

function cookieOf(req, name) {
  const pair = (req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!pair) return null;
  try { return decodeURIComponent(pair.slice(name.length + 1)); } catch { return null; }
}

function cookieHeader(token, maxAge) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function requireLicense(req, res) {
  const token = cookieOf(req, COOKIE_NAME);
  const session = token ? sessions.get(token) : null;
  if (!session) {
    json(res, 401, { error: "Entre na sua conta para continuar." });
    return null;
  }
  if (!session.licenseActive) {
    json(res, 403, { error: "A licença ainda não está ativa. Conclua o pagamento Pix." });
    return null;
  }
  return session;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored || "").split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function dbRequired(res) {
  if (pool && dbReady) return true;
  json(res, 503, { error: "O serviço de pagamentos está sendo configurado. Tente novamente mais tarde." });
  return false;
}

function paymentsRequired(res) {
  if (!MP_TOKEN || !pool || !dbReady) {
    json(res, 503, { error: "Pagamentos ainda não estão configurados." });
    return false;
  }
  return true;
}

async function mpRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15_000),
    headers: {
      Authorization: `Bearer ${MP_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Mercado Pago API error", response.status, data?.message || data?.error || "unknown");
    throw new Error("Não foi possível processar o Pix agora. Tente novamente.");
  }
  return data;
}

function signatureIsValid(req, paymentId) {
  if (!MP_WEBHOOK_SECRET) return false;
  const signature = String(req.headers["x-signature"] || "");
  const requestId = String(req.headers["x-request-id"] || "");
  const parts = Object.fromEntries(signature.split(",").map((part) => part.trim().split("=", 2)));
  const ts = parts.ts;
  const received = parts.v1;
  if (!ts || !received || !requestId || !paymentId) return false;
  const manifest = `id:${String(paymentId).toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", MP_WEBHOOK_SECRET).update(manifest).digest("hex");
  const a = Buffer.from(received, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

async function synchronizePayment(providerPaymentId) {
  if (!MP_TOKEN || !pool || !dbReady) throw new Error("Pagamentos indisponíveis");
  const payment = await mpRequest(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(providerPaymentId)}`);
  const orderId = String(payment.external_reference || "");
  if (!orderId) return { matched: false };
  const result = await pool.query("SELECT id, user_id, amount, currency FROM vetra_payments WHERE id = $1", [orderId]);
  const order = result.rows[0];
  if (!order) return { matched: false };
  const amountMatches = Number(payment.transaction_amount) === Number(order.amount) && Number(order.amount) === PRICE;
  const currencyMatches = payment.currency_id === "BRL" && order.currency === "BRL";
  if (!amountMatches || !currencyMatches) {
    console.error("Payment amount/currency mismatch", { orderId, providerPaymentId });
    return { matched: false };
  }
  const status = String(payment.status || "pending");
  await pool.query(
    "UPDATE vetra_payments SET provider_payment_id = $1, status = $2, updated_at = NOW() WHERE id = $3",
    [String(payment.id), status, orderId]
  );
  if (status === "approved") {
    await pool.query("UPDATE vetra_users SET license_active = TRUE, licensed_at = COALESCE(licensed_at, NOW()) WHERE id = $1", [order.user_id]);
    for (const [sessionId, session] of sessions.entries()) {
      if (session.userId === order.user_id) sessions.set(sessionId, { ...session, licenseActive: true });
    }
  }
  return { matched: true, orderId, status };
}

function serveStatic(req, res) {
  const dist = path.resolve(__dirname, "..", "dist");
  let requested;
  try { requested = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { return false; }
  const file = path.resolve(dist, `.${requested === "/" ? "/index.html" : requested}`);
  if (file !== dist && !file.startsWith(`${dist}${path.sep}`)) return false;
  let actual = file;
  if (!fs.existsSync(actual) || fs.statSync(actual).isDirectory()) actual = path.join(dist, "index.html");
  if (!fs.existsSync(actual)) return false;
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8", ".png": "image/png", ".ico": "image/x-icon" };
  res.writeHead(200, { "Content-Type": types[path.extname(actual)] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
  fs.createReadStream(actual).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || "localhost"}`); }
  catch { return json(res, 400, { error: "URL inválida" }); }

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      return json(res, 200, { ok: true, database: dbReady, paymentsConfigured: Boolean(MP_TOKEN && MP_WEBHOOK_SECRET) });
    }

    if (req.method === "POST" && url.pathname === "/api/checkout") {
      if (!paymentsRequired(res)) return;
      if (!APP_URL || !/^https:\/\//i.test(APP_URL)) return json(res, 503, { error: "A URL pública HTTPS ainda não foi configurada." });
      const body = await parseBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: "Informe um e-mail válido." });
      if (password.length < 10 || password.length > 128) return json(res, 400, { error: "A senha deve ter pelo menos 10 caracteres." });

      let user = (await pool.query("SELECT id, license_active FROM vetra_users WHERE email = $1", [email])).rows[0];
      if (user?.license_active) return json(res, 409, { error: "Este e-mail já possui uma licença ativa. Entre na sua conta." });
      if (!user) {
        const userId = crypto.randomUUID();
        const created = await pool.query(
          "INSERT INTO vetra_users(id,email,password_hash) VALUES($1,$2,$3) RETURNING id, license_active",
          [userId, email, hashPassword(password)]
        );
        user = created.rows[0];
      } else {
        await pool.query("UPDATE vetra_users SET password_hash = $1 WHERE id = $2", [hashPassword(password), user.id]);
      }

      const orderId = crypto.randomUUID();
      const checkoutToken = crypto.randomBytes(32).toString("hex");
      await pool.query(
        "INSERT INTO vetra_payments(id,user_id,status,amount,currency,checkout_token_hash) VALUES($1,$2,'creating',$3,'BRL',$4)",
        [orderId, user.id, PRICE, crypto.createHash("sha256").update(checkoutToken).digest("hex")]
      );
      try {
        const payment = await mpRequest("https://api.mercadopago.com/v1/payments", {
          method: "POST",
          headers: { "X-Idempotency-Key": orderId },
          body: JSON.stringify({
            transaction_amount: PRICE,
            description: "Licença vitalícia Vetra",
            payment_method_id: "pix",
            external_reference: orderId,
            notification_url: `${APP_URL}/api/webhooks/mercadopago`,
            payer: { email }
          })
        });
        const transaction = payment.point_of_interaction?.transaction_data;
        if (!payment.id || !transaction?.qr_code || !transaction?.qr_code_base64) throw new Error("O Mercado Pago não retornou os dados do Pix.");
        await pool.query("UPDATE vetra_payments SET provider_payment_id=$1, status=$2, updated_at=NOW() WHERE id=$3", [String(payment.id), String(payment.status || "pending"), orderId]);
        return json(res, 201, {
          orderId,
          checkoutToken,
          status: payment.status || "pending",
          qrCode: transaction.qr_code,
          qrCodeBase64: transaction.qr_code_base64,
          expiresAt: payment.date_of_expiration || null
        });
      } catch (error) {
        await pool.query("UPDATE vetra_payments SET status='error', updated_at=NOW() WHERE id=$1", [orderId]);
        throw error;
      }
    }

    if (req.method === "GET" && url.pathname === "/api/checkout/status") {
      if (!dbRequired(res)) return;
      const orderId = String(url.searchParams.get("orderId") || "");
      const token = String(url.searchParams.get("token") || "");
      if (!orderId || !token) return json(res, 400, { error: "Pedido inválido." });
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const result = await pool.query("SELECT id, provider_payment_id, status FROM vetra_payments WHERE id=$1 AND checkout_token_hash=$2", [orderId, tokenHash]);
      const order = result.rows[0];
      if (!order) return json(res, 404, { error: "Pedido não encontrado." });
      let status = order.status;
      if (order.provider_payment_id && status !== "approved") {
        try { const synced = await synchronizePayment(order.provider_payment_id); status = synced.status || status; }
        catch (error) { console.error("Payment status refresh failed", error.message); }
      }
      return json(res, 200, { status, approved: status === "approved" });
    }

    if (req.method === "POST" && url.pathname === "/api/webhooks/mercadopago") {
      if (!MP_WEBHOOK_SECRET || !MP_TOKEN || !pool || !dbReady) return json(res, 503, { error: "Webhook não configurado." });
      const body = await parseBody(req);
      const paymentId = String(body?.data?.id || url.searchParams.get("data.id") || "");
      if (!paymentId || !signatureIsValid(req, paymentId)) return json(res, 401, { error: "Assinatura inválida." });
      try { await synchronizePayment(paymentId); }
      catch (error) { console.error("Webhook payment sync failed", error.message); return json(res, 500, { error: "Falha ao validar pagamento." }); }
      return json(res, 200, { received: true });
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
      if (!dbRequired(res)) return;
      const body = await parseBody(req);
      const email = String(body.email || body.user || "").trim().toLowerCase();
      const password = String(body.password || "");
      const result = await pool.query("SELECT id,email,password_hash,license_active FROM vetra_users WHERE email=$1", [email]);
      const user = result.rows[0];
      if (!user || !verifyPassword(password, user.password_hash)) return json(res, 401, { error: "E-mail ou senha inválidos." });
      if (!user.license_active) return json(res, 403, { error: "A licença ainda não está ativa. Conclua o pagamento Pix." });
      const token = crypto.randomBytes(32).toString("hex");
      sessions.set(token, { userId: user.id, email: user.email, licenseActive: true, at: Date.now() });
      return json(res, 200, { ok: true, user: user.email }, { "Set-Cookie": cookieHeader(token, 60 * 60 * 24 * 7) });
    }

    if (req.method === "POST" && url.pathname === "/api/logout") {
      const token = cookieOf(req, COOKIE_NAME);
      if (token) sessions.delete(token);
      return json(res, 200, { ok: true }, { "Set-Cookie": cookieHeader("", 0) });
    }

    if (req.method === "GET" && url.pathname === "/api/session") {
      const token = cookieOf(req, COOKIE_NAME);
      const session = token ? sessions.get(token) : null;
      if (!session) return json(res, 401, { ok: false });
      return json(res, 200, { ok: true, user: session.email, licenseActive: session.licenseActive });
    }

    if (req.method === "POST" && url.pathname === "/api/search") {
      const session = requireLicense(req, res);
      if (!session) return;
      const body = await parseBody(req);
      const data = await deepSearch({
        query: body.query,
        location: body.location,
        onlyNoWebsite: Boolean(body.onlyNoWebsite),
        hasPhoneOnly: Boolean(body.hasPhoneOnly),
        minScore: Number(body.minScore || 0),
        limit: Math.min(60, Math.max(1, Number(body.limit || 40)))
      });
      return json(res, 200, data);
    }

    if (req.method === "POST" && url.pathname === "/api/whatsapp") {
      if (!requireLicense(req, res)) return;
      const body = await parseBody(req);
      const whatsapp = whatsappUrl(body.phone, body.name);
      if (!whatsapp) return json(res, 400, { error: "Telefone inválido." });
      return json(res, 200, { url: whatsapp });
    }

    if (url.pathname.startsWith("/api/")) return json(res, 404, { error: "Rota não encontrada." });
    if ((req.method === "GET" || req.method === "HEAD") && serveStatic(req, res)) return;
    return json(res, 404, { error: "Not found" });
  } catch (error) {
    console.error("Request failed", error.message);
    if (!res.headersSent) json(res, error.status || 500, { error: error.status ? error.message : "Erro interno. Tente novamente." });
  }
});

server.listen(PORT, "0.0.0.0", () => console.log(`Vetra listening on ${PORT}`));
initializeDatabase().catch((error) => console.error("Database initialization failed", error.message));
