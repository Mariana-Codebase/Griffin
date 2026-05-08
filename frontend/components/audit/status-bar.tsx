"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface StatusBarProps {
  targetName: string
  targetUrl: string
  balance: number
  usdValue: number
  elapsed: number
  attempts: number
}

function AnimatedNumber({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(value)
  
  useEffect(() => {
    const duration = 800
    const startValue = displayValue
    const startTime = Date.now()
    
    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (value - startValue) * eased
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value])
  
  return <span>{displayValue.toFixed(decimals)}</span>
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const hrs = Math.floor(mins / 60)
  return `${hrs.toString().padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function StatusBar({ targetName, targetUrl, balance, usdValue, elapsed, attempts }: StatusBarProps) {
  return (
    <div className="sticky top-0 z-50 border-b border-[#262626] bg-[#0A0A0A]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Left: Target */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-[#FF3344]"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-[#F5F5F5] font-medium">{targetName}</span>
            </div>
            <p className="mt-1 font-mono text-xs text-[#525252]">{targetUrl}</p>
          </div>
          
          {/* Center: Balance */}
          <div className="flex-1 text-center">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#525252]">Balance</p>
            <div className="mt-1">
              <span className="font-mono text-6xl font-semibold text-[#F5F5F5] tabular-nums">
                <AnimatedNumber value={balance} />
              </span>
              <span className="ml-2 font-mono text-2xl text-[#A3A3A3]">SOL</span>
            </div>
            <p className="mt-1 font-mono text-sm text-[#525252]">${usdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>
          
          {/* Right: Elapsed & Attempts */}
          <div className="flex-1 flex justify-end">
            <div className="text-right space-y-2">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#525252]">Elapsed</p>
                <p className="font-mono text-xl text-[#F5F5F5] tabular-nums">{formatTime(elapsed)}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#525252]">Attempts</p>
                <p className="font-mono text-xl text-[#F5F5F5] tabular-nums">{attempts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
