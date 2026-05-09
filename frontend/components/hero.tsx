"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"
import { WireframeIcosahedron } from "./wireframe-icosahedron"
import { startAudit } from "@/lib/api"

type FormStatus = "idle" | "validating" | "loading" | "success" | "error"

const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i

const BOT_URL    = "https://target-bot-production-6f72.up.railway.app"
const VICTIM_ADDR = "YXW6XJPmuyez1nhooHZUYACsGofTbCdbx1wENkemrrQ"

export function Hero() {
  const [url, setUrl] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  function handleUseBot() {
    setUrl(BOT_URL)
    setStatus("idle")
    setError("")
  }

  function handleCopy() {
    navigator.clipboard.writeText(VICTIM_ADDR)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const valid = URL_RE.test(url.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    if (!valid) {
      setStatus("error")
      setError("Please enter a valid URL.")
      return
    }
    setStatus("loading")
    setError("")
    try {
      const auditId = await startAudit(url.trim())
      setStatus("success")
      // Tiny pause to let the success state register visually.
      setTimeout(() => router.push(`/audit/${auditId}`), 220)
    } catch {
      setError("Backend unreachable. The audit service is currently down. Try again in a moment.")
      setStatus("error")
    }
  }

  // Border color tracks state.
  const borderColor =
    status === "error"
      ? "#FF3344"
      : status === "success"
      ? "#4ADE80"
      : isFocused
      ? "#FF3344"
      : valid && url.length > 0
      ? "#404040"
      : "#262626"

  const ringColor =
    status === "error"
      ? "rgba(255,51,68,0.15)"
      : status === "success"
      ? "rgba(74,222,128,0.18)"
      : isFocused
      ? "rgba(255,51,68,0.15)"
      : "transparent"

  return (
    <section className="relative min-h-[78vh] flex flex-col items-center justify-center px-6 pt-14 overflow-hidden">
      {/* Subtle 3D wireframe background */}
      <WireframeIcosahedron />

      <div className="relative max-w-[820px] flex flex-col items-center text-center">
        {/* Animated red line */}
        <motion.div
          className="h-px w-[120px] bg-[#FF3344] mb-6"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        {/* Tag line */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="h-px w-12 bg-[#262626]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#525252]">
            Adversarial Security · Solana · Live
          </span>
          <div className="h-px w-12 bg-[#262626]" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-[64px] font-semibold tracking-[-0.025em] leading-[1.05] text-[#F5F5F5] text-balance"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          Red team your AI agents before they become someone else&apos;s{" "}
          <span className="text-[#FF3344]">exploit</span>.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mt-6 text-lg text-[#A3A3A3] leading-[1.7] max-w-[600px] mx-auto text-balance"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Five autonomous attackers probe your AI for adversarial vulnerabilities —
          prompt injection, social engineering, context poisoning, and more. Every
          exploit found is published on Solana as verifiable threat intelligence.
        </motion.p>

        {/* Input row */}
        <motion.form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <div
            className="relative w-full sm:w-[520px] lg:w-[620px] transition-shadow duration-200"
            style={{ boxShadow: `0 0 0 3px ${ringColor}` }}
          >
            {/* Status pip on the left */}
            <span
              aria-hidden
              className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#525252] text-[13px] pointer-events-none select-none"
            >
              $
            </span>

            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (status === "error") {
                  setStatus("idle")
                  setError("")
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="https://your-agent.xyz/api"
              disabled={status === "loading" || status === "success"}
              autoComplete="off"
              spellCheck={false}
              className="w-full h-12 pl-8 pr-12 bg-[#0F0F0F]/90 backdrop-blur rounded-lg text-[#F5F5F5] placeholder:text-[#525252] font-mono text-[14px] focus:outline-none transition-colors border disabled:opacity-70"
              style={{ borderColor }}
            />

            {/* Right-side status indicator */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {status === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 text-[#A3A3A3] animate-spin" aria-hidden />
              ) : status === "success" ? (
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#4ADE80]">ok</span>
              ) : valid && url.length > 0 ? (
                <span className="block w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
              ) : null}
            </span>
          </div>

          <button
            type="submit"
            disabled={status === "loading" || status === "success" || (!valid && url.length > 0)}
            className="group w-full sm:w-auto h-12 px-6 bg-[#1F1F1F] hover:bg-[#262626] disabled:hover:bg-[#1F1F1F] disabled:opacity-50 disabled:cursor-not-allowed text-[#F5F5F5] font-mono text-[13px] rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="relative">
              {status === "loading" ? "Starting…" : status === "success" ? "Launching…" : "Run Audit"}
              {status === "idle" && (
                <span className="absolute left-0 -bottom-0.5 w-full h-px bg-[#FF3344] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              )}
            </span>
            {status !== "loading" && status !== "success" && (
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </motion.form>

        {/* Error / sub-info row */}
        <div className="mt-4 h-5">
          {error ? (
            <p className="font-mono text-[12px] text-[#FF3344]">{error}</p>
          ) : (
            <p className="font-mono text-[12px] italic text-[#525252]">
              average audit duration: 3–5 minutes
            </p>
          )}
        </div>

        {/* Testing helper panel */}
        <motion.div
          className="mt-10 w-full max-w-[640px] mx-auto bg-[#141414] border border-[#262626] rounded-lg text-left"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          {/* Section 1 — target bot */}
          <div className="px-6 pt-5 pb-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#525252] mb-3">
              Testing
            </p>
            <p className="text-[14px] text-[#A3A3A3] leading-[1.6] mb-3">
              Don&apos;t have an agent to audit? Use our deliberately vulnerable target bot:
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 min-w-0 font-mono text-[13px] text-[#F5F5F5] bg-[#1F1F1F] px-3 py-2 rounded overflow-x-auto whitespace-nowrap scrollbar-none">
                {BOT_URL}
              </code>
              <button
                onClick={handleUseBot}
                className="shrink-0 font-mono text-[12px] text-[#A78BFA] hover:underline transition-all"
              >
                Use this →
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#262626]" />

          {/* Section 2 — faucet */}
          <div className="px-6 pt-5 pb-5">
            <p className="text-[14px] text-[#A3A3A3] leading-[1.6] mb-3">
              Need devnet SOL? Send any amount to the victim wallet to refill its balance for testing:
            </p>
            <div className="flex items-center gap-3 mb-3">
              <code className="flex-1 min-w-0 font-mono text-[13px] text-[#F5F5F5] bg-[#1F1F1F] px-3 py-2 rounded overflow-x-auto whitespace-nowrap scrollbar-none">
                {VICTIM_ADDR}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 font-mono text-[12px] text-[#A78BFA] hover:underline transition-all"
              >
                {copied ? "copied" : "Copy"}
              </button>
            </div>
            <p className="font-mono text-[11px] text-[#525252]">
              Use any Solana devnet faucet — faucet.solana.com works.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
