import { useState } from "react";
import BotMascot from "./BotMascot.jsx";

const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available: ignore */
    }
  };

  return (
    <div className={`d-flex gap-2 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <span
          className="avatar d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 bg-secondary-subtle text-secondary"
          aria-hidden="true"
        >
          <i className="bi bi-person-fill" />
        </span>
      ) : (
        <span
          className="avatar bot-avatar d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
          aria-hidden="true"
        >
          <BotMascot variant="head" size={30} title="" />
        </span>
      )}

      <div className={`d-flex flex-column ${isUser ? "align-items-end" : "align-items-start"} message-col`}>
        <div className={`message-bubble px-3 py-2 ${isUser ? "bubble-user" : "bubble-ai"}`}>{message.text}</div>

        <div className="d-flex align-items-center gap-2 mt-1 small text-secondary">
          <span>{isUser ? "You" : "Support Agent"} · {formatTime(message.time)}</span>
          {!isUser && (
            <button
              className="btn btn-link btn-sm p-0 text-secondary text-decoration-none"
              onClick={copy}
              title="Copy reply"
            >
              <i className={`bi ${copied ? "bi-check2" : "bi-clipboard"}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
