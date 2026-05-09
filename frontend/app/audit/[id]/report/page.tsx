"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AlertOctagon } from "lucide-react"
import { getAuditReport, getBriefingUrl } from "@/lib/api"
import type { AuditReport } from "@/lib/types"

import { ReportShell } from "@/components/report/report-shell"
import { ReportCover } from "@/components/report/report-cover"
import { StatsHero } from "@/components/report/stats-hero"
import { ExecutiveSummary } from "@/components/report/executive-summary"
import { FindingsSection } from "@/components/report/findings-section"
import { MethodologySection } from "@/components/report/methodology-section"
import { AttackerPerformanceTable } from "@/components/report/attacker-performance-table"
import { OnChainEvidence } from "@/components/report/on-chain-evidence"
import { RemediationRoadmap } from "@/components/report/remediation-roadmap"
import { MetadataFooter } from "@/components/report/metadata-footer"
import { BriefingPlayer } from "@/components/report/BriefingPlayer"
import { ReportSkeleton } from "@/components/report/report-skeleton"

export default function AuditReportPage() {
  const { id } = useParams<{ id: string }>()
  const [report,         setReport]         = useState<AuditReport | null>(null)
  const [pending,        setPending]        = useState(true)
  const [error,          setError]          = useState("")
  const [showBriefing,   setShowBriefing]   = useState(false)

  useEffect(() => {
    let tries = 0
    let cancelled = false

    async function poll() {
      try {
        const data = await getAuditReport(id)
        if (cancelled) return
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
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load report")
          setPending(false)
        }
      }
    }

    poll()
    return () => { cancelled = true }
  }, [id])

  const handleDownload = () => {
    const original = document.title
    if (report) {
      document.title = `Griffin-Audit-${report.agent.display_name}-${report.audit_id}`
    }
    window.print()
    setTimeout(() => { document.title = original }, 1500)
  }

  // ── Pending ──
  if (pending) {
    return (
      <ReportShell
        auditId={id}
        onListen={() => {}}
        onDownload={() => {}}
        listening={false}
      >
        <ReportSkeleton />
      </ReportShell>
    )
  }

  // ── Error ──
  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-5 px-6">
        <AlertOctagon className="w-8 h-8 text-[#A78BFA]" />
        <p className="font-mono text-[13px] text-[#FF3344]">{error || "Report not found"}</p>
        <Link
          href={`/audit/${id}`}
          className="font-mono text-[12px] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
        >
          ← back to dashboard
        </Link>
      </div>
    )
  }

  // ── Loaded ──
  const auditDate = new Date(report.completed_at).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const durationMinutes = Math.max(1, Math.round(report.duration_seconds / 60))

  return (
    <ReportShell
      auditId={id}
      onListen={() => setShowBriefing((v) => !v)}
      onDownload={handleDownload}
      listening={showBriefing}
    >
      <ReportCover
        displayName={report.agent.display_name}
        url={report.agent.url}
        auditDate={auditDate}
        durationMinutes={durationMinutes}
        score={report.security_score}
        riskLabel={report.risk_label}
      />

      <StatsHero
        solExtracted={report.stats.total_sol_at_risk}
        usdExtracted={report.stats.total_usd_at_risk}
        totalVulnerabilities={report.stats.total_vulnerabilities}
        totalAttempts={report.stats.total_attempts}
        bySeverity={report.stats.by_severity}
      />

      {showBriefing && (
        <div className="mb-20">
          <BriefingPlayer briefingUrl={getBriefingUrl(id)} />
        </div>
      )}

      <ExecutiveSummary summary={report.summary} />

      <FindingsSection vulnerabilities={report.vulnerabilities} kicker="02" />

      <MethodologySection methodology={report.methodology} kicker="03" />

      <AttackerPerformanceTable breakdown={report.attacker_breakdown} kicker="04" />

      <OnChainEvidence summary={report.on_chain_summary} kicker="05" />

      <RemediationRoadmap recommendations={report.recommendations_summary} kicker="06" />

      <MetadataFooter metadata={report.metadata} />

      {/* CTA */}
      <div className="text-center pt-12 print:hidden">
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#1F1F1F] text-[#F5F5F5] font-mono text-[13px] hover:bg-[#262626] transition-colors"
        >
          Run another audit
        </Link>
      </div>
    </ReportShell>
  )
}
