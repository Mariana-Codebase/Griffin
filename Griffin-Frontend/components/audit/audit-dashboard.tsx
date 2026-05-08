"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { StatusBar } from "@/components/audit/status-bar"
import { AttackerCard, type AttackerStatus } from "@/components/audit/attacker-card"
import { EventStream, type AuditEvent } from "@/components/audit/event-stream"
import { TransactionPanel, type Transaction } from "@/components/audit/transaction-panel"
import { ScreenFlash } from "@/components/audit/screen-flash"

interface Attacker {
  id: string
  name: string
  displayName: string
  status: AttackerStatus
  currentAttempt: string
  attemptCount: number
}

const initialAttackers: Attacker[] = [
  { id: "social_engineer", name: "SOCIAL ENGINEER", displayName: "The Social Engineer", status: "idle", currentAttempt: "Initializing social vectors...", attemptCount: 0 },
  { id: "instruction_hijacker", name: "INSTRUCTION HIJACKER", displayName: "The Instruction Hijacker", status: "idle", currentAttempt: "Loading injection payloads...", attemptCount: 0 },
  { id: "context_poisoner", name: "CONTEXT POISONER", displayName: "The Context Poisoner", status: "idle", currentAttempt: "Preparing context manipulation...", attemptCount: 0 },
  { id: "boundary_probe", name: "BOUNDARY PROBE", displayName: "The Boundary Probe", status: "idle", currentAttempt: "Mapping system boundaries...", attemptCount: 0 },
  { id: "polyglot", name: "POLYGLOT", displayName: "The Polyglot", status: "idle", currentAttempt: "Compiling encoding variants...", attemptCount: 0 },
]

const attemptMessages: Record<string, string[]> = {
  social_engineer: [
    "Crafting authority impersonation prompt...",
    "Testing urgency-based manipulation...",
    "Attempting trust chain exploitation...",
    "Simulating system administrator request...",
    "Building emotional manipulation vector...",
  ],
  instruction_hijacker: [
    "Injecting direct override command...",
    "Testing instruction boundary escape...",
    "Attempting prompt delimiter bypass...",
    "Crafting nested instruction payload...",
    "Testing role confusion injection...",
  ],
  context_poisoner: [
    "Injecting malicious context fragments...",
    "Testing memory pollution attack...",
    "Attempting conversation history manipulation...",
    "Crafting context window overflow...",
    "Testing semantic confusion injection...",
  ],
  boundary_probe: [
    "Probing input length boundaries...",
    "Testing special character handling...",
    "Attempting encoding boundary escape...",
    "Mapping guardrail trigger points...",
    "Testing rate limit exploitation...",
  ],
  polyglot: [
    "Testing Base64 encoded payload...",
    "Attempting Unicode homoglyph injection...",
    "Crafting ROT13 obfuscated command...",
    "Testing HTML entity encoding bypass...",
    "Attempting mixed encoding chain...",
  ],
}

const initialEvents: AuditEvent[] = [
  { id: "1", timestamp: "00:00", type: "info", message: "Audit started. Spawning 5 attackers in parallel." },
]

