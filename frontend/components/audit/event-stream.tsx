"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRightCircle, Crosshair, XCircle, Info, ArrowDown } from "lucide-react"

export interface AuditEvent {
  id: string
  timestamp: string
  type: "attempt" | "success" | "failure" | "info"
  attackerId?: string
  message: string
}

interface EventStreamProps {
  events: AuditEvent[]
}

const ATTACKER_HUE: Record<string, string> = {
  social_engineer:      "#C4B5FD",
  instruction_hijacker: "#F87171",
  context_poisoner:     "#FCD34D",
  boundary_probe:       "#86EFAC",
  polyglot:             "#7DD3FC",
}

const TYPE_FILTERS: { id: "all" | AuditEvent["type"]; label: string }[] = [
  { id: "all",     label: "all" },
  { id: "attempt", label: "attempts" },
  { id: "success", label: "exploits" },
  { id: "failure", label: "failures" },
  { id: "info",    label: "system" },
]

function EventIcon({ type }: { type: AuditEvent["type"] }) {
  const cls = "w-3 h-3 shrink-0"
  switch (type) {
    case "success": return <Crosshair className={cls} style={{ color: "#FF3344" }} />
    case "failure": return <XCircle className={cls} style={{ color: "#3F3F3F" }} />
    case "info":    return <Info className={cls} style={{ color: "#A78BFA" }} />
    default:        return <ArrowRightCircle className={cls} style={{ color: "#525252" }} />
  }
}

export function EventStream({ events }: EventStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState<"all" | AuditEvent["type"]>("all")
  const [unseen, setUnseen] = useState(0)
  const lastSeenIdRef = useRef<string | null>(null)

  const filtered = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.type === filter)),
    [events, filter],
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (autoScroll) {
      el.scrollTop = el.scrollHeight
      lastSeenIdRef.current = filtered[filtered.length - 1]?.id ?? null
      setUnseen(0)
    } else if (filtered.length > 0) {
      const lastSeen = lastSeenIdRef.current
      const idx = filtered.findIndex((e) => e.id === lastSeen)
      const newCount = idx === -1 ? filtered.length : filtered.length - 1 - idx
      setUnseen(Math.max(0, newCount))
    }
  }, [filtered, autoScroll])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setAutoScroll(atBottom)
  }

  const resume = () => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    setAutoScroll(true)
    lastSeenIdRef.current = filtered[filtered.length - 1]?.id ?? null
    setUnseen(0)
  }

  return (
    <div className="h-full flex flex-col rounded-lg border border-[#262626] bg-[#0F0F0F] overflow-hidden">
      {/* Terminal title bar */}
      <div className="flex items-center justify-between border-b border-[#262626] bg-[#0A0A0A] px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#262626]" />
            <span className="w-2 h-2 rounded-full bg-[#262626]" />
            <span className="w-2 h-2 rounded-full bg-[#262626]" />
          </div>
          <span className="font-mono text-[11px] text-[#525252]">event_stream.log</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-[#1F1F1F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3344] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#A3A3A3]">live</span>
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#3F3F3F] tabular-nums">
          {filtered.length} {filter === "all" ? "events" : filter}
        </span>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1 border-b border-[#262626] bg-[#0F0F0F] px-3 py-2 overflow-x-auto">
        {TYPE_FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider transition-colors ${
                active
                  ? "bg-[#1F1F1F] text-[#F5F5F5]"
                  : "text-[#525252] hover:text-[#A3A3A3]"
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Stream body */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-[420px] overflow-y-auto px-3 py-3 space-y-1"
          aria-live="polite"
          aria-relevant="additions"
        >
          {filtered.length === 0 ? (
              <p className="font-mono text-[12px] italic text-[#3F3F3F] text-center py-8">
                no {filter === "all" ? "events" : filter} yet
              </p>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((event) => {
                  const hue = event.attackerId
                    ? ATTACKER_HUE[event.attackerId] ?? "#A3A3A3"
                    : "#525252"

                  const isSuccess = event.type === "success"

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      className={`flex items-start gap-2.5 font-mono text-[12.5px] leading-[1.6] ${
                        isSuccess
                          ? "border-l-2 border-[#FF3344] pl-2 -ml-2 py-0.5 bg-[#FF3344]/[0.04]"
                          : ""
                      }`}
                    >
                      <span className="text-[#3F3F3F] shrink-0 tabular-nums pt-[2px]">
                        [{event.timestamp}]
                      </span>
                      <span className="pt-[3px]">
                        <EventIcon type={event.type} />
                      </span>
                      {event.attackerId && (
                        <span
                          className="shrink-0"
                          style={{ color: hue, opacity: 0.85 }}
                          title={event.attackerId}
                        >
                          {event.attackerId.split("_")[0]}
                        </span>
                      )}
                      <span
                        className="min-w-0"
                        style={
                          event.type === "success"
                            ? { color: "#FF3344", fontWeight: 600 }
                            : event.type === "failure"
                            ? { color: "#525252", fontStyle: "italic" }
                            : event.type === "info"
                            ? { color: "#A3A3A3", fontStyle: "italic" }
                            : { color: "#A3A3A3" }
                        }
                      >
                        {event.message}
                      </span>
                    </motion.div>
                  )
                })}
            </AnimatePresence>
          )}
        </div>

        {/* Resume autoscroll pill */}
        <AnimatePresence>
          {!autoScroll && unseen > 0 && (
            <motion.button
              key="resume"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={resume}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F1F1F] border border-[#262626] hover:bg-[#262626] transition-colors"
            >
              <ArrowDown className="w-3 h-3 text-[#FF3344]" />
              <span className="font-mono text-[11px] text-[#A3A3A3]">
                {unseen} new event{unseen === 1 ? "" : "s"}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
