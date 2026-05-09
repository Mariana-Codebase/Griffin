import { ExternalLink } from "lucide-react"
import type { OnChainSummary } from "@/lib/types"
import { SectionHeading, FieldLabel } from "./section-heading"

interface Props {
  summary: OnChainSummary
  kicker: string
}

export function OnChainEvidence({ summary, kicker }: Props) {
  if (!summary?.total_transactions) return null

  return (
    <section className="mb-20 print:break-inside-avoid">
      <SectionHeading
        kicker={kicker}
        title="On-Chain Evidence"
        meta={`${summary.total_transactions} transaction${summary.total_transactions === 1 ? "" : "s"} verified`}
      />

      <p className="text-[#A3A3A3] leading-[1.75] mb-8 max-w-[680px]">
        Each finding below is permanently recorded on Solana devnet via a custom Anchor program.
        These transactions are publicly verifiable and constitute irrefutable proof of the audit.
      </p>

      <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10 pb-8 border-b border-[#262626]">
        <div>
          <FieldLabel>Program ID</FieldLabel>
          <p className="font-mono text-[12px] text-[#A3A3A3] break-all">
            {summary.program_id}
          </p>
        </div>
        <div>
          <FieldLabel>Network</FieldLabel>
          <p className="font-mono text-[12px] text-[#A3A3A3] uppercase">
            {summary.network}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {summary.transactions.map((tx, i) => (
          <div
            key={tx.tx_hash}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-5 py-4 border-b border-[#262626] last:border-0"
          >
            <span className="font-mono text-[20px] font-semibold text-[#262626] tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-mono text-[13px] text-[#A3A3A3]">
                  {tx.tx_hash.slice(0, 8)}…{tx.tx_hash.slice(-8)}
                </span>
                <span className="font-mono text-[14px] text-[#FF3344] tabular-nums">
                  −{tx.amount_sol} SOL
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#525252] mt-1">
                {new Date(tx.timestamp).toLocaleString()}
              </p>
            </div>

            <a
              href={tx.explorer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[12px] text-[#A78BFA] hover:underline shrink-0"
            >
              solscan
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
