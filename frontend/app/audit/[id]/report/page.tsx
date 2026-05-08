"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, ArrowLeft, Copy, CheckCheck } from "lucide-react";
import { getAuditReport } from "@/lib/api";
import type { AuditReport, Vulnerability } from "@/lib/types";

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-accent-red/10 text-accent-red border-accent-red/30",
  high:     "bg-accent-amber/10 text-accent-amber border-accent-amber/30",
  medium:   "bg-accent-violet/10 text-accent-violet border-accent-violet/30",
  low:      "bg-bg-elevated text-text-secondary border-border",
};

const SCORE_COLOR = (score: number) =>
  score < 30 ? "text-accent-red" : score < 60 ? "text-accent-amber" : "text-accent-mint";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-text-tertiary hover:text-text-secondary transition-colors p-1"
    >
      {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
    </button>
  );
}

function VulnBlock({ v }: { v: Vulnerability }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-bg-elevated transition-colors"
      >
        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${SEVERITY_STYLE[v.severity]}`}>
          {v.severity}
        </span>
        <span className="text-text-primary text-sm font-medium flex-1">{v.title}</span>
        <span className="text-text-tertiary text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-5 space-y-4 border-t border-border bg-bg-surface/50">
          <p className="text-text-secondary text-sm leading-relaxed pt-4">{v.description}</p>

          <div>
            <p className="text-text-tertiary text-xs font-mono uppercase tracking-widest mb-2">Exploit Prompt</p>
            <div className="flex items-start gap-2 bg-bg-elevated rounded p-3">
              <code className="text-accent-amber font-mono text-xs break-all flex-1">{v.exploit_prompt}</code>
              <CopyButton text={v.exploit_prompt} />
            </div>
          </div>

          <div>
            <p className="text-text-tertiary text-xs font-mono uppercase tracking-widest mb-2">Impact</p>
            <p className="text-text-secondary text-sm">{v.impact.summary}</p>
            {v.impact.sol_extracted > 0 && (
              <p className="text-accent-red font-mono text-sm mt-1">{v.impact.sol_extracted} SOL extracted (≈${v.impact.usd_extracted})</p>
            )}
            {v.impact.transaction && (
              <a href={v.impact.transaction.explorer_url} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1 text-accent-violet text-xs font-mono mt-1 hover:underline">
                View on Solscan <ExternalLink size={10} />
              </a>
            )}
          </div>

          <div>
            <p className="text-text-tertiary text-xs font-mono uppercase tracking-widest mb-2">Recommendation</p>
            <p className="text-text-secondary text-sm leading-relaxed">{v.recommendation}</p>
          </div>

          <p className="text-text-tertiary text-xs font-mono">
            Discovered by <span className="text-text-secondary">{v.discovered_by.attacker_name}</span> · attempt {v.discovered_by.attempts_until_success}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let tries = 0;
    async function fetch() {
      try {
        const data = await getAuditReport(id);
        if (data) { setReport(data); setPending(false); }
        else if (tries++ < 20) setTimeout(fetch, 2000);
        else { setError("Report timed out"); setPending(false); }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
        setPending(false);
      }
    }
    fetch();
  }, [id]);

  if (pending) return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center">
      <p className="text-text-tertiary font-mono text-sm animate-pulse">Generating report…</p>
    </main>
  );

  if (error || !report) return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center flex-col gap-4">
      <p className="text-accent-red font-mono text-sm">{error || "Report not found"}</p>
      <button onClick={() => router.push(`/audit/${id}`)} className="text-text-tertiary text-xs hover:text-text-secondary">
        ← Back to dashboard
      </button>
    </main>
  );

  return (
    <main className="min-h-screen bg-bg-base">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {/* Back */}
        <button onClick={() => router.push(`/audit/${id}`)}
          className="flex items-center gap-2 text-text-tertiary text-xs hover:text-text-secondary transition-colors">
          <ArrowLeft size={14} /> Back to dashboard
        </button>

        {/* Header */}
        <div className="space-y-2 border-b border-border pb-8">
          <p className="text-text-tertiary text-xs font-mono uppercase tracking-widest">Security Audit Report</p>
          <h1 className="text-text-primary text-3xl font-semibold">{report.agent.display_name}</h1>
          <p className="text-text-secondary text-sm font-mono">{report.agent.url}</p>
          <div className="flex items-end gap-6 pt-4">
            <div>
              <p className={`text-6xl font-mono font-semibold ${SCORE_COLOR(report.security_score)}`}>
                {report.security_score}
              </p>
              <p className="text-text-tertiary text-xs font-mono">/100</p>
            </div>
            <div className="pb-2">
              <p className={`text-lg font-semibold ${SCORE_COLOR(report.security_score)}`}>{report.risk_label}</p>
              <p className="text-text-tertiary text-xs font-mono">{report.duration_seconds}s · {report.stats.total_attempts} attempts</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Vulnerabilities", value: report.stats.total_vulnerabilities },
            { label: "SOL at risk", value: `${report.stats.total_sol_at_risk} SOL` },
            { label: "USD at risk", value: `$${report.stats.total_usd_at_risk}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-bg-surface border border-border rounded-lg p-4">
              <p className="text-text-tertiary text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
              <p className="text-text-primary font-mono text-xl font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        {report.summary && (
          <div className="space-y-2">
            <h2 className="text-text-tertiary text-xs font-mono uppercase tracking-widest">Executive Summary</h2>
            <p className="text-text-secondary text-base leading-relaxed">{report.summary}</p>
          </div>
        )}

        {/* Vulnerabilities */}
        <div className="space-y-3">
          <h2 className="text-text-tertiary text-xs font-mono uppercase tracking-widest">
            Vulnerabilities ({report.vulnerabilities.length})
          </h2>
          {report.vulnerabilities.length === 0 ? (
            <p className="text-accent-mint font-mono text-sm">No vulnerabilities found. Agent is secure.</p>
          ) : (
            report.vulnerabilities.map((v) => <VulnBlock key={v.id} v={v} />)
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-6 flex items-center justify-between text-text-tertiary text-xs font-mono">
          <span>Griffin · Solana devnet</span>
          <span>{new Date(report.completed_at).toLocaleString()}</span>
        </div>
      </div>
    </main>
  );
}
