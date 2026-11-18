import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function PaymentGate({ onPaid, notify, go }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!payment || approved) return undefined;
    let stopped = false;
    const check = async () => {
      try {
        const result = await api.checkoutStatus(payment.orderId, payment.checkoutToken);
        if (!stopped && result.approved) {
          setApproved(true);
          notify("Pagamento confirmado. Sua licença está ativa.");
          onPaid?.();
        }
      } catch {
        // Retry on the next interval; the order stays pending until verified by the server.
      }
    };
    check();
    const timer = setInterval(check, 5000);
    return () => { stopped = true; clearInterval(timer); };
  }, [payment, approved, onPaid, notify]);

  const create = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api.createCheckout(email.trim(), password);
      setPayment(result);
      notify("Pix gerado. Assim que o Mercado Pago confirmar, sua licença será liberada.");
    } catch (error) {
      notify(error.message || "Não foi possível gerar o Pix.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(payment.qrCode);
      notify("Código Pix copiado.");
    } catch {
      notify("Selecione e copie o código Pix manualmente.");
    }
  };

  return (
    <main className="container checkout-page">
      <section className="hero">
        <div className="kicker">Acesso Vetra Pro</div>
        <h1>Uma compra. Acesso vitalício.</h1>
        <p>O pagamento único de R$ 17,00 libera a licença completa: prospecção, contatos, agenda e estúdio. A licença só é ativada após confirmação do pagamento pelo Mercado Pago.</p>
      </section>

      <section className="card checkout-card">
        {!payment ? (
          <form onSubmit={create}>
            <div className="checkout-header">
              <div><div className="kicker" style={{ marginBottom: 6 }}>Licença vitalícia</div><h2 style={{ margin: 0 }}>Vetra Pro</h2></div>
              <div className="price-tag">R$ 17,00</div>
            </div>
            <p className="muted">Informe seu e-mail e crie uma senha para sua conta. A mesma combinação será usada para entrar depois que o pagamento for aprovado.</p>
            <div className="grid checkout-form">
              <label>E-mail<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label>Crie uma senha (mínimo 10 caracteres)<input type="password" autoComplete="new-password" required minLength={10} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              <button type="submit" className="btn" disabled={loading}>{loading ? "Gerando Pix..." : "Gerar Pix de R$ 17,00"}</button>
            </div>
            <div className="checkout-actions"><button type="button" className="btn secondary" onClick={() => go("/login")}>Já tenho licença — entrar</button></div>
          </form>
        ) : (
          <div>
            <div className="checkout-header"><div><div className="kicker" style={{ marginBottom: 6 }}>Pagamento Pix</div><h2 style={{ margin: 0 }}>{approved ? "Pagamento aprovado" : "Aguardando pagamento"}</h2></div><div className="price-tag">R$ 17,00</div></div>
            <p className="muted">Escaneie o QR Code no aplicativo do seu banco ou copie o código Pix. Esta página consulta a confirmação diretamente ao servidor.</p>
            {payment.qrCodeBase64 && <img className="pix-qr" src={`data:image/png;base64,${payment.qrCodeBase64}`} alt="QR Code Pix para pagamento" />}
            <label className="pix-code-label">Pix copia e cola<textarea readOnly value={payment.qrCode} rows={4} /></label>
            <div className="checkout-actions">
              <button type="button" className="btn" onClick={copyCode}>Copiar código Pix</button>
              {approved && <button type="button" className="btn secondary" onClick={() => go("/login")}>Ir para login</button>}
            </div>
            <p className="muted payment-note">Não feche a página até ver a confirmação. O acesso só é liberado após aprovação verificada no Mercado Pago.</p>
          </div>
        )}
      </section>
      <p className="checkout-login-note">Já possui conta? <a href="#/login">Fazer login</a></p>
    </main>
  );
}
