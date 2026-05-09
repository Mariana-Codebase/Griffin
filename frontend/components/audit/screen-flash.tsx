"use client"

import { motion, AnimatePresence } from "framer-motion"

interface ScreenFlashProps {
  show: boolean
}

/**
 * Choreographed full-screen exploit signal.
 *  - 0..120ms : red wash 6%
 *  - 0..600ms : two horizontal scan-bars sweep top→bottom and bottom→top
 *  - 120..900ms: red wash decays
 */
export function ScreenFlash({ show }: ScreenFlashProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            key="wash"
            className="fixed inset-0 pointer-events-none z-[100] bg-[#FF3344]"
            initial={{ opacity: 0.06 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          />
          <motion.div
            key="scan-down"
            className="fixed left-0 right-0 pointer-events-none z-[100] h-[2px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, #FF3344, transparent)",
              boxShadow: "0 0 22px rgba(255,51,68,0.7)",
            }}
            initial={{ top: "0%", opacity: 1 }}
            animate={{ top: "100%", opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
          <motion.div
            key="scan-up"
            className="fixed left-0 right-0 pointer-events-none z-[100] h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(245,245,245,0.7), transparent)",
            }}
            initial={{ top: "100%", opacity: 0.6 }}
            animate={{ top: "0%", opacity: [0.6, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </>
      )}
    </AnimatePresence>
  )
}
