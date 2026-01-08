// src/api/chat.js
export async function startInterview({ url, file, sessionId }) {
  const formData = new FormData();
  formData.append("url", url);
  formData.append("file", file);
  if (sessionId) formData.append("session_id", sessionId);

  const res = await fetch(`${import.meta.env.VITE_AI_URL}/chat/start`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to start interview");
  }

  return res.json();
}
