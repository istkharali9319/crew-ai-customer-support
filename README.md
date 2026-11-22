# Customer Support AI Agent: CrewAI + FastAPI + React

A single CrewAI agent answers order-status questions. FastAPI exposes it as an API, and a React + Bootstrap 5 chat app talks to that API.

```
customer-support/
├── backend/                     Python: the AI agent + API
│   ├── config/agent.json        agent role/goal/backstory, LLM model, task text
│   ├── data/orders.json         sample orders (101–105)
│   ├── tools/order_tool.py      custom CrewAI tool: Order Status Checker
│   ├── main.py                  builds Agent + Task + Crew → ask_support_agent()  (+ terminal chat)
│   ├── api.py                   FastAPI: /api/chat, /api/health, CORS, error handling
│   ├── requirements.txt
│   ├── .env.example             copy to .env (holds the OpenAI key; never sent to React)
│   └── .venv/                   Python virtual environment
│
└── frontend/                    React (Vite) + Bootstrap 5 + Bootstrap Icons + Axios
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx          app name, new chat, clear, backend status
    │   │   ├── ChatWindow.jsx       welcome screen + message list + auto-scroll
    │   │   ├── ChatMessage.jsx      one user/AI message bubble
    │   │   ├── ChatInput.jsx        rounded input, Enter to send, send button
    │   │   ├── TypingIndicator.jsx  "agent is thinking" dots
    │   │   └── ErrorToast.jsx       Bootstrap toast for API errors
    │   ├── services/chatService.js  Axios calls to the backend
    │   ├── App.jsx                  page layout + chat state
    │   ├── main.jsx                 imports Bootstrap CSS/Icons, mounts React
    │   └── index.css                small custom CSS on top of Bootstrap
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env.example             VITE_API_BASE_URL (no secrets here)
```

---

## 1. Install

Requirements: Python 3.10–3.13 and Node.js 18+.

**Backend**

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # then put your OPENAI_API_KEY in .env
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env                 # VITE_API_BASE_URL = where the backend runs
```

## 2. Run (two terminals)

```bash
# Terminal 1: backend
cd backend && source .venv/bin/activate
uvicorn api:app --reload --port 8000
```

```bash
# Terminal 2: frontend
cd frontend
npm run dev
```

Open **http://localhost:5174**. API docs are at http://localhost:8000/docs.

> **Ports on this machine:** another app already uses port 8000, so the backend runs on **8001** here.
> `frontend/.env` points to `http://localhost:8001`, so start the backend with `--port 8001`.
> The frontend uses port **5174** (set in `vite.config.js`) because 5173 is taken too.
> If you change a port, update `VITE_API_BASE_URL` (frontend) or `FRONTEND_ORIGINS` (backend) to match.

You can also chat with the agent in the terminal, without the web app: `cd backend && python main.py`

## 3. API

### `GET /api/health`
```json
{ "status": "healthy" }
```

### `POST /api/chat`
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Where is my order 101?"}'
```
Success:
```json
{
  "success": true,
  "reply": "Hello Aarav! Your order 101 for the Wireless Headphones has been shipped. It was ordered on November 15, 2026, and is expected to be delivered by November 24, 2026. You can track your order using the tracking number BD123456789IN with BlueDart."
}
```
Errors always have the same shape:
```json
{ "success": false, "error": "Message must not be empty." }
```

| Status | When |
|---|---|
| 422 | Empty message, missing `message` field, or more than 1000 characters |
| 500 | Missing API key or broken `agent.json` |
| 502 | The LLM provider or network failed |

---

## 4. Architecture

```
┌──────────────── Browser ────────────────┐        ┌──────────────── Python backend ─────────────────────┐
│ React (localhost:5174)                  │        │ FastAPI  api.py  (localhost:8000)                    │
│                                         │  HTTP  │                                                      │
│ ChatInput ──► App.handleSend ──► chatService ──POST /api/chat──► chat() ──► ask_support_agent()  main.py  │
│                                         │  JSON  │                               │                      │
│ ChatWindow ◄── messages state ◄─────────┼────────┤ {"success":true,"reply":...}  ▼                      │
│ TypingIndicator while waiting           │        │                Crew.kickoff ─► Agent (LLM) ──► OpenAI │
│ ErrorToast on failure                   │        │                                  │ needs data?        │
└─────────────────────────────────────────┘        │                                  ▼                    │
                                                   │                 OrderStatusTool ─► data/orders.json   │
   No API key in the browser.                      │   OPENAI_API_KEY stays in backend/.env               │
                                                   └──────────────────────────────────────────────────────┘
```

### What happens when you press Send

1. **ChatInput** passes the text to `App.handleSend`.
2. **App** adds your message to the list and shows the **TypingIndicator**.
3. **chatService.sendMessage** sends `POST /api/chat {"message": "..."}` with Axios to `VITE_API_BASE_URL`.
4. **CORS**: the browser checks that the backend allows `http://localhost:5174`. `FRONTEND_ORIGINS` controls this.
5. **api.py** checks the body, then calls `ask_support_agent(message)` from **main.py**. This is the same agent the terminal chat uses, not a copy.
6. **main.py** loads `agent.json`, builds the one Agent with `OrderStatusTool`, and runs `crew.kickoff(inputs={"question": message})`.
7. The **LLM** decides whether it needs the tool. If the message has an order ID, it calls **OrderStatusTool**, which reads `orders.json`.
8. The LLM writes the reply. `api.py` returns `{"success": true, "reply": "..."}`.
9. **App** adds the reply to the list, **ChatWindow** scrolls down, and the input box gets focus back.
10. On any failure, `chatService` turns it into one readable sentence and **ErrorToast** shows it.

### Why the backend is split into `main.py` and `api.py`
- `main.py` = the AI agent. It doesn't know about HTTP.
- `api.py` = the web layer. It doesn't know how the agent works, it just calls `ask_support_agent()`.

So you can change the UI or the API without touching the agent, and the other way round.

### Security
- The OpenAI key is only in `backend/.env`. React only knows the backend URL.
- Variables in `frontend/.env` that start with `VITE_` are put into the browser bundle, so never put secrets there.
- CORS only allows the React dev server's address.
- Both `.env` files are in `.gitignore`.

---

## 5. Concepts (from the agent project)

- **AI Agent**: an LLM with a role, a goal and tools. It decides what to do, acts, and then answers.
- **LLM**: the language model that understands the question and writes the reply. It doesn't know your data. The tool does.
- **Tool**: a Python function the agent can ask to run (`OrderStatusTool` → `orders.json`).
- **Task / Crew**: the Task is the job for this message, with `{question}` filled in. The Crew runs the agent on the task.
- **When is the tool called?** The LLM decides, based on the tool description, backstory and task steps. No ID means it asks the customer for one.

## 6. Example questions
- Where is my order 101?
- Is my order 102 delivered?
- Find order 105.
- What is my order status? *(the agent asks for the ID)*
- Where is order 999? *(not found)*
