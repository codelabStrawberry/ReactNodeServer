import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { sendInterviewMessage, getInterviewHistory } from "../api/chat";

export default function Chatbot({ startPayload, sessionId, disabled }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // { id, role, text, typing?, isPlaying? }
  const chatBoxRef = useRef(null);
  const speechRef = useRef(null); // 현재 utterance 참조
  const currentPlayingId = useRef(null); // 현재 재생 중인 메시지 id

  const scrollToBottom = () => {
    const el = chatBoxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!sessionId) return;
      try {
        const data = await getInterviewHistory({ sessionId });
        if (ignore) return;

        const history = data?.history || [];
        const restored = history.map((h) => ({
          id: crypto.randomUUID(),
          role: h.role === "assistant" ? "assistant" : "user",
          text: h.content,
          isPlaying: false,
        }));

        setMessages((prev) => (prev.length === 0 ? restored : prev));
      } catch (e) {
        // 세션이 만료됐거나 없으면 빈 상태 유지
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!startPayload) return;

    const readyText =
      startPayload?.readyMessage ||
      "<면접 준비 완료> 준비가 되셨으면 '시작하기'라고 메시지를 보내주세요.";

    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: readyText,
          isPlaying: false,
        },
      ];
    });
  }, [startPayload]);

  useEffect(() => {
    if (!sessionId) return;
    const key = `interview.messages:${sessionId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      } catch {}
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const key = `interview.messages:${sessionId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, sessionId]);

  const sendMessage = async () => {
    if (disabled) return;

    const text = input.trim();
    if (!text) return;

    if (!sessionId) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "세션이 없어요. 먼저 '채팅 시작'을 눌러주세요.",
          isPlaying: false,
        },
      ]);
      return;
    }

    const userMsgId = crypto.randomUUID();
    const typingId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text, isPlaying: false },
      {
        id: typingId,
        role: "assistant",
        text: "",
        typing: true,
        isPlaying: false,
      },
    ]);

    setInput("");

    try {
      const data = await sendInterviewMessage({ sessionId, message: text });
      const reply = (data?.answer ?? "").trim();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                text: reply || "답변이 비어있어요. 다시 보내주세요.",
                typing: false,
                isPlaying: false,
              }
            : m
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
                isPlaying: false,
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

  const speakText = (text, messageId) => {
    if (!window.speechSynthesis) {
      console.warn("브라우저가 Web Speech API를 지원하지 않습니다.");
      return;
    }

    // 같은 메시지가 이미 재생 중이면 정지
    if (currentPlayingId.current === messageId && speechRef.current) {
      window.speechSynthesis.cancel();
      currentPlayingId.current = null;
      speechRef.current = null;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isPlaying: false } : m))
      );
      return;
    }

    // 다른 메시지 재생 시 이전 것 정지
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.volume = 1;
    utterance.rate = 1.5;
    utterance.pitch = 1;

    speechRef.current = utterance;
    currentPlayingId.current = messageId;

    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      speechRef.current = null;
      currentPlayingId.current = null;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isPlaying: false } : m))
      );
    };

    // 재생 시작 즉시 상태 업데이트
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isPlaying: true } : m))
    );
  };

  return (
    <Container>
      <ChatBox ref={chatBoxRef}>
        {messages.map((m) => (
          <Bubble
            key={m.id}
            className={`${m.role} ${m.typing ? "typing" : ""}`}
          >
            <BbRole>
              <strong>{m.role === "user" ? "나: " : "AI: "}</strong>
            </BbRole>

            {m.typing ? (
              <span className="dots">
                <span />
                <span />
                <span />
              </span>
            ) : (
              <>
                <BbContent>{m.text}</BbContent>

                {m.role === "assistant" && (
                  <SpeakButton
                    onClick={() => speakText(m.text, m.id)}
                    aria-label={m.isPlaying ? "음성 정지" : "음성 재생"}
                    $isPlaying={m.isPlaying}
                  >
                    {m.isPlaying ? "⏹" : "▶️"}
                  </SpeakButton>
                )}
              </>
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
  display: flex;
  gap: 8px;

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

  &.typing .dots {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  &.typing .dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.25;
    animation: blink 1s infinite;
  }

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

const BbRole = styled.div``;

const BbContent = styled.div``;

const SpeakButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: ${({ $isPlaying }) => ($isPlaying ? "#ff4d4f" : "inherit")};
  opacity: 0.7;
  transition: all 0.2s;
  margin-top: auto;
  padding: 4px;

  &:hover {
    opacity: 1;
    transform: scale(1.15);
  }

  &:focus {
    outline: none;
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
