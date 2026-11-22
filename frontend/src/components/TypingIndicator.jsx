export default function TypingIndicator() {
  return (
    <div className="d-flex gap-2 mb-4" role="status" aria-live="polite">
      <span
        className="avatar d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
        aria-hidden="true"
      >
        <i className="bi bi-robot" />
      </span>
      <div className="message-bubble bubble-ai px-3 py-2 d-flex align-items-center gap-2">
        <span className="typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <small className="text-secondary">Checking your order…</small>
      </div>
    </div>
  );
}
