import asyncio
import os
from datetime import datetime, timezone

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=_backend_dir / ".env.local", override=False)
load_dotenv(dotenv_path=_backend_dir / ".env", override=False)

from .orchestrator import create_audit, get_audit, run_audit, state_to_dict

app = FastAPI(title="kari", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_client() -> anthropic.AsyncAnthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
    return anthropic.AsyncAnthropic(api_key=api_key)


class StartAuditRequest(BaseModel):
    agent_url: str


@app.post("/audits")
async def start_audit(body: StartAuditRequest) -> dict:
    client = _get_client()
    state = create_audit(body.agent_url)
    # Fire and forget — run_audit updates state in the background while the
    # frontend polls GET /audits/{id}/state for live progress.
    asyncio.create_task(run_audit(state, client))
    return {
        "audit_id": state.audit_id,
        "status": state.status,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


# /audits/recent must be defined before /audits/{audit_id}/... so FastAPI
# doesn't swallow "recent" as an audit_id parameter.
@app.get("/audits/recent")
async def get_recent_audits() -> dict:
    from .orchestrator import _audits
    recent = sorted(_audits.values(), key=lambda s: s.started_at or "", reverse=True)[:10]
    return {
        "audits": [
            {
                "audit_id": s.audit_id,
                "agent_url": s.agent_url,
                "status": s.status,
                "started_at": s.started_at,
                "vulnerabilities_found": s.vulnerabilities_found,
            }
            for s in recent
        ]
    }


@app.get("/audits/{audit_id}/state")
async def get_audit_state(audit_id: str) -> dict:
    state = get_audit(audit_id)
    if state is None:
        raise HTTPException(status_code=404, detail="audit not found")
    return state_to_dict(state)


@app.get("/audits/{audit_id}/report")
async def get_audit_report(audit_id: str) -> dict:
    state = get_audit(audit_id)
    if state is None:
        raise HTTPException(status_code=404, detail="audit not found")
    if state.status != "completed" or state.report is None:
        raise HTTPException(status_code=202, detail="report not ready yet")
    return state.report
