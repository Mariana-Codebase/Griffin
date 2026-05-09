import { cn } from "@/lib/utils"

export type Severity = "critical" | "high" | "medium" | "low"

const STYLES: Record<Severity, string> = {
  critical: "bg-[#FF3344] text-white",
  high:     "bg-[#FFB020] text-[#0A0A0A]",
  medium:   "bg-[#3F3F3F] text-[#F5F5F5]",
  low:      "bg-[#262626] text-[#A3A3A3]",
}

const DOT: Record<Severity, string> = {
  critical: "bg-[#FF3344]",
  high:     "bg-[#FFB020]",
  medium:   "bg-[#A3A3A3]",
  low:      "bg-[#525252]",
}

interface Props {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className }: Props) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] leading-none",
        STYLES[severity],
        className,
      )}
    >
      {severity}
    </span>
  )
}

export function SeverityDot({ severity, className }: Props) {
  return <span className={cn("inline-block w-1.5 h-1.5 rounded-full", DOT[severity], className)} />
}
