function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ sender, text, intent, confidence, createdAt }) {
  const isUser = sender === "user";

  return (
    <div className={`msg-row ${isUser ? "msg-row--user" : "msg-row--bot"}`}>
      <div className="msg-bubble">{text}</div>
      <div className="msg-meta">
        {formatTime(createdAt || Date.now())}
        {!isUser && intent && intent !== "unknown" && (
          <>
            {" · "}
            <span className="msg-meta--intent">{intent}</span>
            {typeof confidence === "number" && ` (${Math.round(confidence * 100)}%)`}
          </>
        )}
      </div>
    </div>
  );
}
