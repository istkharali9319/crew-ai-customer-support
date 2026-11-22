import { useEffect } from "react";

// A Bootstrap toast controlled by React state (no Bootstrap JavaScript needed).
export default function ErrorToast({ message, onClose }) {
  // Hide automatically after 8 seconds.
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3">
      <div className="toast show align-items-center text-bg-danger border-0" role="alert" aria-live="assertive">
        <div className="d-flex">
          <div className="toast-body d-flex gap-2">
            <i className="bi bi-exclamation-octagon-fill" />
            <span>{message}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={onClose}
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
}
