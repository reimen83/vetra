import { useState } from "react";

export default function Login({ onLogin, notify }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(user.trim(), password);
    } catch (err) {
      notify(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <div className="kicker">Acesso restrito</div>
        <h1>Vetra</h1>
        <p className="muted">Prospecção B2B com busca profunda, ranking de oportunidade e funil comercial.</p>
        <div className="grid" style={{ marginTop: 18 }}>
          <input placeholder="Usuário" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" required />
          <input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          <button className="btn" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        </div>
      </form>
    </div>
  );
}
