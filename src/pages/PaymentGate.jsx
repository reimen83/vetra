import { useState } from "react";
import { api } from "../api.js";
import { DEFAULT_PIX_KEY, LICENSE_PRICE, getLicenseState, setLicenseState } from "../storage.js";

export default function PaymentGate({ onLicenseActivate, notify }) {
  const [loading, setLoading] = useState(false);
  const [pixKey, setPixKey] = useState(getLicenseState().pixKey || DEFAULT_PIX_KEY);

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      notify("Chave Pix copiada");
    } catch {
      notify("Copie a chave Pix manualmente");
    }
  };

  const unlock = async () => {
    setLoading(true);
    try {
      const config = await api.licenseConfig();
      const next = config?.pixKey || pixKey;
      setPixKey(next);
      await api.activateLicense({
        confirmed: true,
        amount: LICENSE_PRICE,
        reference: `vetra-${Date.now()}`,
        customer: "demo-user",
        pixKey: next
      });
      setLicenseState({
        active: true,
        price: LICENSE_PRICE,
        pixKey: next,
        paidAt: Date.now(),
        customer: "demo-user",
        activatedAt: Date.now()
      });
      notify("Licença ativada com sucesso");
      onLicenseActivate?.();
    } catch (err) {
      notify(err.message || "Falha ao ativar a licença");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      <section className="hero">
        <div className="kicker">Acesso premium</div>
        <h1>Teste a proposta e, em seguida, libere o acesso vitalício.</h1>
        <p>O uso gratuito é limitado a demonstração. Para poder criar leads, usar WhatsApp, agenda e estúdio, é preciso pagar a licença vitalícia.</p>
      </section>

      <div className="card checkout-card">
        <div className="checkout-header">
          <div>
            <div className="kicker" style={{ marginBottom: 6 }}>Licença vitalícia</div>
            <h2 style={{ margin: 0 }}>Vetra Pro</h2>
          </div>
          <div className="price-tag">R$ 17,00</div>
        </div>

        <div className="checkout-copy">
          <p>
            Esta plataforma foi pensada como um infoproduto. A compra única libera acesso vitalício a todas as funções do sistema e impede que usuários não pagantes tenham acesso à prospecção comercial, contatos e estúdio.
          </p>
          <p>
            A versão gratuita tem finalidade de demonstração e não permite criar, salvar, entrar em contato com prospectos ou manipular o produto completo.
          </p>
        </div>

        <div className="pix-box">
          <span className="muted">Chave Pix</span>
          <div className="pix-row">
            <strong>{pixKey}</strong>
            <button type="button" className="btn secondary" onClick={copyPix}>Copiar</button>
          </div>
        </div>

        <div className="checkout-actions">
          <button type="button" className="btn" onClick={unlock} disabled={loading}>
            {loading ? "Liberando..." : "Confirmar pagamento e liberar acesso"}
          </button>
        </div>
      </div>
    </main>
  );
}