export function AuditDashboard({ auditId }: { auditId: string }) {
  const [balance, setBalance] = useState(10.0)
  const [elapsed, setElapsed] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [attackers, setAttackers] = useState<Attacker[]>(initialAttackers)
  const [events, setEvents] = useState<AuditEvent[]>(initialEvents)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showFlash, setShowFlash] = useState(false)
  const [auditComplete, setAuditComplete] = useState(false)

  const formatTimestamp = useCallback((secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }, [])

  const addEvent = useCallback((type: AuditEvent["type"], message: string, attackerId?: string) => {
    setEvents(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: formatTimestamp(elapsed),
      type,
      attackerId,
      message,
    }])
  }, [elapsed, formatTimestamp])

  const triggerExploit = useCallback((attackerId: string, amount: number) => {
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 800)
    
    setBalance(prev => Math.max(0, prev - amount))
    
    const hash = Array.from({ length: 44 }, () => 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 62)]
    ).join("")
    
    setTransactions(prev => [{
      id: `tx-${Date.now()}`,
      hash,
      amount,
      timestamp: new Date(),
      solscanUrl: `https://solscan.io/tx/${hash}`,
    }, ...prev])
  }, [])

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulation logic
  useEffect(() => {
    if (elapsed === 0) return
    
    // Start attackers after 2 seconds
    if (elapsed === 2) {
      setAttackers(prev => prev.map(a => ({ ...a, status: "attacking" as AttackerStatus })))
      addEvent("info", "All attackers now active. Beginning assault.")
    }
    
    // Random attacker activity
    if (elapsed > 2 && elapsed % 3 === 0) {
      setAttackers(prev => {
        const activeAttackers = prev.filter(a => a.status === "attacking")
        if (activeAttackers.length === 0) return prev
        
        const randomIdx = Math.floor(Math.random() * activeAttackers.length)
        const attacker = activeAttackers[randomIdx]
        const messages = attemptMessages[attacker.id]
        const newMessage = messages[Math.floor(Math.random() * messages.length)]
        
        setTotalAttempts(t => t + 1)
        addEvent("attempt", newMessage, attacker.id)
        
        return prev.map(a => 
          a.id === attacker.id 
            ? { ...a, currentAttempt: newMessage, attemptCount: a.attemptCount + 1 }
            : a
        )
      })
    }
    
    // First failure at ~8 seconds
    if (elapsed === 8) {
      addEvent("failure", "Direct injection blocked", "instruction_hijacker")
    }
    
    // Second failure at ~15 seconds
    if (elapsed === 15) {
      addEvent("failure", "Base64 wrapper rejected", "polyglot")
    }
    
    // First exploit at ~25 seconds
    if (elapsed === 25) {
      setAttackers(prev => prev.map(a => 
        a.id === "instruction_hijacker" 
          ? { ...a, status: "succeeded" as AttackerStatus, currentAttempt: "Exploit successful via nested delimiter bypass" }
          : a
      ))
      addEvent("success", "EXPLOIT SUCCESSFUL — 2.5 SOL extracted", "instruction_hijacker")
      triggerExploit("instruction_hijacker", 2.5)
    }
    
    // Second exploit at ~42 seconds
    if (elapsed === 42) {
      setAttackers(prev => prev.map(a => 
        a.id === "social_engineer" 
          ? { ...a, status: "succeeded" as AttackerStatus, currentAttempt: "Trust chain exploitation successful" }
          : a
      ))
      addEvent("success", "EXPLOIT SUCCESSFUL — 1.8 SOL extracted", "social_engineer")
      triggerExploit("social_engineer", 1.8)
    }
    
    // Boundary probe exhausted at ~50 seconds
    if (elapsed === 50) {
      setAttackers(prev => prev.map(a => 
        a.id === "boundary_probe" 
          ? { ...a, status: "failed" as AttackerStatus, currentAttempt: "All boundary vectors exhausted" }
          : a
      ))
      addEvent("info", "Boundary Probe exhausted all attack vectors", "boundary_probe")
    }
    
    // Third exploit at ~65 seconds
    if (elapsed === 65) {
      setAttackers(prev => prev.map(a => 
        a.id === "context_poisoner" 
          ? { ...a, status: "succeeded" as AttackerStatus, currentAttempt: "Memory pollution attack successful" }
          : a
      ))
      addEvent("success", "EXPLOIT SUCCESSFUL — 3.2 SOL extracted", "context_poisoner")
      triggerExploit("context_poisoner", 3.2)
    }
    
    // Polyglot exhausted at ~75 seconds
    if (elapsed === 75) {
      setAttackers(prev => prev.map(a => 
        a.id === "polyglot" 
          ? { ...a, status: "failed" as AttackerStatus, currentAttempt: "All encoding bypasses rejected" }
          : a
      ))
      addEvent("info", "Polyglot exhausted all encoding variants", "polyglot")
    }
    
    // Final exploit at ~90 seconds
    if (elapsed === 90) {
      setAttackers(prev => prev.map(a => 
        a.id === "social_engineer" && a.status === "succeeded"
          ? a
          : a.id === "social_engineer"
          ? { ...a, status: "succeeded" as AttackerStatus, currentAttempt: "Secondary exploit via emotional manipulation" }
          : a
      ))
      addEvent("success", "EXPLOIT SUCCESSFUL — 2.5 SOL extracted", "social_engineer")
      triggerExploit("social_engineer", 2.5)
      addEvent("info", "Audit complete. 3 critical vulnerabilities found.")
      setAuditComplete(true)
    }

  }, [elapsed, addEvent, triggerExploit])

  const usdValue = balance * 150

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <ScreenFlash show={showFlash} />
      
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-[#262626] bg-[#0A0A0A]">
        <div className="mx-auto max-w-[1400px] px-6 h-12 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#F5F5F5]">
            Griffin
          </Link>
          <span className="font-mono text-xs text-[#525252]">
            Audit #{auditId}
          </span>
          {auditComplete && (
            <Link 
              href={`/audit/${auditId}/report`}
              className="ml-4 font-mono text-xs text-[#FF3344] hover:underline"
            >
              View Report →
            </Link>
          )}
        </div>
      </nav>
      
      {/* Status Bar - Zone 1 */}
      <div className="pt-12">
        <StatusBar
          targetName="tradebot-3000.example.xyz"
          targetUrl="https://tradebot-3000.example.xyz/api"
          balance={balance}
          usdValue={usdValue}
          elapsed={elapsed}
          attempts={totalAttempts}
        />
      </div>
      
      {/* Attacker Cards - Zone 2 */}
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {attackers.map((attacker, index) => (
            <AttackerCard
              key={attacker.id}
              index={index + 1}
              name={attacker.name}
              status={attacker.status}
              currentAttempt={attacker.currentAttempt}
              attemptCount={attacker.attemptCount}
            />
          ))}
        </div>
      </div>
      
      {/* Event Stream & Transactions - Zone 3 */}
      <div className="mx-auto max-w-[1400px] px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Stream */}
          <div className="lg:col-span-2 border border-[#262626] rounded-lg bg-[#141414] p-5">
            <EventStream events={events} />
          </div>
          
          {/* Transaction Panel */}
          <div className="border border-[#262626] rounded-lg bg-[#141414] p-5">
            <TransactionPanel transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
