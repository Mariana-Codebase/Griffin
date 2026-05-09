"use client"

import { motion } from "framer-motion"

interface Props {
  status: "starting" | "running" | "completed" | "failed"
}

const config: Record<
  Props["status"],
  { color: string; label: string; pulse: boolean }
> = {
  starting:  { color: "#A78BFA", label: "initializing",         pulse: true  },
  running:   { color: "#FF3344", label: "live · polling 1.5s",  pulse: true  },
  completed: { color: "#4ADE80", label: "audit complete",       pulse: false },
  failed:    { color: "#FFB020", label: "audit failed",         pulse: false },
}

export function PollingIndicator({ status }: Props) {
  const cfg = config[status]
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {cfg.pulse && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: cfg.color }}
            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 2.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            aria-hidden
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: cfg.color }}
        />
      </span>
      <span
        className="font-mono text-[11px] uppercase tracking-[0.18em]"
        style={{ color: cfg.color }}
      >
        {cfg.label}
      </span>
    </div>
  )
}
