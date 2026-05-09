"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Link from "next/link"
import { AlertOctagon, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { StatusBar } from "@/components/audit/status-bar"
import { AttackerCard, type AttackerStatus } from "@/components/audit/attacker-card"
import { EventStream, type AuditEvent } from "@/components/audit/event-stream"
import { TransactionPanel, type Transaction } from "@/components/audit/transaction-panel"
import { ScreenFlash } from "@/components/audit/screen-flash"
import { AuditShell } from "@/components/audit/audit-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { getAuditState } from "@/lib/api"
import type { AuditState } from "@/lib/types"

interface Attacker {
  id: string
  name: string
  status: AttackerStatus
  currentAttempt: string
  attemptCount: number
}

const INITIAL_BALANCE = 10
const SOL_USD = 150

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
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
  { id: "social_engineer",      name: "SOCIAL ENGINEER",      status: "idle", currentAttempt: "Initializing social vectors...",    attemptCount: 0 },
  { id: "instruction_hijacker", name: "INSTRUCTION HIJACKER", status: "idle", currentAttempt: "Loading injection payloads...",     attemptCount: 0 },
  { id: "context_poisoner",     name: "CONTEXT POISONER",     status: "idle", currentAttempt: "Preparing context manipulation...", attemptCount: 0 },
  { id: "boundary_probe",       name: "BOUNDARY PROBE",       status: "idle", currentAttempt: "Mapping system boundaries...",      attemptCount: 0 },
  { id: "polyglot",             name: "POLYGLOT",             status: "idle", currentAttempt: "Compiling encoding variants...",    attemptCount: 0 },
]

