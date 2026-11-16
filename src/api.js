async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erro na requisição");
  return data;
}

export const api = {
  login: (user, password) => request("/api/login", { method: "POST", body: JSON.stringify({ user, password }) }),
  logout: () => request("/api/logout", { method: "POST" }),
  session: () => request("/api/session"),
  search: (payload) => request("/api/search", { method: "POST", body: JSON.stringify(payload) }),
  whatsapp: (phone, name) => request("/api/whatsapp", { method: "POST", body: JSON.stringify({ phone, name }) }),
  licenseConfig: () => request("/api/license/config"),
  activateLicense: (payload) => request("/api/license/activate", { method: "POST", body: JSON.stringify(payload) })
};
