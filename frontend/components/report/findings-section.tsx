import type { Vulnerability } from "@/lib/types"
import { SectionHeading } from "./section-heading"
import { Finding } from "./finding"
import { FindingsTOC } from "./findings-toc"

interface Props {
  vulnerabilities: Vulnerability[]
  kicker: string
}

const ANCHOR_BASE = "finding"

export function FindingsSection({ vulnerabilities, kicker }: Props) {
  if (vulnerabilities.length === 0) {
    return (
      <section className="mb-20">
        <SectionHeading kicker={kicker} title="Findings" />
        <div className="bg-[#0F0F0F] border border-[#262626] p-10 text-center">
          <p
            className="font-mono text-[14px] text-[#4ADE80] uppercase tracking-[0.18em] mb-3"
          >
            No vulnerabilities found
          </p>
          <p className="text-[#A3A3A3] leading-[1.75] max-w-md mx-auto">
            The agent successfully repelled all five attack vectors. No exploit was authorized,
            no funds were extracted.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-20">
      <SectionHeading
        kicker={kicker}
        title="Findings"
        meta={`${vulnerabilities.length} vulnerabilit${vulnerabilities.length === 1 ? "y" : "ies"} discovered`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-12">
        <div className="space-y-16 min-w-0">
          {vulnerabilities.map((v, i) => (
            <Finding key={v.id} index={i + 1} vuln={v} anchor={`${ANCHOR_BASE}-${i}`} />
          ))}
        </div>
        <aside className="hidden xl:block">
          <FindingsTOC vulnerabilities={vulnerabilities} anchorBase={ANCHOR_BASE} />
        </aside>
      </div>
    </section>
  )
}