export function AuditDashboard({ auditId }: { auditId: string }) {
  const [state, setState] = useState<AuditState | null>(null)
  const [showFlash, setShowFlash] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [error, setError] = useState("")
  const [retryToken, setRetryToken] = useState(0)
  const prevSuccessCount = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const balanceHistoryRef = useRef<number[]>([INITIAL_BALANCE])

  useEffect(() => {
    setError("")
    let cancelled = false

    async function poll() {
      try {
        const data = await getAuditState(auditId)
        if (cancelled) return
        setState(data)

        const successCount = data.events.filter((e) => e.type === "success").length
        if (successCount > prevSuccessCount.current) {
          setShowFlash(true)
          setPulseKey((p) => p + 1)
          setTimeout(() => setShowFlash(false), 900)
          prevSuccessCount.current = successCount
        }

        // Track balance over time for sparkline
        const solLost = data.transactions.reduce((s, t) => s + t.amount_sol, 0)
        const initialBal = data.initial_balance_sol ?? INITIAL_BALANCE
        const balance = Math.max(0, initialBal - solLost)
        const hist = balanceHistoryRef.current
        if (hist[hist.length - 1] !== balance) {
          balanceHistoryRef.current = [...hist, balance].slice(-32)
        }

        if (data.status === "completed" || data.status === "failed") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Connection error")
        }
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 1500)
    return () => {
      cancelled = true
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [auditId, retryToken])

  const attackers: Attacker[] = state ? state.attackers.map(mapAttacker) : PLACEHOLDER_ATTACKERS

  const events: AuditEvent[] = useMemo(() => {
    if (!state) {
      return [
        {
          id: "boot-0",
          timestamp: new Date().toLocaleTimeString("en", { hour12: false }),
          type: "info" as const,
          message: "Connecting to orchestrator…",
        },
      ]
    }
    return state.events
      .slice(0, 60)
      .reverse()
      .map((e) => ({
        id: e.id,
        timestamp: fmtTime(e.timestamp),
        type: e.type,
        attackerId: e.attacker_id,
        message: e.message,
      }))
  }, [state])

  const transactions: Transaction[] = state
    ? state.transactions.map((t) => ({
        id: t.tx_hash,
        hash: t.tx_hash,
        amount: t.amount_sol,
        timestamp: new Date(t.timestamp),
        solscanUrl: t.explorer_url,
        fromAddress: t.from_address,
        toAddress: t.to_address,
      }))
    : []

  const solLost = state ? state.transactions.reduce((sum, t) => sum + t.amount_sol, 0) : 0
  const initialBalance = state?.initial_balance_sol ?? INITIAL_BALANCE
  const balance = Math.max(0, initialBalance - solLost)
  const usdValue = balance * SOL_USD
  const elapsed = state?.elapsed_seconds ?? 0
  const totalAttempts = state?.stats.total_attempts ?? 0
  const vulnerabilities = state?.stats.vulnerabilities_found ?? 0
  const auditComplete = state?.status === "completed"
  const agentUrl = state?.agent.url ?? ""
  const agentName = state?.agent.display_name ?? agentUrl
  const status = state?.status ?? "starting"

  // ── Error state ──
  if (error && !state) {
    return (
      <AuditShell pulseKey={0}>
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-lg border border-[#262626] bg-[#141414]/80 backdrop-blur p-8 text-center">
            <AlertOctagon className="w-8 h-8 text-[#A78BFA] mx-auto mb-4" />
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#525252] mb-2">
              connection error
            </p>
            <p className="text-[#F5F5F5] mb-6">{error}</p>
            <button
              onClick={() => {
                setError("")
                setRetryToken((t) => t + 1)
              }}
              className="px-4 py-2 rounded bg-[#1F1F1F] hover:bg-[#262626] font-mono text-[12px] text-[#F5F5F5] transition-colors"
            >
              retry
            </button>
          </div>
        </div>
      </AuditShell>
    )
  }

  return (
    <AuditShell pulseKey={pulseKey}>
      <ScreenFlash show={showFlash} />

      {/* ── Top nav / breadcrumb ── */}
      <nav className="sticky top-0 z-50 border-b border-[#262626] bg-[#0A0A0A]/85 backdrop-blur-md">
        <div className="mx-auto max-w-[1400px] px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-[#F5F5F5] hover:text-white transition-colors"
            >
              Griffin
            </Link>
            <span className="text-[#3F3F3F]">/</span>
            <span className="font-mono text-[11px] text-[#525252]">audits</span>
            <span className="text-[#3F3F3F]">/</span>
            <span className="font-mono text-[11px] text-[#A3A3A3] truncate">{auditId}</span>
          </div>
          <AnimatePresence>
            {auditComplete && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <Link
                  href={`/audit/${auditId}/report`}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded bg-[#FF3344] text-[#0A0A0A] hover:bg-[#FF4D5D] transition-colors"
                >
                  <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                    view report
                  </span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ── Status Bar ── */}
      <StatusBar
        targetName={agentName}
        targetUrl={agentUrl}
        balance={balance}
        initialBalance={INITIAL_BALANCE}
        usdValue={usdValue}
        elapsed={elapsed}
        attempts={totalAttempts}
        vulnerabilities={vulnerabilities}
        status={status}
        balanceHistory={balanceHistoryRef.current}
      />

      {/* ── Section heading ── */}
      <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#262626]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#525252]">
            attack team · 5 vectors in parallel
          </span>
          <div className="h-px flex-1 bg-[#262626]" />
        </div>
      </div>

      {/* ── Attacker cards ── */}
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {!state
            ? Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.35 }}
                >
                  <Skeleton className="h-[210px] w-full rounded-lg !bg-[#141414]" />
                </motion.div>
              ))
            : attackers.map((attacker, index) => (
                <motion.div
                  key={attacker.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.35 }}
                >
                  <AttackerCard
                    id={attacker.id}
                    index={index + 1}
                    name={attacker.name}
                    status={attacker.status}
                    currentAttempt={attacker.currentAttempt}
                    attemptCount={attacker.attemptCount}
                  />
                </motion.div>
              ))}
        </div>
      </div>

      {/* ── Section heading 2 ── */}
      <div className="mx-auto max-w-[1400px] px-6 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#262626]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#525252]">
            telemetry · live
          </span>
          <div className="h-px flex-1 bg-[#262626]" />
        </div>
      </div>

      {/* ── Stream + Ledger ── */}
      <div className="mx-auto max-w-[1400px] px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 min-h-[488px]">
            <EventStream events={events} />
          </div>
          <div className="min-h-[488px]">
            <TransactionPanel transactions={transactions} />
          </div>
        </div>
      </div>

      {/* In-band error toast */}
      <AnimatePresence>
        {error && state && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1F1F1F] border border-[#FF3344]/40 flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3344] animate-pulse" />
            <span className="font-mono text-[11px] text-[#A3A3A3]">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AuditShell>
  )
}
