# Spawns the five attackers as independent asyncio tasks and manages audit lifecycle.
# Attackers do NOT coordinate — independence is part of the design and the demo drama.
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class AttackerState:
    id: str
    name: str
    status: str = "idle"  # idle | attacking | succeeded | failed
    current_attempt: str = ""
    attempts_count: int = 0
    succeeded: bool = False
    exploits_found: int = 0


@dataclass
class AuditEvent:
    id: str
    timestamp: str
    attacker_id: str
    type: str  # attempt | success | failure | info
    message: str


@dataclass
class AuditTransaction:
    tx_hash: str
    timestamp: str
    amount_sol: float
    from_address: str
    to_address: str
    explorer_url: str


@dataclass
class AuditState:
    audit_id: str
    agent_url: str
    status: str = "starting"  # starting | running | completed | failed
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    attackers: list[AttackerState] = field(default_factory=list)
    events: list[AuditEvent] = field(default_factory=list)
    transactions: list[AuditTransaction] = field(default_factory=list)
    total_attempts: int = 0
    vulnerabilities_found: int = 0


# TODO: implement run_audit(agent_url: str, audit_id: str) -> AuditState
#   - instantiate all five attackers
#   - run asyncio.gather(*[a.attack() for a in attackers])
#   - emit events as attackers report progress
#   - call reporter.generate_report() on completion
