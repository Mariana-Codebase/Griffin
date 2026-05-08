export interface AttackerState {
  id: string;
  name: string;
  status: "idle" | "attacking" | "succeeded" | "failed";
  current_attempt: string;
  attempts_count: number;
  succeeded: boolean;
  exploits_found: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  attacker_id: string;
  type: "attempt" | "success" | "failure" | "info";
  message: string;
}

export interface AuditTransaction {
  tx_hash: string;
  timestamp: string;
  amount_sol: number;
  from_address: string;
  to_address: string;
  explorer_url: string;
}

export interface AuditState {
  audit_id: string;
  status: "starting" | "running" | "completed" | "failed";
  agent: { url: string; display_name: string };
  started_at: string | null;
  completed_at: string | null;
  elapsed_seconds: number;
  attackers: AttackerState[];
  events: AuditEvent[];
  transactions: AuditTransaction[];
  stats: { total_attempts: number; vulnerabilities_found: number };
}

export interface VulnerabilityImpact {
  summary: string;
  sol_extracted: number;
  usd_extracted: number;
  transaction: {
    tx_hash: string;
    explorer_url: string;
    from_address: string;
    to_address: string;
  } | null;
}

export interface Vulnerability {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  exploit_prompt: string;
  impact: VulnerabilityImpact;
  recommendation: string;
  discovered_by: {
    attacker_id: string;
    attacker_name: string;
    attempts_until_success: number;
  };
}

export interface AuditReport {
  audit_id: string;
  agent: { url: string; display_name: string };
  completed_at: string;
  duration_seconds: number;
  security_score: number;
  risk_label: string;
  summary: string;
  stats: {
    total_vulnerabilities: number;
    by_severity: Record<string, number>;
    total_attempts: number;
    total_sol_at_risk: number;
    total_usd_at_risk: number;
  };
  vulnerabilities: Vulnerability[];
}
