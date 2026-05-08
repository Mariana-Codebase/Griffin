# Reads the kill chain from completed attackers and generates the final audit report.
# Called by the orchestrator once all attackers finish or the timeout is reached.

# TODO: implement generate_report(audit_state: AuditState) -> dict
#   - use Claude Sonnet 4.5 to write executive summary and vuln descriptions
#   - compute security_score (0–100) from vuln count and severity
#   - return schema matching GET /audits/{id}/report contract
