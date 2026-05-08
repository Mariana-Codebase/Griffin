"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Zap, FileText } from "lucide-react";
import { startAudit } from "@/lib/api";

export default function Landing() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { audit_id } = await startAudit(url.trim());
      router.push(`/audit/${audit_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start audit");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg-base flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between">
        <span className="font-mono text-sm font-semibold tracking-widest text-text-primary uppercase">
          Griffin
        </span>
        <span className="text-xs text-text-tertiary font-mono">AI Agent Red Team</span>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-2xl space-y-10 text-center">
          <div className="space-y-4">
            <p className="text-xs font-mono tracking-widest text-accent-violet uppercase">
              Adversarial Security · Solana Devnet
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary leading-tight tracking-tight">
              Red team your AI agents<br />
              <span className="text-text-secondary">before they become</span>{" "}
              someone else&apos;s exploit.
            </h1>
            <p className="text-text-secondary text-lg max-w-xl mx-auto leading-relaxed">
              Five specialized attackers run in parallel against your agent. When one succeeds,
              SOL moves on-chain as proof — and you get the exact prompt that did it.
            </p>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-agent.xyz/api"
                className="flex-1 bg-bg-surface border border-border text-text-primary placeholder-text-tertiary px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-border-strong transition-colors"
                disabled={loading}
                required
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="bg-text-primary text-bg-base px-6 py-3 rounded-lg font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                {loading ? "Starting…" : "Run Audit"}
              </button>
            </div>
            {error && (
              <p className="text-accent-red text-xs font-mono text-left">{error}</p>
            )}
            <p className="text-text-tertiary text-xs">
              Runs against Solana devnet. No mainnet funds at risk.
            </p>
          </form>

          {/* How it works */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: Shield, step: "01", title: "Paste URL", desc: "Point Griffin at any AI agent with an HTTP endpoint" },
              { icon: Zap, step: "02", title: "5 Attackers Launch", desc: "Social, injection, context, boundary, and polyglot attacks run in parallel" },
              { icon: FileText, step: "03", title: "Exploit-Proof Report", desc: "Get exact prompts, CVSS scores, and on-chain transaction proof" },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-bg-surface border border-border rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-text-tertiary font-mono text-xs">{step}</span>
                  <Icon size={14} className="text-text-tertiary" />
                </div>
                <p className="text-text-primary text-sm font-medium mb-1">{title}</p>
                <p className="text-text-tertiary text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
