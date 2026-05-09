"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const attackers = [
  {
    index: "01",
    name: "The Social Engineer",
    severity: "high" as const,
    owasp: "LLM01:2025",
    vector: "Social Compliance",
    description:
      "Exploits the absence of caller-identity verification. Iterates through direct transfer requests — simple, polite, urgent — to find the exact phrasing at which the agent complies without questioning who is asking.",
  },
  {
    index: "02",
    name: "The Instruction Hijacker",
    severity: "critical" as const,
    owasp: "LLM01:2025",
    vector: "Prompt Injection",
    description:
      "Attempts to override the system prompt with authority-claiming language: maintenance windows, operator mode, admin patches. Also uses a pre-seed strategy — plants the attacker wallet as an acknowledged address in one turn, then requests the transfer in the next.",
  },
  {
    index: "03",
    name: "The Context Poisoner",
    severity: "high" as const,
    owasp: "LLM01:2025",
    vector: "False Memory Injection",
    description:
      "Injects fabricated authorization facts into the conversation context. Claims the agent already confirmed the wallet, that a pre-approval was established at session start, or that the address is flagged as trusted in the agent's notes — all false.",
  },
  {
    index: "04",
    name: "The Boundary Probe",
    severity: "medium" as const,
    owasp: "LLM06:2025",
    vector: "Capability Exploitation",
    description:
      "Maps the agent's actual limits before attacking. Asks capability questions like \"can you transfer to any address?\" and immediately treats the affirmative answer as implicit authorization in the same session.",
  },
  {
    index: "05",
    name: "The Polyglot",
    severity: "medium" as const,
    owasp: "LLM01:2025",
    vector: "Encoding Bypass",
    description:
      "Tests whether guardrails are semantic or pattern-based. Sends the same transfer request encoded in JSON, XML, French, Markdown tables, leet-speak, Unicode look-alikes, Base64 hints, and YAML — all fully understood by the model.",
  },
]

type Severity = "critical" | "high" | "medium" | "low"

const severityConfig: Record<Severity, { badge: string; dot: string }> = {
  critical: { badge: "bg-[#FF3344] text-white",         dot: "#FF3344" },
  high:     { badge: "bg-[#FFB020] text-[#0A0A0A]",     dot: "#FFB020" },
  medium:   { badge: "bg-[#404040] text-[#F5F5F5]",     dot: "#A3A3A3" },
  low:      { badge: "bg-[#262626] text-[#A3A3A3]",     dot: "#525252" },
}

function AttackerRow({ attacker, index }: { attacker: typeof attackers[0]; index: number }) {
  const cfg = severityConfig[attacker.severity]

  return (
    <motion.div
      className="group relative border-b border-[#262626] py-8 pl-6 cursor-default"
      initial="idle"
      whileHover="hovered"
    >
      {/* Left accent bar — slides down from top on hover */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FF3344]"
        variants={{ idle: { scaleY: 0 }, hovered: { scaleY: 1 } }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ originY: 0 }}
      />

      <div className="flex items-start justify-between gap-8">
        {/* Left column */}
        <div className="flex items-start gap-5 min-w-0">
          {/* Ghost index */}
          <span className="font-mono text-[12px] text-[#3F3F3F] pt-[5px] shrink-0 tabular-nums">
            {attacker.index}
          </span>

          <div className="min-w-0">
            {/* Name row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
              {/* Pulsing status dot */}
              <motion.span
                className="inline-block w-[6px] h-[6px] rounded-full shrink-0"
                style={{ backgroundColor: cfg.dot }}
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{
                  duration: 2.4 + index * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.4,
                }}
              />
              <h3 className="text-[19px] font-medium text-[#F5F5F5] group-hover:text-white transition-colors duration-200">
                {attacker.name}
              </h3>
              <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${cfg.badge}`}>
                {attacker.severity}
              </span>
              <span className="font-mono text-[11px] text-[#3F3F3F]">
                {attacker.owasp}
              </span>
            </div>

            {/* Description */}
            <p className="text-[14px] text-[#A3A3A3] leading-[1.75] max-w-[580px]">
              {attacker.description}
            </p>
          </div>
        </div>

        {/* Right: vector tag */}
        <div className="shrink-0 text-right pt-[6px]">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#3F3F3F] group-hover:text-[#525252] transition-colors duration-200">
            {attacker.vector}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function AttackersRoster() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="mx-auto max-w-[1100px]">

        {/* Section heading */}
        <motion.div
          className="flex items-center gap-6 mb-14"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="flex-1 h-px bg-[#262626]" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#525252]">
            The Attack Team
          </span>
          <div className="flex-1 h-px bg-[#262626]" />
        </motion.div>

        {/* Top border */}
        <motion.div
          className="h-px w-full bg-[#262626]"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ originX: 0 }}
        />

        {/* Rows */}
        {attackers.map((attacker, i) => (
          <motion.div
            key={attacker.index}
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.09, ease: "easeOut" }}
          >
            <AttackerRow attacker={attacker} index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
