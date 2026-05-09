import type { Recommendation } from "@/lib/types"
import { SectionHeading } from "./section-heading"
import { SeverityBadge, type Severity } from "./severity-badge"

const ACCENT: Record<string, string> = {
  critical: "#FF3344",
  high:     "#FFB020",
  medium:   "#A3A3A3",
  low:      "#525252",
}

interface Props {
  recommendations: Recommendation[]
  kicker: string
}

export function RemediationRoadmap({ recommendations, kicker }: Props) {
  if (!recommendations?.length) return null

  return (
    <section className="mb-20">
      <SectionHeading kicker={kicker} title="Remediation Roadmap" />

      <ol className="space-y-6">
        {recommendations.map((rec) => {
          const accent = ACCENT[rec.severity] ?? "#525252"
          const isTopPriority = rec.priority <= 2

          return (
            <li
              key={rec.priority}
              className="grid grid-cols-[auto_1fr] gap-6 items-start print:break-inside-avoid"
            >
              <span
                className="font-mono text-[44px] font-semibold leading-none tabular-nums shrink-0 select-none"
                style={{ color: isTopPriority ? accent : "#262626" }}
              >
                {String(rec.priority).padStart(2, "0")}
              </span>

              <div
                className="border-l-2 pl-5 py-1"
                style={{ borderColor: accent }}
              >
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <SeverityBadge severity={rec.severity as Severity} />
                  <span
                    className={`font-medium leading-tight ${
                      isTopPriority ? "text-[#F5F5F5]" : "text-[#A3A3A3]"
                    }`}
                  >
                    {rec.finding}
                  </span>
                </div>
                <p className="text-[#A3A3A3] leading-[1.7] max-w-[680px]">
                  {rec.action}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
