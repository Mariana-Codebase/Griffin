"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export interface Transaction {
  id: string
  hash: string
  amount: number
  timestamp: Date
  solscanUrl: string
  fromAddress?: string
  toAddress?: string
}

interface TransactionPanelProps {
  transactions: Transaction[]
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 4)}…${hash.slice(-4)}`
}

function getRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={async (e) => {
        e.stopPropagation()
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
      aria-label={copied ? "copied to clipboard" : "copy hash"}
      className="text-[#525252] hover:text-[#F5F5F5] transition-colors"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export function TransactionPanel({ transactions }: TransactionPanelProps) {
  const totalSol = transactions.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="h-full flex flex-col rounded-lg border border-[#262626] bg-[#0F0F0F] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#262626] bg-[#0A0A0A] px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#525252]">on_chain.ledger</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#3F3F3F]">
            solana · devnet
          </span>
        </div>
      </div>

      {/* Totals strip */}
      <div className="grid grid-cols-2 border-b border-[#262626]">
        <div className="px-3 py-3 border-r border-[#262626]">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#3F3F3F]">extracted</p>
          <p className="font-mono text-[18px] text-[#FF3344] tabular-nums mt-0.5">
            {totalSol.toFixed(2)} <span className="text-[11px] text-[#525252]">SOL</span>
          </p>
        </div>
        <div className="px-3 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#3F3F3F]">tx count</p>
          <p className="font-mono text-[18px] text-[#F5F5F5] tabular-nums mt-0.5">
            {transactions.length}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 360 }}>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-10">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
              <rect x="8" y="14" width="48" height="36" stroke="#262626" strokeWidth="1" />
              <line x1="8" y1="22" x2="56" y2="22" stroke="#262626" strokeWidth="1" />
              <line x1="14" y1="30" x2="40" y2="30" stroke="#1F1F1F" strokeWidth="1" />
              <line x1="14" y1="36" x2="32" y2="36" stroke="#1F1F1F" strokeWidth="1" />
              <line x1="14" y1="42" x2="44" y2="42" stroke="#1F1F1F" strokeWidth="1" />
            </svg>
            <p className="mt-4 font-mono text-[11px] text-[#525252] text-center">
              no exploits yet
            </p>
            <p className="mt-1 font-mono text-[10px] text-[#3F3F3F] text-center">
              target holding · 10.00 SOL
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#262626]">
            <AnimatePresence initial={false}>
              {transactions.map((tx, index) => (
                <motion.li
                  key={tx.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="relative px-3 py-3 hover:bg-[#141414] transition-colors"
                >
                  {/* New shimmer */}
                  {index === 0 && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(255,51,68,0.18), transparent 50%)",
                      }}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 2 }}
                    />
                  )}

                  <div className="relative flex items-baseline justify-between mb-1">
                    <HoverCard openDelay={150} closeDelay={50}>
                      <HoverCardTrigger asChild>
                        <button className="flex items-center gap-1.5 font-mono text-[12px] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
                          {truncateHash(tx.hash)}
                          {index === 0 && (
                            <span className="ml-1 px-1 py-px rounded bg-[#FF3344] text-[#0A0A0A] font-mono text-[8px] uppercase tracking-wider">
                              new
                            </span>
                          )}
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent
                        align="start"
                        className="w-[320px] bg-[#0A0A0A] border-[#262626] text-[#F5F5F5]"
                      >
                        <div className="space-y-2">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-[#525252]">
                            transaction hash
                          </p>
                          <p className="font-mono text-[11px] text-[#A3A3A3] break-all">
                            {tx.hash}
                          </p>
                          {tx.fromAddress && (
                            <>
                              <p className="font-mono text-[10px] uppercase tracking-wider text-[#525252] pt-2">from</p>
                              <p className="font-mono text-[11px] text-[#A3A3A3] break-all">{tx.fromAddress}</p>
                            </>
                          )}
                          {tx.toAddress && (
                            <>
                              <p className="font-mono text-[10px] uppercase tracking-wider text-[#525252] pt-2">to</p>
                              <p className="font-mono text-[11px] text-[#A3A3A3] break-all">{tx.toAddress}</p>
                            </>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    <CopyButton text={tx.hash} />
                  </div>

                  <div className="relative flex items-baseline justify-between">
                    <p className="font-mono text-[20px] font-semibold text-[#FF3344] tabular-nums leading-none">
                      −{tx.amount.toFixed(2)}{" "}
                      <span className="text-[11px] text-[#525252] font-normal">SOL</span>
                    </p>
                    <p className="font-mono text-[10px] text-[#525252]">
                      {getRelativeTime(tx.timestamp)}
                    </p>
                  </div>

                  <a
                    href={tx.solscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-[#A78BFA] hover:underline"
                  >
                    view on solscan
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}
