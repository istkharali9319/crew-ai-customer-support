import { useEffect, useRef, useState } from "react";

const MAX_LENGTH = 1000; // same limit as the backend

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Grow the textarea with its content, up to about 6 lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  // Put the cursor back in the box when the agent finishes answering.
  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled]);

  const submit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  // Enter sends, Shift+Enter adds a new line.
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) submit(e);
  };

  return (
    <div className="chat-input-area border-top bg-white">
      <form className="container py-3" style={{ maxWidth: 820 }} onSubmit={submit}>
        <div className="chat-input d-flex align-items-end gap-2 border rounded-4 bg-light px-3 py-2">
          <textarea
            ref={textareaRef}
            className="form-control border-0 bg-transparent shadow-none"
            rows={1}
            placeholder="Ask about your order, e.g. Where is my order 101?"
            value={text}
            maxLength={MAX_LENGTH}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Message"
          />
          <button
            type="submit"
            className="btn btn-primary rounded-circle send-btn flex-shrink-0"
            disabled={disabled || !text.trim()}
            aria-label="Send message"
          >
            {disabled ? (
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            ) : (
              <i className="bi bi-send-fill" />
            )}
          </button>
        </div>
        <div className="d-flex justify-content-between small text-secondary mt-2 px-2">
          <span className="d-none d-sm-inline">Enter to send · Shift + Enter for a new line</span>
          <span className="ms-auto">{text.length}/{MAX_LENGTH}</span>
        </div>
      </form>
    </div>
  );
}
