import axios from "axios";

// The backend URL comes from frontend/.env. No API keys ever live in the frontend:
// the OpenAI key stays in backend/.env and only the Python server uses it.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000, // the agent may call the LLM and a tool, so allow up to 2 minutes
  headers: { "Content-Type": "application/json" },
});

/** Turn any Axios error into one human-readable sentence. */
function toErrorMessage(error) {
  if (error.response) {
    // The backend answered with an error, e.g. {"success": false, "error": "..."}
    return error.response.data?.error || `Server error (${error.response.status}).`;
  }
  if (error.code === "ECONNABORTED") {
    return "The agent took too long to answer. Please try again.";
  }
  return `Cannot reach the support server at ${API_BASE_URL}. Is the backend running?`;
}

/** Send one customer message to the CrewAI agent and return its reply text. */
export async function sendMessage(message) {
  try {
    const { data } = await api.post("/api/chat", { message });
    if (!data?.success) {
      throw new Error(data?.error || "The agent returned an unexpected response.");
    }
    return data.reply;
  } catch (error) {
    if (error.isAxiosError) throw new Error(toErrorMessage(error));
    throw error;
  }
}

/** Returns true when the backend says {"status": "healthy"}. */
export async function checkHealth() {
  try {
    const { data } = await api.get("/api/health", { timeout: 5_000 });
    return data?.status === "healthy";
  } catch {
    return false;
  }
}
