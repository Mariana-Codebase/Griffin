"use client"

import { motion } from "framer-motion"
import NumberFlow from "@number-flow/react"
import { Wallet, Activity, Clock, Target } from "lucide-react"
import { MiniSparkline } from "./mini-sparkline"
import { PollingIndicator } from "./polling-indicator"

interface StatusBarProps {
  targetName: string
  targetUrl: string
  balance: number
  initialBalance: number
  usdValue: number
  elapsed: number
  attempts: number
  vulnerabilities: number
  status: "starting" | "running" | "completed" | "failed"
  balanceHistory: number[]
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const hrs = Math.floor(safe / 3600)
  const mins = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function ChromeStat({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-3.5 h-3.5 text-[#525252] shrink-0" />
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#3F3F3F] leading-none">
          {label}
        </p>
        <div className="mt-1 leading-none">{children}</div>
      </div>
    </div>
  )
}

export function StatusBar({
  targetName,
  targetUrl,
  balance,
  initialBalance,
  usdValue,
  elapsed,
  attempts,
  vulnerabilities,
  status,
  balanceHistory,
}: StatusBarProps) {
  const drained = initialBalance > 0 && balance < initialBalance

  return (
    <div className="sticky top-12 z-40 border-b border-[#262626] bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* ── Target ── */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <PollingIndicator status={status} />
              </div>
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="text-[16px] font-medium text-[#F5F5F5] truncate">
                  {targetName || "—"}
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#525252] truncate max-w-[360px]">
                {targetUrl || "awaiting target..."}
              </p>
            </div>
          </div>

          {/* ── Balance (centerpiece) ── */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-2">
              <Wallet className="w-3 h-3 text-[#525252] mb-1" />
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#3F3F3F]">
                wallet balance
              </p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <motion.span
                animate={drained ? { color: ["#F5F5F5", "#FF3344", "#F5F5F5"] } : {}}
                transition={{ duration: 0.7 }}
                className="font-mono text-[clamp(40px,5vw,68px)] font-semibold tabular-nums leading-none text-[#F5F5F5]"
              >
                <NumberFlow
                  value={balance}
                  format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  transformTiming={{ duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                  spinTiming={{ duration: 900 }}
                  willChange
                />
              </motion.span>
              <span className="font-mono text-[18px] text-[#525252]">SOL</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <p className="font-mono text-[12px] text-[#525252] tabular-nums">
                $
                <NumberFlow
                  value={usdValue}
                  format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                />
              </p>
              <MiniSparkline values={balanceHistory} width={88} height={18} />
            </div>
          </div>

          {/* ── Telemetry ── */}
          <div className="flex items-center gap-6">
            <ChromeStat icon={Clock} label="elapsed">
              <p className="font-mono text-[16px] text-[#F5F5F5] tabular-nums">{formatTime(elapsed)}</p>
            </ChromeStat>
            <ChromeStat icon={Activity} label="attempts">
              <p className="font-mono text-[16px] text-[#F5F5F5] tabular-nums">
                <NumberFlow value={attempts} />
              </p>
            </ChromeStat>
            <ChromeStat icon={Target} label="exploits">
              <p
                className={`font-mono text-[16px] tabular-nums ${
                  vulnerabilities > 0 ? "text-[#FF3344]" : "text-[#F5F5F5]"
                }`}
              >
                <NumberFlow value={vulnerabilities} />
              </p>
            </ChromeStat>
          </div>
        </div>
      </div>
    </div>
  )
}
