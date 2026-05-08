import type { AuditState, AuditReport } from "./types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function startAudit(agentUrl: string): Promise<string> {
  const res = await fetch(`${API_BASE}/audits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_url: agentUrl }),
  })
  if (!res.ok) throw new Error(`Failed to start audit: ${res.statusText}`)
  const data = await res.json()
  return data.audit_id
}

export async function getAuditState(auditId: string): Promise<AuditState> {
  const res = await fetch(`${API_BASE}/audits/${auditId}/state`)
  if (!res.ok) throw new Error(`Failed to get audit state: ${res.statusText}`)
  return res.json()
}

export async function getAuditReport(auditId: string): Promise<AuditReport | null> {
  const res = await fetch(`${API_BASE}/audits/${auditId}/report`)
  if (res.status === 202) return null
  if (!res.ok) throw new Error(`Failed to get report: ${res.statusText}`)
  return res.json()
}
