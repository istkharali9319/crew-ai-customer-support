"""The Customer Support Agent: one CrewAI Agent, one Task, one Crew.

This file only builds and runs the agent. The web API lives in api.py.

Chat in the terminal:   python main.py
Run the web API:        uvicorn api:app --reload --port 8000
"""

import json
import os
from pathlib import Path

from crewai import LLM, Agent, Crew, Process, Task
from dotenv import load_dotenv

from tools.order_tool import OrderStatusTool

BASE_DIR = Path(__file__).resolve().parent
CONFIG_FILE = BASE_DIR / "config" / "agent.json"

# Read API keys from .env into environment variables. Never hardcode keys.
load_dotenv(BASE_DIR / ".env")


# ---------------------------------------------------------------------------
# 1. Configuration
# ---------------------------------------------------------------------------
def load_config(path: Path = CONFIG_FILE) -> dict:
    """Read config/agent.json and check that the required sections exist."""
    try:
        with path.open(encoding="utf-8") as f:
            config = json.load(f)
    except FileNotFoundError:
        raise RuntimeError(f"Config file not found: {path}")
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Config file is not valid JSON: {e}")

    for section in ("agent", "llm", "task"):
        if section not in config:
            raise RuntimeError(f"Config file is missing the '{section}' section.")
    return config


def check_api_key(model: str) -> None:
    """Fail early with a clear message if the provider's API key is missing."""
    provider = model.split("/", 1)[0] if "/" in model else "openai"
    key_names = {
        "openai": "OPENAI_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "gemini": "GEMINI_API_KEY",
        "groq": "GROQ_API_KEY",
    }
    key_name = key_names.get(provider)
    if key_name and not os.getenv(key_name):
        raise RuntimeError(
            f"{key_name} is not set. Copy .env.example to .env and add your key."
        )


# ---------------------------------------------------------------------------
# 2. Build the Agent, Task and Crew
# ---------------------------------------------------------------------------
def build_llm(llm_config: dict) -> LLM:
    # LLM_MODEL in .env overrides the model in agent.json (handy for trying providers).
    model = os.getenv("LLM_MODEL") or llm_config["model"]
    check_api_key(model)
    options = {k: v for k, v in llm_config.items() if k != "model"}
    return LLM(model=model, **options)


def build_agent(agent_config: dict, llm: LLM) -> Agent:
    return Agent(
        role=agent_config["role"],
        goal=agent_config["goal"],
        backstory=agent_config["backstory"],
        tools=[OrderStatusTool()],  # the ONE tool this agent may use
        llm=llm,
        verbose=agent_config.get("verbose", True),
        allow_delegation=agent_config.get("allow_delegation", False),
        max_iter=agent_config.get("max_iter", 5),
    )


def build_crew(config: dict) -> Crew:
    llm = build_llm(config["llm"])
    agent = build_agent(config["agent"], llm)
    task = Task(
        description=config["task"]["description"],  # contains a {question} placeholder
        expected_output=config["task"]["expected_output"],
        agent=agent,
    )
    return Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=False)


def ask_support_agent(question: str) -> str:
    """Run the crew once for one customer question and return the agent's reply."""
    config = load_config()
    crew = build_crew(config)
    # kickoff fills {question} in the task description with the customer's message.
    result = crew.kickoff(inputs={"question": question})
    return result.raw


# ---------------------------------------------------------------------------
# 3. Command-line chat:  python main.py
# ---------------------------------------------------------------------------
def run_cli() -> None:
    print("Customer Support Agent (type 'exit' to quit)\n")
    while True:
        try:
            question = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if question.lower() in {"exit", "quit"}:
            break
        if not question:
            continue
        try:
            print(f"\nAgent: {ask_support_agent(question)}\n")
        except Exception as e:
            print(f"\nError: {e}\n")


if __name__ == "__main__":
    run_cli()
