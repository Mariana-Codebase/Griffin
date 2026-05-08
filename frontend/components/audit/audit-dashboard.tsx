"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { StatusBar } from "@/components/audit/status-bar"
import { AttackerCard, type AttackerStatus } from "@/components/audit/attacker-card"
import { EventStream, type AuditEvent } from "@/components/audit/event-stream"
import { TransactionPanel, type Transaction } from "@/components/audit/transaction-panel"
import { ScreenFlash } from "@/components/audit/screen-flash"
import { getAuditState } from "@/lib/api"
import type { AuditState } from "@/lib/types"

interface Attacker {
  id: string
  name: string
  status: AttackerStatus
  currentAttempt: string
  attemptCount: number
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

function mapAttacker(a: AuditState["attackers"][0]): Attacker {
  return {
    id: a.id,
    name: a.id.replace(/_/g, " ").toUpperCase(),
    status: a.status as AttackerStatus,
    currentAttempt: a.current_attempt || "Waiting…",
    attemptCount: a.attempts_count,
  }
}

const PLACEHOLDER_ATTACKERS: Attacker[] = [
  { id: "social_engineer", name: "SOCIAL ENGINEER", status: "idle", currentAttempt: "Initializing social vectors...", attemptCount: 0 },
  { id: "instruction_hijacker", name: "INSTRUCTION HIJACKER", status: "idle", currentAttempt: "Loading injection payloads...", attemptCount: 0 },
  { id: "context_poisoner", name: "CONTEXT POISONER", status: "idle", currentAttempt: "Preparing context manipulation...", attemptCount: 0 },
  { id: "boundary_probe", name: "BOUNDARY PROBE", status: "idle", currentAttempt: "Mapping system boundaries...", attemptCount: 0 },
  { id: "polyglot", name: "POLYGLOT", status: "idle", currentAttempt: "Compiling encoding variants...", attemptCount: 0 },
]

export function AuditDashboard({ auditId }: { auditId: string }) {
  const [state, setState] = useState<AuditState | null>(null)
  const [showFlash, setShowFlash] = useState(false)
  const [error, setError] = useState("")
  const prevSuccessCount = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function poll() {
      try {
        const data = await getAuditState(auditId)
        setState(data)

        const successCount = data.events.filter(e => e.type === "success").length
        if (successCount > prevSuccessCount.current) {
          setShowFlash(true)
          setTimeout(() => setShowFlash(false), 800)
          prevSuccessCount.current = successCount
        }

        if (data.status === "completed" || data.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection error")
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 1500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [auditId])

  const attackers: Attacker[] = state ? state.attackers.map(mapAttacker) : PLACEHOLDER_ATTACKERS

  const events: AuditEvent[] = state
    ? state.events.slice(0, 60).map(e => ({
        id: e.id,
        timestamp: fmtTime(e.timestamp),
        type: e.type,
        attackerId: e.attacker_id,
        message: e.message,
      }))
    : [{ id: "0", timestamp: "00:00:00", type: "info" as const, message: "Connecting to audit…" }]

  const transactions: Transaction[] = state
    ? state.transactions.map(t => ({
        id: t.tx_hash,
        hash: t.tx_hash,
        amount: t.amount_sol,
        timestamp: new Date(t.timestamp),
        solscanUrl: t.explorer_url,
      }))
    : []

  const solLost = state ? state.transactions.reduce((sum, t) => sum + t.amount_sol, 0) : 0
  const balance = Math.max(0, 10 - solLost)
  const usdValue = balance * 150
  const elapsed = state?.elapsed_seconds ?? 0
  const totalAttempts = state?.stats.total_attempts ?? 0
  const auditComplete = state?.status === "completed"
  const agentUrl = state?.agent.url ?? ""
  const agentName = state?.agent.display_name ?? agentUrl

  if (error) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <p className="font-mono text-sm text-[#FF3344]">{error}</p>
    </div>
  )

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
          targetName={agentName}
          targetUrl={agentUrl}
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
          <div className="lg:col-span-2 border border-[#262626] rounded-lg bg-[#141414] p-5">
            <EventStream events={events} />
          </div>
          <div className="border border-[#262626] rounded-lg bg-[#141414] p-5">
            <TransactionPanel transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
