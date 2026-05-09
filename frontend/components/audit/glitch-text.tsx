"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface GlitchProps {
  trigger: boolean
  children: React.ReactNode
  className?: string
}

export function GlitchOverlay({ trigger, children, className = "" }: GlitchProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (trigger) {
      setActive(true)
      const t = setTimeout(() => setActive(false), 700)
      return () => clearTimeout(t)
    }
  }, [trigger])

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <AnimatePresence>
        {active && (
          <>
            <motion.span
              key="r"
              className="absolute inset-0 z-0 text-[#FF3344] mix-blend-screen pointer-events-none select-none"
              initial={{ x: -3, opacity: 0 }}
              animate={{ x: [-3, 2, -1, 0], opacity: [0.85, 0.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              aria-hidden
            >
              {children}
            </motion.span>
            <motion.span
              key="b"
              className="absolute inset-0 z-0 text-[#A78BFA] mix-blend-screen pointer-events-none select-none"
              initial={{ x: 3, opacity: 0 }}
              animate={{ x: [3, -2, 1, 0], opacity: [0.7, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              aria-hidden
            >
              {children}
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </span>
  )
}
