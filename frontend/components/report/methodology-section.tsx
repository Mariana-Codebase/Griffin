import type { AuditReport } from "@/lib/types"
import { SectionHeading, FieldLabel } from "./section-heading"

interface Props {
  methodology: AuditReport["methodology"]
  kicker: string
}

export function MethodologySection({ methodology, kicker }: Props) {
  if (!methodology) return null

  const items = [
    { label: "Isolation Strategy",      value: methodology.isolation },
    { label: "Success Criteria",        value: methodology.success_criteria },
    { label: "On-Chain Verification",   value: methodology.on_chain_verification },
  ]

  return (
    <section className="mb-20 print:break-inside-avoid">
      <SectionHeading kicker={kicker} title="Methodology" />

      <p className="text-[#A3A3A3] leading-[1.75] mb-10 max-w-[680px]">
        {methodology.approach}
      </p>

      {/* Vectors tested as compact tags */}
      {methodology.vectors_tested?.length > 0 && (
        <div className="mb-10">
          <FieldLabel>Vectors Tested</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {methodology.vectors_tested.map((v) => (
              <span
                key={v}
                className="inline-block px-2.5 py-1 border border-[#262626] font-mono text-[11px] text-[#A3A3A3]"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-0 max-w-[680px]">
        {items.map(({ label, value }) => (
          <div key={label} className="py-5 border-b border-[#262626] last:border-0">
            <FieldLabel>{label}</FieldLabel>
            <p className="text-[#A3A3A3] leading-[1.7]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
