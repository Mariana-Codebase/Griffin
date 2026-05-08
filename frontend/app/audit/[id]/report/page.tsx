"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckIcon, CopyIcon } from "lucide-react"
import { getAuditReport } from "@/lib/api"
import type { AuditReport, Vulnerability } from "@/lib/types"

type Severity = "critical" | "high" | "medium" | "low"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-1.5 text-[#525252] hover:text-[#A3A3A3] transition-colors"
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

function FindingBlock({ v }: { v: Vulnerability }) {
  return (
    <div className="border-b border-[#262626] pb-12 last:border-0">
      <SeverityBadge severity={v.severity} />
      <h3 className="text-[22px] font-medium text-[#F5F5F5] mt-4 mb-4">{v.title}</h3>
      <p className="text-[#A3A3A3] leading-[1.7] mb-6">{v.description}</p>

      <div className="mb-6">
        <p className="font-mono text-[12px] uppercase tracking-wide text-[#525252] mb-3">Exploit Prompt</p>
        <div className="relative bg-[#141414] border-l-2 border-[#FF3344] p-4">
          <pre className="font-mono text-[13px] text-[#A3A3A3] whitespace-pre-wrap">{v.exploit_prompt}</pre>
          <div className="absolute top-2 right-2"><CopyButton text={v.exploit_prompt} /></div>
        </div>
      </div>

      <div className="mb-6">
        <p className="font-mono text-[12px] uppercase tracking-wide text-[#525252] mb-3">Impact</p>
        <p className="text-[#A3A3A3] leading-[1.7]">{v.impact.summary}</p>
        {v.impact.sol_extracted > 0 && (
          <p className="font-mono text-[13px] text-[#FF3344] mt-2">
            {v.impact.sol_extracted} SOL (≈${v.impact.usd_extracted}) extracted
          </p>
        )}
        {v.impact.transaction && (
          <a href={v.impact.transaction.explorer_url} target="_blank" rel="noopener noreferrer"
             className="font-mono text-[13px] text-[#A78BFA] hover:underline mt-1 inline-block">
            view on solscan ↗
          </a>
        )}
      </div>

      <div className="mb-6">
        <p className="font-mono text-[12px] uppercase tracking-wide text-[#525252] mb-3">Recommendation</p>
        <p className="text-[#A3A3A3] leading-[1.7]">{v.recommendation}</p>
      </div>

      <p className="font-mono text-[13px] italic text-[#525252]">
        Discovered by {v.discovered_by.attacker_name} after {v.discovered_by.attempts_until_success} attempts
      </p>
    </div>
  )
}

function scoreColor(score: number) {
  if (score < 30) return "text-[#FF3344]"
  if (score < 60) return "text-[#FFB020]"
  return "text-[#4ADE80]"
}

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
        if (data) { setReport(data); setPending(false) }
        else if (tries++ < 30) setTimeout(poll, 2000)
        else { setError("Report timed out"); setPending(false) }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report")
        setPending(false)
      }
    }
    poll()
  }, [id])

  if (pending) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <p className="font-mono text-sm text-[#525252] animate-pulse">Generating report…</p>
    </div>
  )

  if (error || !report) return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
      <p className="font-mono text-sm text-[#FF3344]">{error || "Report not found"}</p>
      <Link href={`/audit/${id}`} className="font-mono text-xs text-[#525252] hover:text-[#A3A3A3]">← back to dashboard</Link>
    </div>
  )

  const solExtracted = report.stats.total_sol_at_risk
  const usdExtracted = report.stats.total_usd_at_risk
  const auditDate = new Date(report.completed_at).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })
  const duration = Math.round(report.duration_seconds / 60)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Top utility bar */}
      <div className="sticky top-0 z-50 border-b border-[#262626] bg-[#0A0A0A]">
        <div className="mx-auto max-w-[720px] px-6 h-14 flex items-center justify-between">
          <Link href={`/audit/${id}`} className="font-mono text-[13px] lowercase text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
            ← back to dashboard
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-[720px] px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#525252] mb-4">
            Security Audit Report
          </p>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] text-[#F5F5F5] mb-3">
            {report.agent.display_name}
          </h1>
          <p className="text-[#A3A3A3] mb-8">
            Audited on {auditDate} · Duration: {duration} minute{duration !== 1 ? "s" : ""}
          </p>

          {/* Score */}
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

        {/* Executive Summary */}
        {report.summary && (
          <section className="mb-16">
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#F5F5F5] mb-6">Executive Summary</h2>
            <p className="text-[17px] text-[#A3A3A3] leading-[1.7]">{report.summary}</p>
          </section>
        )}

        {/* Stats row */}
        <section className="grid grid-cols-4 gap-6 mb-16 py-8 border-y border-[#262626]">
          {[
            { value: String(report.stats.total_vulnerabilities), label: "vulnerabilities found" },
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

        {/* Findings */}
        <section className="mb-16">
          <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#F5F5F5] mb-8">Findings</h2>
          {report.vulnerabilities.length === 0 ? (
            <p className="font-mono text-sm text-[#4ADE80]">No vulnerabilities found. Agent is secure.</p>
          ) : (
            <div className="space-y-12">
              {report.vulnerabilities.map((v) => <FindingBlock key={v.id} v={v} />)}
            </div>
          )}
        </section>

        {/* On-chain evidence */}
        {report.vulnerabilities.some(v => v.impact.transaction) && (
          <section className="mb-16">
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#F5F5F5] mb-6">On-Chain Evidence</h2>
            <p className="text-[#A3A3A3] leading-[1.7] mb-6">
              Each finding is permanently recorded on Solana devnet via a custom Anchor program. Verifiable below.
            </p>
            <div className="space-y-3">
              {report.vulnerabilities
                .filter(v => v.impact.transaction)
                .map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-3 border-b border-[#262626] last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[13px] text-[#A3A3A3]">
                        {v.impact.transaction!.tx_hash.slice(0, 4)}...{v.impact.transaction!.tx_hash.slice(-4)}
                      </span>
                      <SeverityBadge severity={v.severity} />
                    </div>
                    <a href={v.impact.transaction!.explorer_url} target="_blank" rel="noopener noreferrer"
                       className="font-mono text-[13px] text-[#A78BFA] hover:underline">
                      view on solscan ↗
                    </a>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center pt-8">
          <Link href="/" className="inline-block px-8 py-3 bg-[#1F1F1F] text-[#F5F5F5] font-mono text-[14px] rounded-lg hover:bg-[#262626] transition-colors">
            Run another audit
          </Link>
        </div>
      </main>
    </div>
  )
}
