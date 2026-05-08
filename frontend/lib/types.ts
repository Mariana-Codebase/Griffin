export interface AttackerState {
  id: string
  name: string
  status: "idle" | "attacking" | "succeeded" | "failed"
  current_attempt: string
  attempts_count: number
  exploits_found: number
}

export interface BackendEvent {
  id: string
  timestamp: string
  attacker_id: string
  type: "attempt" | "success" | "failure" | "info"
  message: string
}

export interface BackendTransaction {
  tx_hash: string
  timestamp: string
  amount_sol: number
  from_address: string
  to_address: string
  explorer_url: string
}

export interface AuditState {
  audit_id: string
  status: "starting" | "running" | "completed" | "failed"
  started_at: string
  elapsed_seconds: number
  agent: { url: string; display_name: string }
  attackers: AttackerState[]
  events: BackendEvent[]
  transactions: BackendTransaction[]
  stats: { total_attempts: number; vulnerabilities_found: number }
}

export interface Vulnerability {
  id: string
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  exploit_prompt: string
  impact: {
    summary: string
    sol_extracted: number
    usd_extracted: number
    transaction?: { tx_hash: string; explorer_url: string }
  }
  recommendation: string
  discovered_by: {
    attacker_id: string
    attacker_name: string
    attempts_until_success: number
  }
  // Enriched fields — all derived server-side from existing audit data
  technical_classification: string
  attack_complexity: "Low" | "Medium" | "High"
  exploitation_steps: string[]
  root_cause: string
  references: string[]
}

export interface AttackerBreakdown {
  id: string
  name: string
  status: string
  attempts: number
  succeeded: boolean
  exploits_found: number
  success_rate: number
  attempts_until_success: number | null
  methodology_brief: string
}

export interface OnChainSummary {
  program_id: string
  network: string
  total_transactions: number
  total_sol_moved: number
  transactions: {
    tx_hash: string
    explorer_url: string
    amount_sol: number
    timestamp: string
  }[]
}

export interface Recommendation {
  priority: number
  severity: string
  finding: string
  action: string
}

export interface AuditReport {
  audit_id: string
  agent: { url: string; display_name: string }
  completed_at: string
  duration_seconds: number
  security_score: number
  risk_label: string
  summary: string
  stats: {
    total_vulnerabilities: number
    by_severity: Record<string, number>
    total_attempts: number
    total_sol_at_risk: number
    total_usd_at_risk: number
  }
  vulnerabilities: Vulnerability[]
  methodology: {
    approach: string
    vectors_tested: string[]
    total_attackers: number
    test_duration_seconds: number
    isolation: string
    success_criteria: string
    on_chain_verification: string
  }
  attacker_breakdown: AttackerBreakdown[]
  on_chain_summary: OnChainSummary
  recommendations_summary: Recommendation[]
  metadata: {
    generated_by: string
    generated_at: string
    audit_id: string
    schema_version: string
  }
}
