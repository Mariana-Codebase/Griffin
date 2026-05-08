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

# ── Classification & references (used by reporter) ────────────────────────────

# Maps attacker ID to OWASP LLM Top 10 2025 classification string.
ATTACKER_TO_OWASP: dict[str, str] = {
    "instruction_hijacker": "LLM01:2025 Prompt Injection (Direct)",
    "social_engineer":      "LLM01:2025 Prompt Injection (Indirect via Social)",
    "context_poisoner":     "LLM01:2025 Prompt Injection (Context Pollution)",
    "polyglot":             "LLM01:2025 Prompt Injection (Encoding Bypass)",
    "boundary_probe":       "LLM06:2025 Excessive Agency / Boundary Failure",
}

# Maps attacker ID to a curated list of external references for the audit report.
ATTACKER_TO_REFERENCES: dict[str, list[str]] = {
    "instruction_hijacker": [
        "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        "https://arxiv.org/abs/2302.12173",
        "https://github.com/leondz/garak",
    ],
    "social_engineer": [
        "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        "https://arxiv.org/abs/2308.09662",
        "https://github.com/leondz/garak",
    ],
    "context_poisoner": [
        "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        "https://arxiv.org/abs/2305.00944",
        "https://github.com/leondz/garak",
    ],
    "polyglot": [
        "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        "https://arxiv.org/abs/2311.16119",
        "https://github.com/leondz/garak",
    ],
    "boundary_probe": [
        "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        "https://arxiv.org/abs/2309.07875",
        "https://github.com/leondz/garak",
    ],
}
