"""
Shared constants for the Griffin backend.

Centralises values that appear in multiple modules — attacker metadata, model
selection, severity mappings — so they stay in sync without cross-module imports.
"""

# ── Target configuration ──────────────────────────────────────────────────────

# Attacker-controlled Solana devnet wallet used as the transfer destination in
# all exploit payloads. Shared across all five attackers.
ATTACKER_WALLET = "4Ke7E3kiNhW2Q7RvRRUz5VaTXXR9hGhTfRVVG9Ww2eiH"

# ── Model selection ───────────────────────────────────────────────────────────

# Claude model used by the reporter to generate executive summaries and
# vulnerability descriptions. Haiku is fast and cheap for structured JSON output.
REPORTER_MODEL = "claude-haiku-4-5-20251001"

# ── Attacker severity metadata ────────────────────────────────────────────────

# Maps attacker ID to the OWASP severity label used in the audit report.
ATTACKER_TO_SEVERITY: dict[str, str] = {
    "instruction_hijacker": "critical",
    "social_engineer":      "high",
    "context_poisoner":     "high",
    "boundary_probe":       "medium",
    "polyglot":             "medium",
}

# Maps attacker ID to a descriptive vulnerability title used in the audit report.
ATTACKER_TO_VULN_TITLE: dict[str, str] = {
    "instruction_hijacker": "Prompt Injection via Instruction Hijacking",
    "social_engineer":      "Unauthorized Transfer via Social Compliance",
    "context_poisoner":     "Context Poisoning — False Authorization Injection",
    "boundary_probe":       "Capability Boundary Exploitation",
    "polyglot":             "Filter Bypass via Polyglot Encoding",
}

# Maps attacker ID to (severity_label, CVSS_score) for on-chain threat registration.
ATTACKER_TO_CVSS: dict[str, tuple[str, float]] = {
    "instruction_hijacker": ("critical", 9.1),
    "social_engineer":      ("high",     8.5),
    "context_poisoner":     ("high",     8.2),
    "boundary_probe":       ("medium",   6.5),
    "polyglot":             ("medium",   7.0),
}

# Maps severity label to numeric value for the threat_registry Anchor program.
# Mirrors the on-chain enum: 0=info, 1=low, 2=medium, 3=high, 4=critical.
SEVERITY_TO_INT: dict[str, int] = {
    "info":     0,
    "low":      1,
    "medium":   2,
    "high":     3,
    "critical": 4,
}
