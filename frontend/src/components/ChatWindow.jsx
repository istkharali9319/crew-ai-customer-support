import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import { API_BASE_URL } from "../services/chatService.js";

const EXAMPLES = [
  { icon: "bi-geo-alt", text: "Where is my order 101?" },
  { icon: "bi-check2-circle", text: "Is my order 102 delivered?" },
  { icon: "bi-search", text: "Find order 105." },
  { icon: "bi-question-circle", text: "What is my order status?" },
];

function WelcomeScreen({ isOnline, onExampleClick }) {
  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <div className="text-center mb-4">
        <span className="welcome-icon d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary mb-3">
          <i className="bi bi-headset" />
        </span>
        <h1 className="h3 fw-semibold">How can I help you today?</h1>
        <p className="text-secondary mb-0">
          Ask me about any order. Give me your order ID and I'll look it up.
        </p>
      </div>

      {isOnline === false && (
        <div className="alert alert-warning d-flex align-items-start gap-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill mt-1" />
          <div>
            The support server at <code>{API_BASE_URL}</code> is not responding. Start the backend, then
            try again.
          </div>
        </div>
      )}

      <div className="row g-3">
        {EXAMPLES.map((example) => (
          <div className="col-12 col-sm-6" key={example.text}>
            <button
              className="card example-card w-100 h-100 text-start border shadow-sm"
              onClick={() => onExampleClick(example.text)}
            >
              <div className="card-body d-flex align-items-center gap-3">
                <i className={`bi ${example.icon} fs-5 text-primary`} />
                <span>{example.text}</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isLoading, isOnline, onExampleClick }) {
  const bottomRef = useRef(null);

  // Auto-scroll to the newest message (and to the typing indicator while waiting).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  return (
    <div className="chat-window flex-grow-1 overflow-auto">
      {messages.length === 0 && !isLoading ? (
        <WelcomeScreen isOnline={isOnline} onExampleClick={onExampleClick} />
      ) : (
        <div className="container py-4" style={{ maxWidth: 820 }}>
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
