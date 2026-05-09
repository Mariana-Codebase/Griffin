import { SectionHeading } from "./section-heading"

interface Props {
  summary: string
}

export function ExecutiveSummary({ summary }: Props) {
  if (!summary) return null

  const trimmed = summary.trim()
  const firstChar = trimmed.charAt(0)
  const rest = trimmed.slice(1)

  return (
    <section className="mb-20 print:break-inside-avoid">
      <SectionHeading kicker="01" title="Executive Summary" />
      <div className="max-w-[640px]">
        <p className="text-[18px] text-[#A3A3A3] leading-[1.75] [text-wrap:pretty]">
          <span
            aria-hidden
            className="float-left mr-3 mt-1 hidden md:block font-mono text-[64px] font-semibold leading-none text-[#F5F5F5]"
            style={{ shapeOutside: "margin-box" }}
          >
            {firstChar}
          </span>
          <span className="md:hidden">{firstChar}</span>
          {rest}
        </p>
      </div>
    </section>
  )
}
