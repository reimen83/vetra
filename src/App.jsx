import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import { clearAuth, getAuth, isLicenseActive, setAuth, setLicenseState } from "./storage.js";
import Login from "./pages/Login.jsx";
import PaymentGate from "./pages/PaymentGate.jsx";
import Prospect from "./pages/Prospect.jsx";
import Agenda from "./pages/Agenda.jsx";
import Studio from "./pages/Studio.jsx";

export default function App() {
  const [user, setUser] = useState(getAuth()?.user || null);
  const [licensed, setLicensed] = useState(isLicenseActive());
  const [checking, setChecking] = useState(true);
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "/checkout");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", "") || (isLicenseActive() ? "/login" : "/checkout"));
    window.addEventListener("hashchange", onHash);
    api.session()
      .then((s) => {
        const active = Boolean(s.licenseActive || isLicenseActive());
        setUser(s.user || null);
        setLicensed(active);
      })
      .catch(() => {
        setUser(null);
        setLicensed(false);
      })
      .finally(() => setChecking(false));
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

  const onLicenseActivate = () => {
    setLicensed(true);
    setLicenseState({ active: true, paidAt: Date.now(), activatedAt: Date.now() });
    go("/login");
  };

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
    if (!licensed) return "checkout";
    if (!user) return "login";
    if (route.startsWith("/agenda")) return "agenda";
    if (route.startsWith("/studio")) return "studio";
    return "app";
  }, [licensed, user, route]);

  if (checking) {
    return <div className="login-wrap muted">Carregando Vetra...</div>;
  }

  return (
    <div className="app-shell">
      {page !== "checkout" && page !== "login" && (
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
      {page === "checkout" && <PaymentGate onLicenseActivate={onLicenseActivate} notify={notify} />}
      {page === "login" && <Login onLogin={onLogin} notify={notify} />}
      {page === "app" && <Prospect notify={notify} go={go} />}
      {page === "agenda" && <Agenda notify={notify} />}
      {page === "studio" && <Studio notify={notify} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
