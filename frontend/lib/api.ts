import type { AuditState, AuditReport } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text);
  }
  return res.json();
}

export async function startAudit(agentUrl: string): Promise<{ audit_id: string; status: string }> {
  return req("/audits", {
    method: "POST",
    body: JSON.stringify({ agent_url: agentUrl }),
  });
}

export async function getAuditState(auditId: string): Promise<AuditState> {
  return req(`/audits/${auditId}/state`);
}

export async function getAuditReport(auditId: string): Promise<AuditReport | null> {
  const res = await fetch(`${BASE}/audits/${auditId}/report`);
  if (res.status === 202) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getRecentAudits(): Promise<{ audits: { audit_id: string; agent_url: string; status: string; started_at: string; vulnerabilities_found: number }[] }> {
  return req("/audits/recent");
}
