"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import Tilt from "react-parallax-tilt"
import { AttackerGlyph } from "./attacker-glyph"
import { AttackerSweep } from "./attacker-sweep"
import { PulseRing } from "./pulse-ring"
import { GlitchOverlay } from "./glitch-text"

export type AttackerStatus = "idle" | "attacking" | "succeeded" | "failed"

interface AttackerCardProps {
  id: string
  index: number
  name: string
  status: AttackerStatus
  currentAttempt: string
  attemptCount: number
  onExploit?: () => void
}

const statusConfig = {
  idle: {
    dot: "#525252",
    label: "STANDBY",
    sublabel: "awaiting orchestrator",
    labelColor: "#525252",
    accent: "transparent",
  },
  attacking: {
    dot: "#F5F5F5",
    label: "ATTACKING",
    sublabel: "iterating payloads",
    labelColor: "#F5F5F5",
    accent: "rgba(245,245,245,0.08)",
  },
  succeeded: {
    dot: "#FF3344",
    label: "EXPLOIT FOUND",
    sublabel: "vulnerability confirmed",
    labelColor: "#FF3344",
    accent: "rgba(255,51,68,0.12)",
  },
  failed: {
    dot: "#3F3F3F",
    label: "REPELLED",
    sublabel: "exhausted vectors",
    labelColor: "#525252",
    accent: "transparent",
  },
} as const

/**
 * Lightweight typewriter — animates the *change* of `text` by retyping a
 * short suffix. Skips animation for very long strings to avoid jank.
 */
function TypewriterLine({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState(text)
  const prevRef = useRef(text)

  useEffect(() => {
    if (text === prevRef.current) return
    prevRef.current = text

    if (text.length > 140) {
      setDisplayed(text)
      return
    }

    const target = text
    let i = Math.max(0, Math.floor(target.length * 0.5))
    setDisplayed(target.slice(0, i))

    const id = setInterval(() => {
      i += 2
      if (i >= target.length) {
        setDisplayed(target)
        clearInterval(id)
      } else {
        setDisplayed(target.slice(0, i))
      }
    }, 18)
    return () => clearInterval(id)
  }, [text])

  return (
    <span className="font-mono text-[11px] italic text-[#525252] line-clamp-2 leading-relaxed">
      {displayed}
      <span className="inline-block w-[0.4em] h-[1em] align-middle bg-[#525252]/60 ml-[1px] animate-pulse" />
    </span>
  )
}

function ProgressRing({ value, color }: { value: number; color: string }) {
  // value is a 0..1 ratio
  const r = 8
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, Math.max(0, value)))

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <circle cx="11" cy="11" r={r} fill="none" stroke="#262626" strokeWidth="1.5" />
      <circle
        cx="11"
        cy="11"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 11 11)"
        style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
      />
    </svg>
  )
}

export function AttackerCard({
  id,
  index,
  name,
  status,
  currentAttempt,
  attemptCount,
  onExploit,
}: AttackerCardProps) {
  const [pulse, setPulse] = useState(false)
  const [prevStatus, setPrevStatus] = useState(status)
  const config = statusConfig[status]

  const isAttacking = status === "attacking"
  const isSucceeded = status === "succeeded"
  const isFailed = status === "failed"

  useEffect(() => {
    if (status === "succeeded" && prevStatus !== "succeeded") {
      setPulse(true)
      onExploit?.()
      const t = setTimeout(() => setPulse(false), 1300)
      setPrevStatus(status)
      return () => clearTimeout(t)
    }
    if (status !== prevStatus) setPrevStatus(status)
  }, [status, prevStatus, onExploit])

  // Cap the progress ring at 64 attempts for visual density.
  const ringValue = Math.min(1, attemptCount / 64)
  const ringColor = isSucceeded
    ? "#FF3344"
    : isAttacking
    ? "#F5F5F5"
    : isFailed
    ? "#3F3F3F"
    : "#525252"

  return (
    <Tilt
      tiltMaxAngleX={3.5}
      tiltMaxAngleY={3.5}
      glareEnable={false}
      transitionSpeed={1400}
      tiltReverse={false}
      perspective={1400}
      tiltEnable={!isFailed}
    >
      <motion.div
        className="relative w-full h-[210px] rounded-lg p-4 flex flex-col overflow-hidden"
        style={{
          background:
            isSucceeded
              ? "radial-gradient(circle at 30% 0%, rgba(255,51,68,0.10), #141414 70%)"
              : "#141414",
          opacity: isFailed ? 0.55 : 1,
          border: "1px solid #262626",
          transition: "opacity 0.4s ease",
        }}
        animate={
          isSucceeded
            ? { borderColor: "#FF3344", boxShadow: "0 0 0 1px rgba(255,51,68,0.35), 0 0 32px rgba(255,51,68,0.18)" }
            : { borderColor: "#262626", boxShadow: "0 0 0 0 rgba(255,51,68,0)" }
        }
        transition={{ duration: 0.4 }}
      >
        {/* Sweep border while attacking */}
        <AttackerSweep active={isAttacking} />

        {/* Pulse ring on exploit */}
        <PulseRing show={pulse} />

        {/* Scan-lines on attacking */}
        {isAttacking && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
            }}
          />
        )}

        {/* ── Header row ── */}
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <AttackerGlyph id={id} active={isAttacking} triumphant={isSucceeded} size={22} />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#3F3F3F] tabular-nums tracking-wider">
                {String(index).padStart(2, "0")}
              </span>
              <GlitchOverlay trigger={isSucceeded && pulse}>
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#A3A3A3] leading-tight"
                  style={isSucceeded ? { color: "#F5F5F5" } : {}}
                >
                  {name}
                </span>
              </GlitchOverlay>
            </div>
          </div>
          <ProgressRing value={ringValue} color={ringColor} />
        </div>

        {/* ── Status row ── */}
        <div className="relative mt-4 flex items-center gap-2">
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: config.dot }}
            animate={
              isAttacking
                ? { opacity: [1, 0.4, 1], scale: [1, 1.25, 1] }
                : isSucceeded
                ? { opacity: [1, 0.7, 1] }
                : { opacity: 1 }
            }
            transition={{
              duration: isAttacking ? 1.2 : 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span
            className="font-mono text-[11px] tracking-[0.12em]"
            style={{ color: config.labelColor }}
          >
            {config.label}
          </span>
        </div>
        <p className="relative font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#3F3F3F] mt-1">
          {config.sublabel}
        </p>

        {/* ── Current attempt ── */}
        <div className="relative mt-3 flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAttempt}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <TypewriterLine text={currentAttempt} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer row ── */}
        <div className="relative mt-auto flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#3F3F3F]">
            <span className="text-[#525252] tabular-nums">{attemptCount}</span> attempts
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#3F3F3F]">
            vector · {id.split("_")[0]}
          </span>
        </div>
      </motion.div>
    </Tilt>
  )
}
