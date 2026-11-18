import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import { clearAuth, getAuth, setAuth } from "./storage.js";
import Login from "./pages/Login.jsx";
import PaymentGate from "./pages/PaymentGate.jsx";
import Prospect from "./pages/Prospect.jsx";
import Agenda from "./pages/Agenda.jsx";
import Studio from "./pages/Studio.jsx";

export default function App() {
  const [user, setUser] = useState(getAuth()?.user || null);
  const [licensed, setLicensed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "/checkout");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", "") || "/checkout");
    window.addEventListener("hashchange", onHash);
    api.session().then((session) => {
      setUser(session.user);
      setLicensed(Boolean(session.licenseActive));
    }).catch(() => {
      setUser(null);
      setLicensed(false);
    }).finally(() => setChecking(false));
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const go = (path) => { window.location.hash = path; };
  const notify = (message) => setToast(message);

  const onPaid = () => {
    setLicensed(true);
    go("/login");
  };

  const onLogin = async (email, password) => {
    const result = await api.login(email, password);
    setAuth(result.user);
    setUser(result.user);
    setLicensed(true);
    go("/app");
    notify("Acesso liberado");
  };

  const onLogout = async () => {
    try { await api.logout(); } catch {}
    clearAuth();
    setUser(null);
    setLicensed(false);
    go("/login");
  };

  const page = useMemo(() => {
    if (user && licensed) {
      if (route.startsWith("/agenda")) return "agenda";
      if (route.startsWith("/studio")) return "studio";
      return "app";
    }
    return route.startsWith("/login") ? "login" : "checkout";
  }, [user, licensed, route]);

  if (checking) return <div className="login-wrap muted">Carregando Vetra...</div>;

  return (
    <div className="app-shell">
      {page !== "checkout" && page !== "login" && (
        <header className="topbar">
          <div className="container topbar-inner">
            <a className="brand" href="#/app"><span className="mark">V</span><strong>Vetra</strong></a>
            <nav className="nav">
              <a className={page === "app" ? "active" : ""} href="#/app">Prospecção</a>
              <a className={page === "agenda" ? "active" : ""} href="#/agenda">Agenda</a>
              <a className={page === "studio" ? "active" : ""} href="#/studio">Estúdio</a>
              <button className="ghost" onClick={onLogout}>Sair</button>
            </nav>
          </div>
        </header>
      )}
      {page === "checkout" && <PaymentGate onPaid={onPaid} notify={notify} go={go} />}
      {page === "login" && <Login onLogin={onLogin} notify={notify} go={go} />}
      {page === "app" && <Prospect notify={notify} go={go} />}
      {page === "agenda" && <Agenda notify={notify} />}
      {page === "studio" && <Studio notify={notify} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
