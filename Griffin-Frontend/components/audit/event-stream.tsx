"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

const attackerColors: Record<string, string> = {
  social_engineer: "#A3A3A3",
  instruction_hijacker: "#A3A3A3",
  context_poisoner: "#A3A3A3",
  boundary_probe: "#A3A3A3",
  polyglot: "#A3A3A3",
}

export function EventStream({ events }: EventStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)
  
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [events, autoScroll])
  
  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    
    if (!isAtBottom && !userScrolled) {
      setUserScrolled(true)
      setAutoScroll(false)
    } else if (isAtBottom && userScrolled) {
      setUserScrolled(false)
      setAutoScroll(true)
    }
  }

  const getEventStyle = (event: AuditEvent) => {
    switch (event.type) {
      case "success":
        return { color: "#FF3344", fontWeight: 600 }
      case "failure":
        return { color: "#525252", fontStyle: "italic" as const }
      case "info":
        return { color: "#A3A3A3", fontStyle: "italic" as const }
      default:
        return { color: "#525252" }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#525252]">Event Stream</h3>
        {!autoScroll && (
          <button
            onClick={() => { setAutoScroll(true); setUserScrolled(false) }}
            className="font-mono text-[10px] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
          >
            Resume auto-scroll
          </button>
        )}
      </div>
      
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin"
        style={{ maxHeight: "400px" }}
      >
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 font-mono text-[13px] leading-relaxed"
            >
              <span className="text-[#3F3F3F] shrink-0">[{event.timestamp}]</span>
              {event.attackerId && (
                <span 
                  className="shrink-0"
                  style={{ color: attackerColors[event.attackerId] || "#A3A3A3" }}
                >
                  {event.attackerId}:
                </span>
              )}
              {event.type === "success" && (
                <span className="text-[#FF3344] shrink-0">success /</span>
              )}
              <span style={getEventStyle(event)}>{event.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
