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
  login: (email, password) => request("/api/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/api/logout", { method: "POST" }),
  session: () => request("/api/session"),
  search: (payload) => request("/api/search", { method: "POST", body: JSON.stringify(payload) }),
  whatsapp: (phone, name) => request("/api/whatsapp", { method: "POST", body: JSON.stringify({ phone, name }) }),
  createCheckout: (email, password) => request("/api/checkout", { method: "POST", body: JSON.stringify({ email, password }) }),
  checkoutStatus: (orderId, token) => request(`/api/checkout/status?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`)
};
