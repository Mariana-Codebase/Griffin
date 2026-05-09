import type { AttackerBreakdown } from "@/lib/types"
import { SectionHeading } from "./section-heading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Props {
  breakdown: AttackerBreakdown[]
  kicker: string
}

export function AttackerPerformanceTable({ breakdown, kicker }: Props) {
  if (!breakdown?.length) return null

  return (
    <section className="mb-20 print:break-inside-avoid">
      <SectionHeading kicker={kicker} title="Attacker Performance" />

      <Table className="font-mono">
        <TableHeader>
          <TableRow className="border-[#262626] hover:bg-transparent">
            {["Attacker", "Attempts", "Result", "Rate"].map((h) => (
              <TableHead
                key={h}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#525252] h-auto pb-3"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {breakdown.map((a) => (
            <TableRow key={a.id} className="border-[#262626] hover:bg-transparent align-top">
              <TableCell className="py-5 pr-6">
                <p className="text-[14px] text-[#F5F5F5] leading-tight mb-1">{a.name}</p>
                <p className="text-[11px] text-[#525252] leading-relaxed line-clamp-2 max-w-[420px]">
                  {a.methodology_brief}
                </p>
              </TableCell>
              <TableCell className="py-5 text-[13px] text-[#A3A3A3] tabular-nums w-20">
                {a.attempts}
              </TableCell>
              <TableCell className="py-5 w-28">
                <span
                  className={`text-[11px] uppercase tracking-[0.12em] ${
                    a.succeeded ? "text-[#FF3344]" : "text-[#525252]"
                  }`}
                >
                  {a.succeeded ? "exploit" : "repelled"}
                </span>
              </TableCell>
              <TableCell className="py-5 w-20 text-[13px] text-[#A3A3A3] tabular-nums">
                {a.succeeded ? `${a.success_rate}%` : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
