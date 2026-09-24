import { useEffect, useRef, useState } from "react";
import MessageBubble from "./components/MessageBubble.jsx";
import TypingIndicator from "./components/TypingIndicator.jsx";
import ChatInput from "./components/ChatInput.jsx";
import { sendMessage, fetchHistory, clearSession } from "./api.js";
import "./styles/App.css";

const SESSION_KEY = "ai_assistant_session_id";

function getOrCreateSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const SUGGESTIONS = ["What can you do?", "Tell me a joke", "What time is it?", "Hello!"];

export default function App() {
  const [sessionId] = useState(getOrCreateSessionId);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchHistory(sessionId)
      .then((data) => setMessages(data.messages || []))
      .catch(() => setConnectionError(true))
      .finally(() => setLoadingHistory(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    setConnectionError(false);
    const userMsg = { sender: "user", text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const data = await sendMessage(sessionId, text);
      const botMsg = {
        sender: "bot",
        text: data.reply,
        intent: data.intent,
        confidence: data.confidence,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setConnectionError(true);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I couldn't reach the server. Make sure the backend is running on port 5000.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearSession(sessionId);
    } catch {
      /* best-effort */
    }
    setMessages([]);
  };

  return (
    <div className="app-shell">
      <header className="chat-header">
        <div className="chat-header__left">
          <span className="status-dot" aria-hidden="true"></span>
          <div>
            <div className="chat-header__title">AI VIRTUAL ASSISTANT</div>
            <div className="chat-header__session">session: {sessionId.slice(0, 18)}</div>
          </div>
        </div>
        <button className="chat-header__clear" onClick={handleClear}>
          Clear chat
        </button>
      </header>

      {connectionError && (
        <div className="conn-banner">⚠ Connection issue — check that the API server is running</div>
      )}

      <div className="message-list" ref={scrollRef}>
        {!loadingHistory && messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__prompt">$ waiting for input_</div>
            Ask me something to get started.
            <div className="suggestion-chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} {...m} />
        ))}

        {isTyping && <TypingIndicator />}
      </div>

      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
