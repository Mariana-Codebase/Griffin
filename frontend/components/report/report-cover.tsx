import { ScoreGauge } from "./score-gauge"

interface Props {
  displayName: string
  url: string
  auditDate: string
  durationMinutes: number
  score: number
  riskLabel: string
}

export function ReportCover({
  displayName,
  url,
  auditDate,
  durationMinutes,
  score,
  riskLabel,
}: Props) {
  return (
    <header className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-start mb-20 pb-16 border-b border-[#262626]">
      {/* ── Left: title block ── */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#525252] mb-6">
          Security Audit Report · Volume 01
        </p>

        <h1 className="text-[clamp(38px,6vw,64px)] font-semibold tracking-[-0.025em] leading-[1.05] text-[#F5F5F5] mb-6 break-words">
          {displayName}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-[#525252]">
          <span className="text-[#A3A3A3] break-all">{url}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] text-[#525252]">
          <span>
            <span className="text-[#3F3F3F] uppercase tracking-wider mr-2">date</span>
            {auditDate}
          </span>
          <span>
            <span className="text-[#3F3F3F] uppercase tracking-wider mr-2">duration</span>
            {durationMinutes} min{durationMinutes === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-10 h-px w-24 bg-[#FF3344]" aria-hidden />
      </div>

      {/* ── Right: score gauge ── */}
      <div className="md:pl-8">
        <ScoreGauge score={score} riskLabel={riskLabel} />
      </div>
    </header>
  )
}
