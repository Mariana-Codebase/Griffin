"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export interface Transaction {
  id: string
  hash: string
  amount: number
  timestamp: Date
  solscanUrl: string
}

interface TransactionPanelProps {
  transactions: Transaction[]
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 4)}...${hash.slice(-4)}`
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
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button
      onClick={handleCopy}
      className="ml-2 font-mono text-[10px] text-[#525252] hover:text-[#A3A3A3] transition-colors"
    >
      {copied ? "copied" : "copy"}
    </button>
  )
}

export function TransactionPanel({ transactions }: TransactionPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-3">
        On-Chain Proof
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: "400px" }}>
        <AnimatePresence initial={false}>
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative border border-[#262626] rounded-lg bg-[#141414] p-4 overflow-hidden"
            >
              {/* Red glow for newest */}
              {index === 0 && (
                <motion.div
                  className="absolute inset-0 bg-[#FF3344] rounded-lg"
                  initial={{ opacity: 0.15 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                />
              )}
              
              <div className="relative">
                {/* Hash */}
                <div className="flex items-center">
                  <span className="font-mono text-sm text-[#A3A3A3]">
                    {truncateHash(tx.hash)}
                  </span>
                  <CopyButton text={tx.hash} />
                </div>
                
                {/* Amount */}
                <p className="mt-2 font-mono text-xl font-semibold text-[#FF3344]">
                  +{tx.amount.toFixed(1)} SOL
                </p>
                
                {/* Timestamp */}
                <p className="mt-1 font-mono text-xs text-[#525252]">
                  {getRelativeTime(tx.timestamp)}
                </p>
                
                {/* Solscan link */}
                <a
                  href={tx.solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-[#A78BFA] hover:text-[#C4B5FD] transition-colors"
                >
                  View on Solscan
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {transactions.length === 0 && (
          <p className="font-mono text-xs text-[#525252] italic">
            No transactions yet...
          </p>
        )}
      </div>
    </div>
  )
}
