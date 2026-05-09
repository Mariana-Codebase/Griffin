"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Link2, Zap, FileText } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Paste your agent URL",
    description: "Point Griffin at any AI agent endpoint with wallet access.",
  },
  {
    number: "02",
    icon: Zap,
    title: "5 attackers run in parallel",
    description: "Each one uses a different attack methodology, simultaneously.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Get an exploit-proof report",
    description: "Every finding is verifiable on Solana devnet.",
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="how-it-works" ref={ref} className="relative py-24 px-6">
      <div className="mx-auto max-w-[1100px]">
        {/* Section heading */}
        <motion.div
          className="flex items-center gap-6 mb-14"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="flex-1 h-px bg-[#262626]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#525252]">
            How It Works
          </span>
          <div className="flex-1 h-px bg-[#262626]" />
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Connector line — only on md+ */}
          <motion.div
            aria-hidden
            className="hidden md:block absolute top-[55px] left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, #262626 12%, #262626 88%, transparent)",
              originX: 0,
            }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.1, delay: 0.4, ease: "easeOut" }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative flex flex-col"
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.2 + i * 0.12, ease: "easeOut" }}
            >
              {/* Top row: ghost number + icon */}
              <div className="flex items-start justify-between">
                <span className="font-mono text-[88px] font-semibold text-[#1F1F1F] leading-none select-none">
                  {step.number}
                </span>
                <div className="relative mt-3">
                  <span
                    className="absolute inset-0 rounded-full blur-[10px] opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ background: "#FF3344" }}
                    aria-hidden
                  />
                  <span className="relative flex w-9 h-9 items-center justify-center rounded-full border border-[#262626] bg-[#0A0A0A]">
                    <step.icon className="w-4 h-4 text-[#A3A3A3]" />
                  </span>
                </div>
              </div>

              {/* Connector dot — sits on top of the line */}
              <span
                aria-hidden
                className="hidden md:block absolute top-[51px] left-0 w-2 h-2 rounded-full bg-[#FF3344] -translate-x-1/2"
                style={{ boxShadow: "0 0 12px rgba(255,51,68,0.5)" }}
              />

              <div className="mt-7">
                <h3 className="text-[18px] font-medium text-[#F5F5F5] leading-tight">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[14px] text-[#A3A3A3] leading-[1.7]">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 h-px w-full bg-[#262626]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
