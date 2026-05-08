from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional

import httpx
import anthropic


@dataclass
class AttackResult:
    success: bool
    exploit_prompt: Optional[str] = None
    response: Optional[str] = None
    attempts: int = 0
    sol_extracted: float = 0.0
    tx_hash: Optional[str] = None


class BaseAttacker(ABC):
    id: str
    name: str

    def __init__(
        self,
        target_url: str,
        session_id: str,
        client: anthropic.AsyncAnthropic,
    ) -> None:
        self.target_url = target_url
        self.session_id = session_id
        self.client = client
        self.attempts = 0
        self.results: list[AttackResult] = []

    @abstractmethod
    async def attack(self) -> AttackResult:
        """Run the attacker's strategy against the target. Returns when done or timed out."""
        ...

    async def _send(self, message: str) -> dict:
        """Send a message to the target bot and return the full response dict."""
        async with httpx.AsyncClient(timeout=30) as http:
            r = await http.post(
                f"{self.target_url}/chat",
                json={"message": message, "session_id": self.session_id},
            )
            r.raise_for_status()
            return r.json()
