import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import { clearAuth, getAuth, setAuth } from "./storage.js";
import Login from "./pages/Login.jsx";
import Prospect from "./pages/Prospect.jsx";
import Agenda from "./pages/Agenda.jsx";
import Studio from "./pages/Studio.jsx";

export default function App() {
  const [user, setUser] = useState(getAuth()?.user || null);
  const [checking, setChecking] = useState(true);
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "/app");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", "") || "/app");
    window.addEventListener("hashchange", onHash);
    api.session().then((s) => setUser(s.user)).catch(() => setUser(null)).finally(() => setChecking(false));
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const go = (path) => {
    window.location.hash = path;
  };

  const notify = (msg) => setToast(msg);

  const onLogin = async (u, p) => {
    const res = await api.login(u, p);
    setAuth(res.user);
    setUser(res.user);
    go("/app");
    notify("Acesso liberado");
  };

  const onLogout = async () => {
    try { await api.logout(); } catch {}
    clearAuth();
    setUser(null);
    go("/login");
  };

  const page = useMemo(() => {
    if (!user) return "login";
    if (route.startsWith("/agenda")) return "agenda";
    if (route.startsWith("/studio")) return "studio";
    return "app";
  }, [user, route]);

  if (checking) {
    return <div className="login-wrap muted">Carregando Vetra...</div>;
  }

  return (
    <div className="app-shell">
      {page !== "login" && (
        <header className="topbar">
          <div className="container topbar-inner">
            <a className="brand" href="#/app">
              <span className="mark">V</span>
              <strong>Vetra</strong>
            </a>
            <nav className="nav">
              <a className={page === "app" ? "active" : ""} href="#/app">Prospecção</a>
              <a className={page === "agenda" ? "active" : ""} href="#/agenda">Agenda</a>
              <a className={page === "studio" ? "active" : ""} href="#/studio">Estúdio</a>
              <button className="ghost" onClick={onLogout}>Sair</button>
            </nav>
          </div>
        </header>
      )}
      {page === "login" && <Login onLogin={onLogin} notify={notify} />}
      {page === "app" && <Prospect notify={notify} go={go} />}
      {page === "agenda" && <Agenda notify={notify} />}
      {page === "studio" && <Studio notify={notify} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
