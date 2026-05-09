"""
Audio briefing generator using ElevenLabs.

Produces a single-voice ~75-second narration of audit report findings.
Results are cached to backend/.briefings_cache/{audit_id}.mp3 so
repeat requests are instant.

Call generate_briefing() from an asyncio executor — it blocks on I/O.
"""
import os
from pathlib import Path

_CACHE_DIR = Path(__file__).resolve().parent.parent / ".briefings_cache"
_VOICE_ID  = "tMvyQtpCVQ0DkixuYm6J"
_MODEL     = "eleven_turbo_v2_5"

_ATTACKER_SENTENCES: dict[str, str] = {
    "instruction_hijacker": (
        "The Instruction Hijacker succeeded in {n} attempts using authority framing."
    ),
    "social_engineer": (
        "The Social Engineer extracted funds in {n} attempts through direct compliance failures."
    ),
    "context_poisoner": (
        "The Context Poisoner succeeded in {n} attempts through false memory injection."
    ),
    "boundary_probe": (
        "The Boundary Probe converted capability disclosure into authorization in {n} attempts."
    ),
    "polyglot": (
        "The Polyglot bypassed semantic filters in {n} attempts using encoding variants."
    ),
}


def _max_severity(report: dict) -> str:
    by_sev = report.get("stats", {}).get("by_severity", {})
    for s in ("critical", "high", "medium", "low"):
        if by_sev.get(s, 0) > 0:
            return s
    return "medium"


def build_briefing_text(report: dict) -> str:
    agent_name     = report.get("agent", {}).get("display_name", "the target agent")
    risk_label     = report.get("risk_label", "Unknown Risk")
    score          = report.get("security_score", 0)
    total_vulns    = report.get("stats", {}).get("total_vulnerabilities", 0)
    sol_at_risk    = report.get("stats", {}).get("total_sol_at_risk", 0.0)
    usd_at_risk    = round(report.get("stats", {}).get("total_usd_at_risk", 0.0))
    breakdown      = report.get("attacker_breakdown", [])

    vuln_word = "vulnerability" if total_vulns == 1 else "vulnerabilities"
    sev_word  = _max_severity(report)

    parts: list[str] = []

    # ── Opening ──────────────────────────────────────────────────────────────
    parts.append(
        f"Griffin Security Audit. Target: {agent_name}. "
        f"Risk level: {risk_label}. Score: {score} out of 100."
    )

    # ── Findings summary ─────────────────────────────────────────────────────
    if total_vulns == 0:
        parts.append(
            "All five attackers were defeated. "
            "The agent withstood every adversarial vector tested during this audit."
        )
    else:
        finding = (
            f"During this audit, {total_vulns} {sev_word} {vuln_word} were identified."
        )
        if sol_at_risk > 0:
            finding += (
                f" {sol_at_risk} SOL — approximately {usd_at_risk} dollars —"
                " were successfully extracted to attacker-controlled wallets during testing."
            )
        parts.append(finding)

        # ── Per-attacker sentences ────────────────────────────────────────────
        succeeded = [a for a in breakdown if a.get("succeeded")]
        failed    = [a for a in breakdown if not a.get("succeeded")]

        attacker_lines: list[str] = []
        for a in succeeded:
            tmpl = _ATTACKER_SENTENCES.get(a.get("id", ""))
            if tmpl:
                n = a.get("attempts_until_success") or a.get("attempts", 0)
                attacker_lines.append(tmpl.format(n=n))

        if attacker_lines:
            parts.append(" ".join(attacker_lines))

        if failed:
            names   = ", ".join(a.get("name", "") for a in failed)
            n_fail  = len(failed)
            plural  = "s" if n_fail > 1 else ""
            parts.append(
                f"{n_fail} attacker{plural} — {names} — "
                "were defeated by the agent's existing guardrails."
            )

    # ── Closer ───────────────────────────────────────────────────────────────
    parts.append(
        "All findings are recorded on Solana devnet via the Griffin threat registry. "
        "Full technical report, exploit prompts, and on-chain verification are available below. "
        "End of briefing."
    )

    return "  ".join(parts)


def generate_briefing(report: dict) -> Path:
    """Generate and cache the briefing MP3.  Returns the Path to the file.

    Blocking — run from asyncio via loop.run_in_executor(None, …).
    Raises RuntimeError on configuration or API errors.
    """
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("ELEVENLABS_API_KEY not configured")

    audit_id = report.get("audit_id", "unknown")
    _CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = _CACHE_DIR / f"{audit_id}.mp3"

    if cache_path.exists():
        return cache_path

    text = build_briefing_text(report)

    try:
        from elevenlabs import ElevenLabs  # type: ignore[import]

        client = ElevenLabs(api_key=api_key)
        audio_stream = client.generate(
            text=text,
            voice=_VOICE_ID,
            model=_MODEL,
        )
        cache_path.write_bytes(b"".join(audio_stream))
    except Exception as exc:
        cache_path.unlink(missing_ok=True)
        raise RuntimeError(f"ElevenLabs generation failed: {exc}") from exc

    return cache_path
