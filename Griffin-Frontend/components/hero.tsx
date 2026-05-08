"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { WireframeIcosahedron } from "./wireframe-icosahedron"
import { startAudit } from "@/lib/api"

export function Hero() {
  const [url, setUrl] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError("")
    try {
      const auditId = await startAudit(url.trim())
      router.push(`/audit/${auditId}`)
    } catch {
      setError("Failed to connect to backend. Is it running on port 8000?")
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 pt-14 overflow-hidden">
      {/* Subtle 3D wireframe background */}
      <WireframeIcosahedron />
      
      <div className="relative max-w-[800px] flex flex-col items-center text-center">
        {/* Animated red line */}
        <motion.div
          className="h-px w-[120px] bg-[#FF3344] mb-6"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Tag line with extending lines */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-12 bg-[#262626]" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#525252]">
            Adversarial Security · Solana · Live
          </span>
          <div className="h-px w-12 bg-[#262626]" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-semibold tracking-[-0.02em] leading-[1.1] text-[#F5F5F5] text-balance">
          Red team your AI agents before they become someone else&apos;s{" "}
          <span className="text-[#FF3344]">exploit</span>.
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg text-[#A3A3A3] leading-[1.7] max-w-[600px] mx-auto text-balance">
          Five autonomous attackers probe your AI for adversarial vulnerabilities — 
          prompt injection, social engineering, context poisoning, and more. Every 
          exploit found is published on Solana as verifiable threat intelligence.
        </p>

        {/* Input row */}
        <form onSubmit={handleSubmit} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div 
            className={`relative w-full sm:w-[520px] lg:w-[620px] transition-shadow duration-200 ${
              isFocused ? "shadow-[0_0_0_3px_rgba(255,51,68,0.15)]" : ""
            }`}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#525252] text-sm pointer-events-none">
              $
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="https://your-agent.xyz/api"
              className={`w-full h-12 pl-8 pr-4 bg-[#141414] border rounded-lg text-[#F5F5F5] placeholder:text-[#A3A3A3] focus:outline-none transition-colors ${
                isFocused ? "border-[#FF3344]" : "border-[#262626]"
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group w-full sm:w-auto h-12 px-6 bg-[#1F1F1F] text-[#F5F5F5] font-mono text-sm rounded-lg transition-colors hover:bg-[#262626] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative">
              {loading ? "Starting…" : "Run Audit"}
              {!loading && <span className="absolute left-0 -bottom-0.5 w-full h-px bg-[#FF3344] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />}
            </span>
          </button>
        </form>

        {error && (
          <p className="mt-3 font-mono text-xs text-[#FF3344]">{error}</p>
        )}

        {/* Duration note */}
        <p className="mt-4 font-mono text-xs italic text-[#525252]">
          average audit duration: 3-5 minutes
        </p>
      </div>
    </section>
  )
}
