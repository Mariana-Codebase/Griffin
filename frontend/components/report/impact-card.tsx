import { ExternalLink } from "lucide-react"
import type { Vulnerability } from "@/lib/types"

interface Props {
  impact: Vulnerability["impact"]
}

export function ImpactCard({ impact }: Props) {
  const hasFunds = impact.sol_extracted > 0

  return (
    <div className="bg-[#0F0F0F] border border-[#262626] p-5 print:bg-[#fafafa]">
      <p className="text-[#A3A3A3] leading-[1.7] print:text-[#111]">{impact.summary}</p>

      {hasFunds && (
        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="font-mono text-[24px] text-[#FF3344] tabular-nums leading-none">
            {impact.sol_extracted} <span className="text-[14px] text-[#525252] font-normal">SOL</span>
          </span>
          <span className="font-mono text-[13px] text-[#525252] tabular-nums">
            ≈ ${impact.usd_extracted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {impact.transaction && (
        <a
          href={impact.transaction.explorer_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] text-[#A78BFA] hover:underline"
        >
          {impact.transaction.tx_hash.slice(0, 8)}…{impact.transaction.tx_hash.slice(-8)}
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}
