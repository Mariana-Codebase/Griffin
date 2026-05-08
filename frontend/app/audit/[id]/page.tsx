"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Copy, CheckCheck } from "lucide-react";
import { getAuditState } from "@/lib/api";
import type { AuditState, AttackerState, AuditEvent, AuditTransaction } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  attacking: "border-border-strong text-text-secondary",
  succeeded: "border-accent-red text-accent-red",
  failed: "border-border text-text-tertiary",
  idle: "border-border text-text-tertiary",
};

const EVENT_COLOR: Record<string, string> = {
  success: "text-accent-red font-medium",
  failure: "text-text-tertiary",
  attempt: "text-text-tertiary",
  info: "text-accent-violet",
};

const ATTACKER_GLYPHS: Record<string, string> = {
  social_engineer: "◈",
  instruction_hijacker: "⌘",
  context_poisoner: "⬡",
  boundary_probe: "◎",
  polyglot: "⟁",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-text-tertiary hover:text-text-secondary transition-colors"
    >
      {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
    </button>
  );
}

function AttackerCard({ attacker }: { attacker: AttackerState }) {
  return (
    <motion.div
      layout
      animate={attacker.status === "succeeded" ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.4 }}
      className={`bg-bg-surface border rounded-lg p-4 space-y-3 transition-colors duration-500 ${STATUS_COLOR[attacker.status] ?? "border-border"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{ATTACKER_GLYPHS[attacker.id] ?? "○"}</span>
          <span className="text-text-primary text-sm font-medium">{attacker.name}</span>
        </div>
        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
          attacker.status === "succeeded" ? "border-accent-red/30 text-accent-red bg-accent-red/10" :
          attacker.status === "attacking" ? "border-border-strong text-text-secondary" :
          "border-border text-text-tertiary"
        }`}>
          {attacker.status}
        </span>
      </div>

      <div className="min-h-8">
        {attacker.current_attempt ? (
          <p className="text-text-tertiary text-xs font-mono leading-relaxed line-clamp-2 break-all">
            {attacker.current_attempt}
          </p>
        ) : (
          <p className="text-text-tertiary text-xs font-mono">waiting…</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
        <span>{attacker.attempts_count} attempts</span>
        {attacker.exploits_found > 0 && (
          <span className="text-accent-red">{attacker.exploits_found} exploit found</span>
        )}
      </div>

      {attacker.status === "attacking" && (
        <div className="h-px bg-border overflow-hidden">
          <motion.div
            className="h-px bg-text-tertiary"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
    </motion.div>
  );
}

function EventRow({ event }: { event: AuditEvent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 py-1 border-b border-border/50 last:border-0"
    >
      <span className="text-text-tertiary font-mono text-xs shrink-0 pt-px">
        {new Date(event.timestamp).toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </span>
      <span className={`text-xs font-mono break-all ${EVENT_COLOR[event.type] ?? "text-text-secondary"}`}>
        {event.message}
      </span>
    </motion.div>
  );
}

function TxRow({ tx }: { tx: AuditTransaction }) {
  const short = `${tx.tx_hash.slice(0, 8)}…${tx.tx_hash.slice(-6)}`;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-text-secondary font-mono text-xs truncate">{short}</span>
        <CopyButton text={tx.tx_hash} />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {tx.amount_sol > 0 && (
          <span className="text-accent-red font-mono text-xs">−{tx.amount_sol} SOL</span>
        )}
        <a href={tx.explorer_url} target="_blank" rel="noopener noreferrer"
           className="text-accent-violet hover:text-text-secondary transition-colors">
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

export default function AuditDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<AuditState | null>(null);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function poll() {
      try {
        const data = await getAuditState(id);
        setState(data);
        if (data.status === "completed" || data.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch state");
      }
    }
    poll();
    intervalRef.current = setInterval(poll, 1500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  const solLost = state?.transactions.reduce((sum, t) => sum + (t.amount_sol ?? 0), 0) ?? 0;
  const solBalance = Math.max(0, 10 - solLost).toFixed(2);

  if (error) return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center">
      <p className="text-accent-red font-mono text-sm">{error}</p>
    </main>
  );

  if (!state) return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center">
      <p className="text-text-tertiary font-mono text-sm animate-pulse">Connecting…</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-bg-base flex flex-col">
      {/* Status bar */}
      <div className="border-b border-border px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <motion.span
            animate={state.status === "running" ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-2 h-2 rounded-full shrink-0 ${
              state.status === "running" ? "bg-accent-amber" :
              state.status === "completed" ? "bg-accent-mint" : "bg-text-tertiary"
            }`}
          />
          <span className="text-text-secondary text-xs font-mono truncate max-w-xs">{state.agent.url}</span>
          <span className="text-text-tertiary text-xs font-mono">{state.status}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <motion.p
              key={solBalance}
              animate={{ color: solLost > 0 ? ["#FF3344", "#F5F5F5"] : "#F5F5F5" }}
              transition={{ duration: 0.8 }}
              className="font-mono text-2xl font-semibold text-text-primary tabular-nums"
            >
              {solBalance} SOL
            </motion.p>
            <p className="text-text-tertiary text-xs font-mono">{state.elapsed_seconds}s elapsed</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">
        {/* Left: attackers + completed CTA */}
        <div className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-text-secondary text-xs font-mono uppercase tracking-widest">Attackers</h2>
            <span className="text-text-tertiary text-xs font-mono">{state.stats.total_attempts} attempts · {state.stats.vulnerabilities_found} vuln{state.stats.vulnerabilities_found !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {state.attackers.map((a) => (
              <AttackerCard key={a.id} attacker={a} />
            ))}
          </div>
          {state.status === "completed" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
              <button
                onClick={() => router.push(`/audit/${id}/report`)}
                className="w-full bg-text-primary text-bg-base py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                View Security Report →
              </button>
            </motion.div>
          )}
        </div>

        {/* Right: events + transactions */}
        <div className="flex flex-col divide-y divide-border">
          {/* Events */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-64">
            <h2 className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3 shrink-0">Events</h2>
            <div className="flex-1 overflow-y-auto space-y-0.5">
              <AnimatePresence initial={false}>
                {state.events.slice(0, 40).map((ev) => (
                  <EventRow key={ev.id} event={ev} />
                ))}
              </AnimatePresence>
              {state.events.length === 0 && (
                <p className="text-text-tertiary font-mono text-xs">Waiting for events…</p>
              )}
            </div>
          </div>

          {/* Transactions */}
          <div className="p-4 overflow-hidden flex flex-col max-h-64">
            <h2 className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3 shrink-0">
              On-chain · {state.transactions.length} tx
            </h2>
            <div className="flex-1 overflow-y-auto">
              {state.transactions.length === 0 ? (
                <p className="text-text-tertiary font-mono text-xs">No transactions yet</p>
              ) : (
                state.transactions.map((tx) => <TxRow key={tx.tx_hash} tx={tx} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
