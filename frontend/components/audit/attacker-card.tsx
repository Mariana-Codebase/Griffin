"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export type AttackerStatus = "idle" | "attacking" | "succeeded" | "failed"

interface AttackerCardProps {
  index: number
  name: string
  status: AttackerStatus
  currentAttempt: string
  attemptCount: number
  onExploit?: () => void
}

const statusConfig = {
  idle: { dot: "#525252", label: "STANDBY", labelColor: "#525252" },
  attacking: { dot: "#F5F5F5", label: "ATTACKING", labelColor: "#F5F5F5" },
  succeeded: { dot: "#FF3344", label: "EXPLOIT FOUND", labelColor: "#FF3344" },
  failed: { dot: "#3F3F3F", label: "EXHAUSTED", labelColor: "#525252" },
}

export function AttackerCard({ index, name, status, currentAttempt, attemptCount, onExploit }: AttackerCardProps) {
  const [showFlash, setShowFlash] = useState(false)
  const [prevStatus, setPrevStatus] = useState(status)
  const config = statusConfig[status]
  
  useEffect(() => {
    if (status === "succeeded" && prevStatus !== "succeeded") {
      setShowFlash(true)
      onExploit?.()
      const timer = setTimeout(() => setShowFlash(false), 1500)
      return () => clearTimeout(timer)
    }
    setPrevStatus(status)
  }, [status, prevStatus, onExploit])

  return (
    <motion.div
      className="relative w-full h-[180px] border border-[#262626] rounded-lg bg-[#141414] p-4 flex flex-col overflow-hidden"
      animate={
        status === "attacking"
          ? { borderColor: ["#262626", "#404040", "#262626"] }
          : status === "succeeded" && showFlash
          ? { borderColor: "#FF3344" }
          : { borderColor: "#262626" }
      }
      transition={
        status === "attacking"
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      {/* Flash overlay */}
      {showFlash && (
        <motion.div
          className="absolute inset-0 bg-[#FF3344] rounded-lg"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      )}
      
      {/* Index and name */}
      <p className="font-mono text-[11px] text-[#525252] uppercase tracking-wider">
        {String(index).padStart(2, "0")} / {name}
      </p>
      
      {/* Status */}
      <div className="mt-4 flex items-center gap-2">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: config.dot }}
          animate={
            status === "attacking"
              ? { opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }
              : {}
          }
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span
          className="font-mono text-xs tracking-wider"
          style={{ color: config.labelColor }}
        >
          {config.label}
        </span>
      </div>
      
      {/* Current attempt */}
      <p className="mt-3 font-mono text-xs italic text-[#525252] line-clamp-2 flex-1">
        {currentAttempt}
      </p>
      
      {/* Attempt count */}
      <p className="mt-auto font-mono text-[11px] text-[#3F3F3F]">
        {attemptCount} attempts
      </p>
    </motion.div>
  )
}
