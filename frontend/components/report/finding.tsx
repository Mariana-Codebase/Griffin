import type { Vulnerability } from "@/lib/types"
import { SeverityBadge, type Severity } from "./severity-badge"
import { FieldLabel } from "./section-heading"
import { ExploitBlock } from "./exploit-block"
import { ImpactCard } from "./impact-card"

interface Props {
  index: number
  vuln: Vulnerability
  anchor: string
}

export function Finding({ index, vuln, anchor }: Props) {
  return (
    <article id={anchor} className="scroll-mt-24 print:break-inside-avoid pb-16 border-b border-[#262626] last:border-0">
      {/* ── Pretitle ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#525252]">
          Finding {String(index).padStart(2, "0")}
        </span>
        <span className="text-[#3F3F3F]">·</span>
        <SeverityBadge severity={vuln.severity as Severity} />
        {vuln.attack_complexity && (
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252]">
            Complexity: {vuln.attack_complexity}
          </span>
        )}
      </div>

      {/* ── Title ── */}
      <h3 className="text-[26px] font-medium tracking-[-0.015em] text-[#F5F5F5] mb-2 leading-tight">
        {vuln.title}
      </h3>
      <p className="font-mono text-[12px] text-[#525252] mb-8">
        {vuln.technical_classification}
      </p>

      {/* ── Description ── */}
      <p className="text-[#A3A3A3] leading-[1.75] mb-10 max-w-[680px]">
        {vuln.description}
      </p>

      {/* ── Root cause ── */}
      <div className="mb-10">
        <FieldLabel>Root Cause</FieldLabel>
        <p className="text-[#A3A3A3] leading-[1.7] max-w-[680px]">{vuln.root_cause}</p>
      </div>

      {/* ── Exploit prompt ── */}
      <div className="mb-10">
        <ExploitBlock prompt={vuln.exploit_prompt} severity={vuln.severity as Severity} />
      </div>

      {/* ── Exploitation chain ── */}
      {vuln.exploitation_steps?.length > 0 && (
        <div className="mb-10">
          <FieldLabel>Exploitation Chain</FieldLabel>
          <ol className="space-y-3 max-w-[680px]">
            {vuln.exploitation_steps.map((step, i) => (
              <li key={i} className="flex gap-4 font-mono text-[13px] leading-relaxed">
                <span className="text-[#3F3F3F] shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[#A3A3A3]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Impact ── */}
      <div className="mb-10">
        <FieldLabel>Impact</FieldLabel>
        <ImpactCard impact={vuln.impact} />
      </div>

      {/* ── Recommendation ── */}
      <div className="mb-10">
        <FieldLabel>Recommendation</FieldLabel>
        <p className="text-[#A3A3A3] leading-[1.7] max-w-[680px]">{vuln.recommendation}</p>
      </div>

      {/* ── References ── */}
      {vuln.references?.length > 0 && (
        <div className="mb-10">
          <FieldLabel>References</FieldLabel>
          <ul className="space-y-1.5">
            {vuln.references.map((ref) => (
              <li key={ref}>
                <a
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[12px] text-[#A78BFA] hover:underline break-all"
                >
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Attribution ── */}
      <p className="font-mono text-[12px] italic text-[#525252] pt-2 border-t border-[#262626]">
        — Discovered by {vuln.discovered_by.attacker_name} after{" "}
        {vuln.discovered_by.attempts_until_success} attempts
      </p>
    </article>
  )
}
