import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deepSearch, whatsappUrl } from "./search.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const USER = process.env.VETRA_USER || "creators";
const PASS = process.env.VETRA_PASS || "creators2026";
const sessions = new Map();

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
    req.on("error", reject);
  });
}

function cookieOf(req, name) {
  const raw = req.headers.cookie || "";
  const found = raw.split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

function requireAuth(req, res) {
  const token = cookieOf(req, "vetra_session") || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token || !sessions.has(token)) {
    json(res, 401, { error: "Sessão expirada. Entre novamente." });
    return false;
  }
  return true;
}

function serveStatic(req, res) {
  const dist = path.join(__dirname, "..", "dist");
  const urlPath = req.url.split("?")[0];
  let file = path.join(dist, urlPath === "/" ? "index.html" : urlPath);
  if (!file.startsWith(dist)) return false;
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(dist, "index.html");
  }
  if (!fs.existsSync(file)) return false;
  const ext = path.extname(file);
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };
  const data = fs.readFileSync(file);
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  res.end(data);
  return true;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  try {
    if (req.method === "POST" && url.pathname === "/api/login") {
      const body = await parseBody(req);
      const user = String(body.user || body.username || "").trim();
      const pass = String(body.password || "").trim();
      if (user === USER && pass === PASS) {
        const token = crypto.randomUUID();
        sessions.set(token, { user, at: Date.now() });
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Set-Cookie": `vetra_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        });
        return res.end(JSON.stringify({ ok: true, user }));
      }
      return json(res, 401, { error: "Usuário ou senha inválidos" });
    }

    if (req.method === "POST" && url.pathname === "/api/logout") {
      const token = cookieOf(req, "vetra_session");
      if (token) sessions.delete(token);
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": "vetra_session=; Path=/; Max-Age=0"
      });
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === "GET" && url.pathname === "/api/session") {
      const token = cookieOf(req, "vetra_session");
      if (!token || !sessions.has(token)) return json(res, 401, { ok: false });
      return json(res, 200, { ok: true, user: sessions.get(token).user });
    }

    if (req.method === "POST" && url.pathname === "/api/search") {
      if (!requireAuth(req, res)) return;
      const body = await parseBody(req);
      const data = await deepSearch({
        query: body.query,
        location: body.location,
        onlyNoWebsite: Boolean(body.onlyNoWebsite),
        hasPhoneOnly: Boolean(body.hasPhoneOnly),
        minScore: Number(body.minScore || 0),
        limit: Math.min(60, Number(body.limit || 40))
      });
      return json(res, 200, data);
    }

    if (req.method === "POST" && url.pathname === "/api/whatsapp") {
      if (!requireAuth(req, res)) return;
      const body = await parseBody(req);
      const urlWa = whatsappUrl(body.phone, body.name);
      if (!urlWa) return json(res, 400, { error: "Telefone inválido" });
      return json(res, 200, { url: urlWa });
    }

    if (url.pathname.startsWith("/api/")) {
      return json(res, 404, { error: "Rota não encontrada" });
    }

    if (serveStatic(req, res)) return;
    json(res, 404, { error: "Not found" });
  } catch (err) {
    json(res, 500, { error: err.message || "Erro interno" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vetra API on :${PORT}`);
});
