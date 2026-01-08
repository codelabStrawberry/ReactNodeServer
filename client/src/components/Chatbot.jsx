import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import axios from "axios";

export default function Chatbot({ startPayload, sessionId, disabled }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // { id, role: 'user'|'assistant', text }
  const chatBoxRef = useRef(null);

  const systemPrompt = startPayload?.systemPrompt;

  const scrollToBottom = () => {
    const el = chatBoxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!sessionId) return;

    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_AI_URL}/chat-list/${sessionId}`
        );
        const list = res.data?.list ?? [];
        setMessages(
          list.map((m) => ({
            id: crypto.randomUUID(),
            role: m.role === "assistant" ? "assistant" : "user",
            text: m.content,
          }))
        );
      } catch (e) {
        console.error(e);
        setMessages([]);
      }
    })();
  }, [sessionId]);

  useEffect(() => {
    if (!startPayload) return;
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "<면접 준비 완료> 준비가 되셨으면 '준비완료'라고 메시지를 보내주세요.",
        },
      ];
    });
  }, [startPayload]);

  const sendMessage = async () => {
    if (disabled) return;
    const text = input.trim();
    if (!text) return;

    const userMsgId = crypto.randomUUID();
    const typingId = crypto.randomUUID();

    // 1) UI에 user + typing 먼저 표시 (여기서만 추가)
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text },
      { id: typingId, role: "assistant", text: "", typing: true },
    ]);

    setInput("");

    try {
      // 2) FastAPI /chat 호출
      const res = await axios.post(`${import.meta.env.VITE_AI_URL}/chat`, {
        session_id: sessionId,
        message: text,
        system_prompt: systemPrompt,
      });

      const reply = res.data?.response ?? "";

      // 3) typing bubble을 실제 답변으로 교체
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId ? { ...m, text: reply, typing: false } : m
        )
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                text: "에러가 발생했어요. 다시 시도해 주세요.",
                typing: false,
              }
            : m
        )
      );
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Container>
      <ChatBox ref={chatBoxRef}>
        {messages.map((m) => (
          <Bubble
            key={m.id}
            className={`${m.role} ${m.typing ? "typing" : ""}`}
          >
            <strong>{m.role === "user" ? "나: " : "AI: "}</strong>
            {m.typing ? (
              <span className="dots">
                <span />
                <span />
                <span />
              </span>
            ) : (
              m.text
            )}
          </Bubble>
        ))}
      </ChatBox>

      <InputRow>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            disabled ? "먼저 면접 시작을 눌러 주세요." : "메시지를 입력하세요."
          }
          disabled={disabled}
        />
        <SendButton type="button" onClick={sendMessage} disabled={disabled}>
          전송
        </SendButton>
      </InputRow>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  padding: 16px;
`;

const ChatBox = styled.div`
  width: 100%;
  height: 600px;
  border: 2px solid var(--strawberry-color);
  border-radius: 12px;
  background: #f9f9f9ff;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Bubble = styled.div`
  max-width: 80%;
  border-radius: 10px;
  padding: 10px 12px;
  line-height: 1.4;

  &.user {
    align-self: flex-end;
    background: var(--strawberry-color);
    color: white;
  }

  &.assistant {
    align-self: flex-start;
    background: #e2e2e2;
    color: #222;
  }

  strong {
    margin-right: 6px;
  }
  /* typing dots */
  &.typing .dots {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  &.typing .dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor; /* 글자색 따라감 */
    opacity: 0.25;
    animation: blink 1s infinite;
  }

  /* 3개의 점이 순서대로 깜빡이게 */
  &.typing .dots span:nth-of-type(2) {
    animation-delay: 0.2s;
  }
  &.typing .dots span:nth-of-type(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0%,
    80%,
    100% {
      opacity: 0.25;
    }
    40% {
      opacity: 1;
    }
  }
`;

const InputRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: stretch;
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  resize: vertical;

  border: 2px solid var(--strawberry-color);
  border-radius: 12px;
  padding: 10px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--strawberry-color);
  }
`;

const SendButton = styled.button`
  width: 90px;
  border: none;
  border-radius: 12px;
  background: var(--strawberry-color);
  color: white;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);

  &:hover {
    opacity: 0.9;
  }
`;
