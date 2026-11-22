function StatusBadge({ isOnline }) {
  if (isOnline === null) {
    return (
      <span className="badge text-bg-secondary">
        <span className="spinner-grow spinner-grow-sm me-1" style={{ width: ".5rem", height: ".5rem" }} />
        Checking…
      </span>
    );
  }
  return isOnline ? (
    <span className="badge text-bg-success">
      <i className="bi bi-circle-fill me-1" style={{ fontSize: ".5rem" }} />
      Agent online
    </span>
  ) : (
    <span className="badge text-bg-danger">
      <i className="bi bi-circle-fill me-1" style={{ fontSize: ".5rem" }} />
      Backend offline
    </span>
  );
}

export default function Sidebar({ isOpen, onClose, onNewChat, onClear, hasMessages, isOnline }) {
  return (
    <>
      {/* On large screens this is a fixed column. On small screens it slides in (Bootstrap offcanvas styles). */}
      <aside
        className={`sidebar offcanvas-lg offcanvas-start text-bg-dark d-flex flex-column ${isOpen ? "show" : ""}`}
        aria-label="Sidebar"
      >
        <div className="d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-icon d-inline-flex align-items-center justify-content-center rounded-3 bg-primary">
              <i className="bi bi-headset" />
            </span>
            <div className="lh-sm">
              <div className="fw-semibold">Support Assistant</div>
              <small className="text-white-50">CrewAI single agent</small>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-light d-lg-none" onClick={onClose} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="px-3 d-grid gap-2">
          <button className="btn btn-primary" onClick={onNewChat}>
            <i className="bi bi-plus-lg me-2" />
            New chat
          </button>
          <button className="btn btn-outline-light" onClick={onClear} disabled={!hasMessages}>
            <i className="bi bi-trash3 me-2" />
            Clear conversation
          </button>
        </div>

        <div className="px-3 mt-4">
          <div className="text-uppercase small text-white-50 fw-semibold mb-2">I can help with</div>
          <ul className="list-unstyled small text-white-50 mb-0">
            <li className="mb-2"><i className="bi bi-truck me-2" />Tracking an order</li>
            <li className="mb-2"><i className="bi bi-box-seam me-2" />Checking delivery status</li>
            <li className="mb-2"><i className="bi bi-search me-2" />Finding an order by ID</li>
          </ul>
        </div>

        <div className="mt-auto p-3 border-top border-secondary d-flex align-items-center justify-content-between">
          <small className="text-white-50">Status</small>
          <StatusBadge isOnline={isOnline} />
        </div>
      </aside>

      {/* Dark overlay behind the sidebar on small screens */}
      {isOpen && <div className="offcanvas-backdrop fade show d-lg-none" onClick={onClose} />}
    </>
  );
}
