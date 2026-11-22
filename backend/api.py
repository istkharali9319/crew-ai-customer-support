"""FastAPI layer that lets the React frontend talk to the Customer Support Agent.

It does not build its own agent: it calls ask_support_agent() from main.py.

Run:  uvicorn api:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from main import ask_support_agent  # importing main also loads .env

app = FastAPI(
    title="Customer Support Agent API",
    description="A single CrewAI agent that answers order-status questions.",
    version="2.0.0",
)

# ---------------------------------------------------------------------------
# CORS: which websites (origins) may call this API from a browser.
# The React dev server runs on http://localhost:5174 (see frontend/vite.config.js).
# ---------------------------------------------------------------------------
frontend_origins = os.getenv(
    "FRONTEND_ORIGINS", "http://localhost:5174,http://127.0.0.1:5174"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in frontend_origins.split(",") if o.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ---------------------------------------------------------------------------
# Request / response shapes
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str = Field(..., max_length=1000, examples=["Where is my order 101?"])


class ChatResponse(BaseModel):
    success: bool
    reply: str


def error_response(status_code: int, message: str) -> JSONResponse:
    """Every error has the same shape, so React can always read `error`."""
    return JSONResponse(status_code=status_code, content={"success": False, "error": message})


@app.exception_handler(RequestValidationError)
def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    return error_response(422, "Please send a JSON body like {\"message\": \"...\"} (max 1000 characters).")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health() -> dict:
    return {"status": "healthy"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    # A plain `def` endpoint: FastAPI runs it in a worker thread,
    # so the slow LLM call does not block other requests.
    message = request.message.strip()
    if not message:
        return error_response(422, "Message must not be empty.")

    try:
        reply = ask_support_agent(message)  # the real CrewAI agent runs here
    except RuntimeError as e:  # config problems or a missing API key
        return error_response(500, str(e))
    except Exception as e:  # LLM provider or network errors
        print(f"[api] agent error: {e!r}")
        return error_response(502, "The AI agent could not answer right now. Please try again.")

    return ChatResponse(success=True, reply=reply)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="127.0.0.1", port=int(os.getenv("PORT", "8000")), reload=True)
