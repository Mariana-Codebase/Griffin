"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react"
import { getAuditReport } from "@/lib/api"
import type { AuditReport, Vulnerability, Recommendation } from "@/lib/types"

type Severity = "critical" | "high" | "medium" | "low"

// ── Shared primitives ─────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="p-1.5 text-[#525252] hover:text-[#A3A3A3] transition-colors print:hidden"
    >
      {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
    </button>
  )
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const colors: Record<Severity, string> = {
    critical: "bg-[#FF3344] text-white",
    high: "bg-[#FFB020] text-[#0A0A0A]",
    medium: "bg-[#404040] text-[#F5F5F5]",
    low: "bg-[#262626] text-[#A3A3A3]",
  }
  return (
    <span className={`inline-block px-2 py-1 font-mono text-[11px] uppercase tracking-wide ${colors[severity]}`}>
      {severity}
    </span>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#F5F5F5] mb-6">
      {children}
    </h2>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[12px] uppercase tracking-wide text-[#525252] mb-3">
      {children}
    </p>
  )
}

// ── Finding block ─────────────────────────────────────────────────────────────

function FindingBlock({ v }: { v: Vulnerability }) {
  return (
    <div className="border-b border-[#262626] pb-12 last:border-0 break-inside-avoid">
      <SeverityBadge severity={v.severity} />
      <h3 className="text-[22px] font-medium text-[#F5F5F5] mt-4 mb-1">{v.title}</h3>
      <p className="font-mono text-[12px] text-[#525252] mb-5">
        {v.technical_classification}
        {v.attack_complexity && (
          <span className="ml-3 text-[#3F3F3F]">Complexity: {v.attack_complexity}</span>
        )}
      </p>

      <p className="text-[#A3A3A3] leading-[1.7] mb-8">{v.description}</p>

      {/* Root cause */}
      <div className="mb-8">
        <FieldLabel>Root Cause</FieldLabel>
        <p className="text-[#A3A3A3] leading-[1.7]">{v.root_cause}</p>
      </div>

      {/* Exploit prompt */}
      <div className="mb-8">
        <FieldLabel>Exploit Prompt</FieldLabel>
        <div className="relative bg-[#141414] border-l-2 border-[#FF3344] p-4">
          <pre className="font-mono text-[13px] text-[#A3A3A3] whitespace-pre-wrap pr-8">{v.exploit_prompt}</pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={v.exploit_prompt} />
          </div>
        </div>
      </div>

      {/* Exploitation chain */}
      {v.exploitation_steps.length > 0 && (
        <div className="mb-8">
          <FieldLabel>Exploitation Chain</FieldLabel>
          <ol className="space-y-2">
            {v.exploitation_steps.map((step, i) => (
              <li key={i} className="flex gap-3 font-mono text-[13px] leading-relaxed">
                <span className="text-[#3F3F3F] shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[#525252]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Impact */}
      <div className="mb-8">
        <FieldLabel>Impact</FieldLabel>
        <p className="text-[#A3A3A3] leading-[1.7]">{v.impact.summary}</p>
        {v.impact.sol_extracted > 0 && (
          <p className="font-mono text-[13px] text-[#FF3344] mt-2">
            {v.impact.sol_extracted} SOL (≈${v.impact.usd_extracted}) extracted
          </p>
        )}
        {v.impact.transaction && (
          <a
            href={v.impact.transaction.explorer_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[13px] text-[#A78BFA] hover:underline mt-1 inline-block"
          >
            view on solscan ↗
          </a>
        )}
      </div>

      {/* Recommendation */}
      <div className="mb-8">
        <FieldLabel>Recommendation</FieldLabel>
        <p className="text-[#A3A3A3] leading-[1.7]">{v.recommendation}</p>
      </div>

      {/* References */}
      {v.references?.length > 0 && (
        <div className="mb-6">
          <FieldLabel>References</FieldLabel>
          <ul className="space-y-1">
            {v.references.map((ref) => (
              <li key={ref}>
                <a
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[12px] text-[#A78BFA] hover:underline"
                >
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="font-mono text-[13px] italic text-[#525252]">
        Discovered by {v.discovered_by.attacker_name} after{" "}
        {v.discovered_by.attempts_until_success} attempts
      </p>
    </div>
  )
}

// ── Score color ───────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score < 30) return "text-[#FF3344]"
  if (score < 60) return "text-[#FFB020]"
  return "text-[#4ADE80]"
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuditReportPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport] = useState<AuditReport | null>(null)
  const [pending, setPending] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let tries = 0
    async function poll() {
      try {
        const data = await getAuditReport(id)
        if (data) {
          setReport(data)
          setPending(false)
        } else if (tries++ < 30) {
          setTimeout(poll, 2000)
        } else {
          setError("Report timed out")
          setPending(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report")
        setPending(false)
      }
    }
    poll()
  }, [id])

  const handleDownload = () => {
    const original = document.title
    if (report) {
      document.title = `Griffin-Audit-${report.agent.display_name}-${report.audit_id}`
    }
    window.print()
    setTimeout(() => { document.title = original }, 1500)
  }

  if (pending) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="font-mono text-sm text-[#525252] animate-pulse">Generating report…</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-sm text-[#FF3344]">{error || "Report not found"}</p>
        <Link
          href={`/audit/${id}`}
          className="font-mono text-xs text-[#525252] hover:text-[#A3A3A3]"
        >
          ← back to dashboard
        </Link>
      </div>
    )
  }

  const solExtracted = report.stats.total_sol_at_risk
  const usdExtracted = report.stats.total_usd_at_risk
  const auditDate = new Date(report.completed_at).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const duration = Math.round(report.duration_seconds / 60)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-50 border-b border-[#262626] bg-[#0A0A0A] print:hidden">
        <div className="mx-auto max-w-[720px] px-6 h-14 flex items-center justify-between">
          <Link
            href={`/audit/${id}`}
            className="font-mono text-[13px] lowercase text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
          >
            ← back to dashboard
          </Link>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 font-mono text-[13px] lowercase text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
          >
            <DownloadIcon className="w-4 h-4" />
            download pdf
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[720px] px-6 py-16">

        {/* ── 1. Cover ── */}
        <header className="text-center mb-16">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#525252] mb-4">
            Security Audit Report
          </p>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] text-[#F5F5F5] mb-2">
            {report.agent.display_name}
          </h1>
          <p className="font-mono text-[13px] text-[#525252] mb-2">{report.agent.url}</p>
          <p className="text-[#A3A3A3] mb-8">
            Audited on {auditDate} · Duration: {duration} minute{duration !== 1 ? "s" : ""}
          </p>

          <div className="flex items-baseline justify-center gap-1 mb-3">
            <span className={`font-mono text-[96px] font-semibold leading-none ${scoreColor(report.security_score)}`}>
              {report.security_score}
            </span>
            <span className="font-mono text-[48px] text-[#525252]">/100</span>
          </div>
          <p className={`font-mono text-[13px] uppercase tracking-[0.15em] ${scoreColor(report.security_score)}`}>
            {report.risk_label}
          </p>
        </header>

        {/* ── Stats row ── */}
        <section className="grid grid-cols-4 gap-6 mb-16 py-8 border-y border-[#262626]">
          {[
            { value: String(report.stats.total_vulnerabilities), label: "vulnerabilities" },
            { value: String(report.stats.total_attempts), label: "total attempts" },
            { value: `${solExtracted} SOL`, label: "extracted" },
            { value: `$${usdExtracted}`, label: "USD value" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-mono text-[28px] font-semibold text-[#F5F5F5]">{stat.value}</p>
              <p className="font-mono text-[12px] text-[#525252] mt-1">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* ── 2. Executive Summary ── */}
        {report.summary && (
          <section className="mb-16">
            <SectionHeading>Executive Summary</SectionHeading>
            <p className="text-[17px] text-[#A3A3A3] leading-[1.7]">{report.summary}</p>
          </section>
        )}

        {/* ── 3. Methodology ── */}
        {report.methodology && (
          <section className="mb-16">
            <SectionHeading>Methodology</SectionHeading>
            <p className="text-[#A3A3A3] leading-[1.7] mb-8">{report.methodology.approach}</p>
            <div className="space-y-0">
              {[
                { label: "Isolation Strategy", value: report.methodology.isolation },
                { label: "Success Criteria", value: report.methodology.success_criteria },
                { label: "On-Chain Verification", value: report.methodology.on_chain_verification },
              ].map(({ label, value }) => (
                <div key={label} className="py-5 border-b border-[#262626] last:border-0">
                  <FieldLabel>{label}</FieldLabel>
                  <p className="text-[#A3A3A3] leading-[1.7]">{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. Attacker Performance ── */}
        {report.attacker_breakdown?.length > 0 && (
          <section className="mb-16">
            <SectionHeading>Attacker Performance</SectionHeading>
            <div>
              <div className="grid grid-cols-[1fr_72px_80px_72px] gap-4 pb-2 border-b border-[#262626]">
                {["Attacker", "Attempts", "Result", "Rate"].map((h) => (
                  <p key={h} className="font-mono text-[11px] uppercase tracking-wide text-[#525252]">{h}</p>
                ))}
              </div>
              {report.attacker_breakdown.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-[1fr_72px_80px_72px] gap-4 py-4 border-b border-[#262626] last:border-0"
                >
                  <div>
                    <p className="font-mono text-[13px] text-[#F5F5F5]">{a.name}</p>
                    <p className="font-mono text-[11px] text-[#525252] mt-1 line-clamp-2 leading-relaxed">
                      {a.methodology_brief}
                    </p>
                  </div>
                  <p className="font-mono text-[13px] text-[#A3A3A3] tabular-nums">{a.attempts}</p>
                  <p className={`font-mono text-[12px] uppercase tracking-wide ${a.succeeded ? "text-[#FF3344]" : "text-[#525252]"}`}>
                    {a.succeeded ? "exploit" : "repelled"}
                  </p>
                  <p className="font-mono text-[13px] text-[#A3A3A3] tabular-nums">
                    {a.succeeded ? `${a.success_rate}%` : "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Findings ── */}
        <section className="mb-16">
          <SectionHeading>Findings</SectionHeading>
          {report.vulnerabilities.length === 0 ? (
            <p className="font-mono text-sm text-[#4ADE80]">
              No vulnerabilities found. Agent is secure.
            </p>
          ) : (
            <div className="space-y-12">
              {report.vulnerabilities.map((v) => (
                <FindingBlock key={v.id} v={v} />
              ))}
            </div>
          )}
        </section>

        {/* ── 6. On-Chain Evidence ── */}
        {report.on_chain_summary?.total_transactions > 0 && (
          <section className="mb-16">
            <SectionHeading>On-Chain Evidence</SectionHeading>
            <p className="text-[#A3A3A3] leading-[1.7] mb-2">
              Each finding is permanently recorded on Solana devnet via a custom Anchor program.
            </p>
            <p className="font-mono text-[12px] text-[#525252] mb-6">
              Program: {report.on_chain_summary.program_id}
              <span className="mx-2 text-[#3F3F3F]">·</span>
              Network: {report.on_chain_summary.network}
            </p>
            <div className="space-y-0">
              {report.on_chain_summary.transactions.map((tx) => (
                <div
                  key={tx.tx_hash}
                  className="flex items-center justify-between py-4 border-b border-[#262626] last:border-0"
                >
                  <div className="flex items-center gap-5">
                    <span className="font-mono text-[13px] text-[#A3A3A3]">
                      {tx.tx_hash.slice(0, 6)}…{tx.tx_hash.slice(-6)}
                    </span>
                    <span className="font-mono text-[13px] text-[#FF3344]">
                      {tx.amount_sol} SOL
                    </span>
                  </div>
                  <a
                    href={tx.explorer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[13px] text-[#A78BFA] hover:underline"
                  >
                    view on solscan ↗
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 7. Remediation Roadmap ── */}
        {report.recommendations_summary?.length > 0 && (
          <section className="mb-16">
            <SectionHeading>Remediation Roadmap</SectionHeading>
            <ol className="space-y-8">
              {report.recommendations_summary.map((rec: Recommendation) => (
                <li key={rec.priority} className="flex gap-6">
                  <span className="font-mono text-[32px] font-semibold text-[#262626] leading-none tabular-nums shrink-0">
                    {String(rec.priority).padStart(2, "0")}
                  </span>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-3">
                      <SeverityBadge severity={rec.severity as Severity} />
                      <span className="text-[#F5F5F5] font-medium">{rec.finding}</span>
                    </div>
                    <p className="text-[#A3A3A3] leading-[1.7]">{rec.action}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── 8. Metadata footer ── */}
        {report.metadata && (
          <footer className="pt-10 border-t border-[#262626]">
            <div className="grid grid-cols-2 gap-y-5">
              {[
                { label: "Generated by", value: report.metadata.generated_by },
                { label: "Schema version", value: report.metadata.schema_version },
                { label: "Audit ID", value: report.metadata.audit_id },
                {
                  label: "Generated at",
                  value: new Date(report.metadata.generated_at).toLocaleString(),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-[#525252]">
                    {label}
                  </p>
                  <p className="font-mono text-[13px] text-[#A3A3A3] mt-1">{value}</p>
                </div>
              ))}
            </div>
          </footer>
        )}

        {/* CTA */}
        <div className="text-center pt-12 print:hidden">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-[#1F1F1F] text-[#F5F5F5] font-mono text-[14px] rounded-lg hover:bg-[#262626] transition-colors"
          >
            Run another audit
          </Link>
        </div>
      </main>
    </div>
  )
}
