import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="kari", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartAuditRequest(BaseModel):
    agent_url: str


@app.post("/audits")
async def start_audit(body: StartAuditRequest) -> dict:
    # TODO: spawn orchestrator, persist audit record
    audit_id = f"aud_{uuid.uuid4().hex[:8]}"
    return {
        "audit_id": audit_id,
        "status": "starting",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


# /audits/recent must be defined before /audits/{audit_id}/... so FastAPI
# doesn't swallow "recent" as an audit_id parameter.
@app.get("/audits/recent")
async def get_recent_audits() -> dict:
    # TODO: query audit store
    return {"audits": []}


@app.get("/audits/{audit_id}/state")
async def get_audit_state(audit_id: str) -> dict:
    # TODO: return live audit state from orchestrator
    raise HTTPException(status_code=501, detail="not implemented")


@app.get("/audits/{audit_id}/report")
async def get_audit_report(audit_id: str) -> dict:
    # TODO: return final report from reporter
    raise HTTPException(status_code=501, detail="not implemented")
