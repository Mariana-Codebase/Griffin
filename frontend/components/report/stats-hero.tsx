interface Props {
  solExtracted: number
  usdExtracted: number
  totalVulnerabilities: number
  totalAttempts: number
  bySeverity: Record<string, number>
}

const SEVERITIES: { key: string; label: string; color: string }[] = [
  { key: "critical", label: "Critical", color: "#FF3344" },
  { key: "high",     label: "High",     color: "#FFB020" },
  { key: "medium",   label: "Medium",   color: "#A3A3A3" },
  { key: "low",      label: "Low",      color: "#525252" },
]

export function StatsHero({
  solExtracted,
  usdExtracted,
  totalVulnerabilities,
  totalAttempts,
  bySeverity,
}: Props) {
  const drained = solExtracted > 0

  return (
    <section className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-16 gap-y-10 mb-20 print:break-inside-avoid">
      {/* ── Hero stat: SOL extracted ── */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3F3F3F] mb-2">
          Funds Extracted
        </p>
        <p
          className="font-mono text-[64px] font-semibold leading-none tabular-nums"
          style={{ color: drained ? "#FF3344" : "#4ADE80" }}
        >
          {solExtracted.toFixed(2)}
          <span className="text-[28px] text-[#3F3F3F] ml-2 font-normal">SOL</span>
        </p>
        <p className="font-mono text-[14px] text-[#525252] tabular-nums mt-2">
          ≈ ${usdExtracted.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
        </p>
      </div>

      {/* ── Supporting stats grid ── */}
      <div className="grid grid-cols-2 gap-y-8 gap-x-12 self-end pb-2">
        <Cell value={String(totalVulnerabilities)} label="Vulnerabilities" />
        <Cell value={String(totalAttempts)} label="Total Attempts" />

        <div className="col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3F3F3F] mb-3">
            By Severity
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {SEVERITIES.map((s) => {
              const count = bySeverity[s.key] ?? 0
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                  <span className="font-mono text-[13px] tabular-nums" style={{ color: count > 0 ? "#F5F5F5" : "#525252" }}>
                    {count}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#525252]">
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3F3F3F] mb-2">
        {label}
      </p>
      <p className="font-mono text-[28px] text-[#F5F5F5] tabular-nums leading-none">
        {value}
      </p>
    </div>
  )
}
