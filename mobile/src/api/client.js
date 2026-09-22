import { API_BASE_URL } from "../constants/config";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data.error;
    throw err;
  }
  return data;
}

export const api = {
  demoLogin: (name) => request("/auth/demo-login", { method: "POST", body: { name } }),
  getCompetition: (id) => request(`/competitions/${id}`, { auth: true }),
  register: (id) => request(`/competitions/${id}/register`, { method: "POST", auth: true }),
  submitEntry: (id, fileUrl, fileType) =>
    request(`/competitions/${id}/submissions`, { method: "POST", auth: true, body: { fileUrl, fileType } }),
  getWinners: (id) => request(`/competitions/${id}/winners`),
};
