async function parseJsonOrThrow(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }
  if (!res.ok) {
    const msg =
      data?.detail ||
      data?.message ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

// ✅ ChatPage.jsx에서 호출: url + pdf + sessionId → POST /chat/start
// sessionId는 이제 서버에서 생성하므로, 선택적으로 보내거나 생략 가능
export async function startInterview({ url, file, sessionId }) {
  const form = new FormData();
  form.append("url", url);
  form.append("file", file); // UploadFile
  if (sessionId) form.append("session_id", sessionId); // 서버가 무시할 수 있음

  const res = await fetch(`${import.meta.env.VITE_AI_URL}/chat/start`, {
    method: "POST",
    body: form,
  });

  return await parseJsonOrThrow(res);
}

// ✅ Chatbot.jsx에서 호출: sessionId + message → POST /chat/message
export async function sendInterviewMessage({ sessionId, message }) {
  const res = await fetch(`${import.meta.env.VITE_AI_URL}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
  });

  return await parseJsonOrThrow(res);
}
