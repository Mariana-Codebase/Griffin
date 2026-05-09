"use client"

import { motion } from "framer-motion"

interface Props {
  pulseKey: number // bumps when an exploit fires
  children: React.ReactNode
}

export function AuditShell({ pulseKey, children }: Props) {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Static grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 50%, transparent 100%)",
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 30%, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Exploit pulse — radial flash from center on event */}
      <motion.div
        key={pulseKey}
        aria-hidden
        className="pointer-events-none fixed inset-0"
        initial={{ opacity: 0 }}
        animate={pulseKey > 0 ? { opacity: [0, 0.35, 0] } : { opacity: 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 35%, rgba(255,51,68,0.35), transparent 70%)",
        }}
      />

      {/* Scan-line drift — extremely subtle */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  )
}
