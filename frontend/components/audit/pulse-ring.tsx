"use client"

import { motion, AnimatePresence } from "framer-motion"

interface PulseRingProps {
  show: boolean
  color?: string
}

export function PulseRing({ show, color = "#FF3344" }: PulseRingProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {[0, 0.18, 0.36].map((delay, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute inset-0 rounded-lg border-2"
              style={{ borderColor: color }}
              initial={{ opacity: 0.45, scale: 1 }}
              animate={{ opacity: 0, scale: 1.18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, delay, ease: "easeOut" }}
              aria-hidden
            />
          ))}
        </>
      )}
    </AnimatePresence>
  )
}
