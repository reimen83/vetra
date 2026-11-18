import { useState } from "react";

export default function Login({ onLogin, notify, go }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try { await onLogin(email.trim(), password); }
    catch (error) { notify(error.message || "Falha no login"); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <div className="kicker">Acesso à licença</div>
        <h1>Vetra</h1>
        <p className="muted">Entre com o e-mail e a senha usados ao gerar seu Pix. O acesso é liberado quando o pagamento for aprovado.</p>
        <div className="grid" style={{ marginTop: 18 }}>
          <input type="email" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
          <input placeholder="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          <button className="btn" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          <button type="button" className="btn secondary" onClick={() => go("/checkout")}>Comprar licença — R$ 17,00</button>
        </div>
      </form>
    </div>
  );
}
