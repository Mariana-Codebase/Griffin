"use client"

import { motion } from "framer-motion"

interface Props {
  active: boolean
}

/**
 * Rotating conic-gradient that sits behind the card and is masked by an
 * inner panel, leaving only a thin perimeter sweep visible while attacking.
 */
export function AttackerSweep({ active }: Props) {
  if (!active) return null

  return (
    <span className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden" aria-hidden>
      <motion.span
        className="absolute left-1/2 top-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 250deg, rgba(245,245,245,0.55) 320deg, rgba(255,51,68,0.85) 355deg, transparent 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner mask — keeps the gradient as a 1px ring */}
      <span className="absolute inset-[1px] rounded-[7px] bg-[#141414]" aria-hidden />
    </span>
  )
}
