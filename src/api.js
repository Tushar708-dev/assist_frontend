// In local dev this stays "/api" (Vite proxy handles it).
// In production (Vercel), set VITE_API_URL to your deployed backend URL,
// e.g. https://your-app.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }

  return res.json();
}

export const sendMessage = (sessionId, message, userId = "guest") =>
  request("/chat", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      message,
      userId,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });

export const fetchHistory = (sessionId) => request(`/history/${sessionId}`);

export const clearSession = (sessionId) =>
  request(`/history/${sessionId}`, { method: "DELETE" });

export const checkHealth = () => request("/health");
