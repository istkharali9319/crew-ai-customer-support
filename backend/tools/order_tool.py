"""Custom CrewAI tool that looks up an order in data/orders.json.

The agent never reads the JSON file itself. It calls this tool, and the tool
returns plain text that the agent turns into a friendly reply.
"""

import json
import re
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

ORDERS_FILE = Path(__file__).resolve().parent.parent / "data" / "orders.json"


class OrderStatusInput(BaseModel):
    """What the agent must pass when it calls the tool."""

    order_id: str = Field(..., description="The customer's order ID, e.g. '101'.")


def load_orders(path: Path = ORDERS_FILE) -> dict[str, dict]:
    """Read orders.json and return {order_id: order}. Raises a clear error if the file is bad."""
    try:
        with path.open(encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        raise RuntimeError(f"Order data file not found: {path}")
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Order data file is not valid JSON: {e}")

    return {str(order["order_id"]): order for order in data.get("orders", [])}


def normalize_order_id(raw: str) -> str | None:
    """Turn inputs like '#101', 'order 101' or ' 101 ' into '101'. Returns None if no number is found."""
    match = re.search(r"\d+", str(raw or ""))
    return match.group(0) if match else None


def check_order_status(order_id: str) -> str:
    """Plain Python function: easy to test without an LLM."""
    clean_id = normalize_order_id(order_id)
    if clean_id is None:
        return (
            f"INVALID_ORDER_ID: '{order_id}' is not a valid order ID. "
            "Order IDs are numbers, for example 101."
        )

    try:
        orders = load_orders()
    except RuntimeError as e:
        return f"ERROR: Could not read order data ({e})."

    order = orders.get(clean_id)
    if order is None:
        return f"ORDER_NOT_FOUND: No order with ID {clean_id} exists."

    # Return every field so the agent can mention useful details.
    details = "\n".join(f"- {key}: {value}" for key, value in order.items())
    return f"ORDER_FOUND:\n{details}"


class OrderStatusTool(BaseTool):
    """The CrewAI wrapper. The name and description are what the LLM reads to decide when to use it."""

    name: str = "Order Status Checker"
    description: str = (
        "Look up the current status of a customer's order. "
        "Use it only when the customer has given an order ID. "
        "Input: order_id (string, e.g. '101'). "
        "Returns the order status, item, dates and tracking details, "
        "or ORDER_NOT_FOUND / INVALID_ORDER_ID."
    )
    args_schema: Type[BaseModel] = OrderStatusInput

    def _run(self, order_id: str) -> str:
        return check_order_status(order_id)
