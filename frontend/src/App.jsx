import { useCallback, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import ChatInput from "./components/ChatInput.jsx";
import ErrorToast from "./components/ErrorToast.jsx";
import { checkHealth, sendMessage } from "./services/chatService.js";

let nextId = 1;
const makeMessage = (role, text) => ({ id: nextId++, role, text, time: new Date() });

export default function App() {
  const [messages, setMessages] = useState([]); // [{ id, role: "user" | "assistant", text, time }]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // text shown in the error toast
  const [isOnline, setIsOnline] = useState(null); // null = checking, true / false
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile only

  // Check the backend once when the page loads, then every 30 seconds.
  useEffect(() => {
    const ping = () => checkHealth().then(setIsOnline);
    ping();
    const timer = setInterval(ping, 30_000);
    return () => clearInterval(timer);
  }, []);

  const handleSend = useCallback(
    async (text) => {
      const message = text.trim();
      if (!message || isLoading) return;

      setError(null);
      setMessages((prev) => [...prev, makeMessage("user", message)]);
      setIsLoading(true);

      try {
        const reply = await sendMessage(message); // the real CrewAI agent answers
        setMessages((prev) => [...prev, makeMessage("assistant", reply)]);
        setIsOnline(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  // Stable function so the toast's auto-hide timer isn't restarted on every render.
  const closeError = useCallback(() => setError(null), []);

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell d-flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onClear={handleNewChat}
        hasMessages={messages.length > 0}
        isOnline={isOnline}
      />

      <main className="d-flex flex-column flex-grow-1 min-w-0">
        {/* Top bar, only on phones and tablets */}
        <header className="d-flex d-lg-none align-items-center justify-content-between border-bottom px-3 py-2 bg-white">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <i className="bi bi-list fs-5" />
          </button>
          <span className="fw-semibold">
            <i className="bi bi-headset text-primary me-2" />
            Support Assistant
          </span>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleNewChat} aria-label="New chat">
            <i className="bi bi-pencil-square fs-5" />
          </button>
        </header>

        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          isOnline={isOnline}
          onExampleClick={handleSend}
        />

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </main>

      <ErrorToast message={error} onClose={closeError} />
    </div>
  );
}
