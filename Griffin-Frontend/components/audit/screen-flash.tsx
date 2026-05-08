"use client"

import { motion, AnimatePresence } from "framer-motion"

interface ScreenFlashProps {
  show: boolean
}

export function ScreenFlash({ show }: ScreenFlashProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[100] bg-[#FF3344]"
          initial={{ opacity: 0.08 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      )}
    </AnimatePresence>
  )
}
