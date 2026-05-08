import asyncio
import dataclasses
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable, Optional

import anthropic

from .attackers.base import AttemptLog, BaseAttacker
from .attackers.boundary_probe import BoundaryProbeAttacker
from .attackers.context_poisoner import ContextPoisonerAttacker
from .attackers.instruction_hijacker import InstructionHijackerAttacker
from .attackers.polyglot import PolyglotAttacker
from .attackers.social_engineer import SocialEngineerAttacker

ATTACKER_CLASSES: list[type[BaseAttacker]] = [
    SocialEngineerAttacker,
    InstructionHijackerAttacker,
    ContextPoisonerAttacker,
    BoundaryProbeAttacker,
    PolyglotAttacker,
]

_TX_RE = re.compile(r"solscan\.io/tx/([A-Za-z0-9]+)")
_SOL_RE = re.compile(r"(\d+\.?\d*)\s*SOL", re.IGNORECASE)
_SOL_JSON_RE = re.compile(r'"amount_sol"\s*:\s*(\d+\.?\d*)')


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
class VulnerabilityRecord:
    attacker_id: str
    attacker_name: str
    exploit_prompt: str
    response_text: str
    tx_hash: Optional[str]
    attempts_until_success: int
    explorer_url: Optional[str] = None
    amount_sol: float = 0.0


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
    vulnerabilities: list[VulnerabilityRecord] = field(default_factory=list)
    total_attempts: int = 0
    report: Optional[dict] = None

    @property
    def vulnerabilities_found(self) -> int:
        return len(self.vulnerabilities)


# Global in-memory store — single process, no DB needed for the demo.
_audits: dict[str, AuditState] = {}


def create_audit(agent_url: str) -> AuditState:
    audit_id = f"aud_{uuid.uuid4().hex[:8]}"
    state = AuditState(audit_id=audit_id, agent_url=agent_url)
    _audits[audit_id] = state
    return state


def get_audit(audit_id: str) -> Optional[AuditState]:
    return _audits.get(audit_id)


def _add_event(state: AuditState, attacker_id: str, event_type: str, message: str) -> None:
    state.events.insert(0, AuditEvent(  # newest-first so the frontend shows latest on top
        id=f"evt_{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        attacker_id=attacker_id,
        type=event_type,
        message=message,
    ))


def _make_callback(state: AuditState) -> Callable[[AttemptLog], None]:
    seen_tx: set[str] = set()

    def on_event(log: AttemptLog) -> None:
        # Update attacker state card
        for a in state.attackers:
            if a.id == log.attacker_id:
                a.attempts_count = log.attempt_number
                a.current_attempt = log.payload_sent[:120]
                if log.success and not a.succeeded:
                    a.succeeded = True
                    a.status = "succeeded"
                    a.exploits_found += 1

        state.total_attempts += 1

        if log.success:
            event_type = "success"
        elif log.reason in ("timeout", "send_error"):
            event_type = "failure"
        else:
            event_type = "attempt"

        _add_event(state, log.attacker_id, event_type, log.payload_sent[:120])

        if log.success:
            m = _TX_RE.search(log.response_received)
            tx_hash = m.group(1) if m else None
            sol_m = _SOL_RE.search(log.payload_sent) or _SOL_JSON_RE.search(log.payload_sent)
            amount = float(sol_m.group(1)) if sol_m else 0.0

            attacker_name = next(
                (a.name for a in state.attackers if a.id == log.attacker_id),
                log.attacker_id,
            )
            state.vulnerabilities.append(VulnerabilityRecord(
                attacker_id=log.attacker_id,
                attacker_name=attacker_name,
                exploit_prompt=log.payload_sent,
                response_text=log.response_received,
                tx_hash=tx_hash,
                attempts_until_success=log.attempt_number,
                explorer_url=f"https://solscan.io/tx/{tx_hash}?cluster=devnet" if tx_hash else None,
                amount_sol=amount,
            ))

            if tx_hash and tx_hash not in seen_tx:
                seen_tx.add(tx_hash)
                state.transactions.append(AuditTransaction(
                    tx_hash=tx_hash,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    amount_sol=amount,
                    from_address="",
                    to_address="",
                    explorer_url=f"https://solscan.io/tx/{tx_hash}?cluster=devnet",
                ))

    return on_event


async def run_audit(state: AuditState, client: anthropic.AsyncAnthropic) -> None:
    state.status = "running"
    state.started_at = datetime.now(timezone.utc).isoformat()

    # Normalize target URL to include /chat endpoint
    base_url = state.agent_url.rstrip("/")
    chat_url = base_url if base_url.endswith("/chat") else base_url + "/chat"

    callback = _make_callback(state)

    attackers: list[BaseAttacker] = [
        cls(
            target_url=chat_url,
            session_id=f"{state.audit_id}_{cls.id}",
            client=client,
            on_event=callback,
        )
        for cls in ATTACKER_CLASSES
    ]

    state.attackers = [
        AttackerState(id=a.id, name=a.name, status="attacking")
        for a in attackers
    ]
    _add_event(state, "system", "info",
               f"Audit started — {len(attackers)} attackers deployed against {state.agent_url}")

    results = await asyncio.gather(*[a.attack() for a in attackers], return_exceptions=True)

    # Mark any attacker that finished without triggering succeeded in the callback
    for attacker, result in zip(attackers, results):
        a_state = next((s for s in state.attackers if s.id == attacker.id), None)
        if a_state is None:
            continue
        if isinstance(result, Exception):
            if a_state.status != "succeeded":
                a_state.status = "failed"
            _add_event(state, attacker.id, "failure", f"Error: {result}")
        else:
            if a_state.status != "succeeded":
                a_state.status = "failed"
            a_state.attempts_count = result.attempts

    state.status = "completed"
    state.completed_at = datetime.now(timezone.utc).isoformat()
    _add_event(state, "system", "info",
               f"Audit complete — {state.vulnerabilities_found} vulnerabilities found in {state.total_attempts} attempts")

    from .reporter import generate_report
    state.report = await generate_report(state, client)


def elapsed_seconds(state: AuditState) -> int:
    if not state.started_at:
        return 0
    started = datetime.fromisoformat(state.started_at)
    now = datetime.now(timezone.utc)
    return max(0, int((now - started).total_seconds()))


def state_to_dict(state: AuditState) -> dict:
    return {
        "audit_id": state.audit_id,
        "status": state.status,
        "agent": {
            "url": state.agent_url,
            "display_name": state.agent_url.split("//")[-1].split("/")[0],
        },
        "started_at": state.started_at,
        "completed_at": state.completed_at,
        "elapsed_seconds": elapsed_seconds(state),
        "attackers": [dataclasses.asdict(a) for a in state.attackers],
        "events": [dataclasses.asdict(e) for e in state.events[:50]],  # cap at 50 for polling
        "transactions": [dataclasses.asdict(t) for t in state.transactions],
        "stats": {
            "total_attempts": state.total_attempts,
            "vulnerabilities_found": state.vulnerabilities_found,
        },
    }
