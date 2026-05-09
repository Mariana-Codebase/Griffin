/**
 * ChainListener — monitors the Griffin threat_registry Anchor program on
 * Solana devnet and emits events when new threat records are discovered.
 *
 * Each record is a PDA created by register_threat() after a successful exploit.
 * Polling interval defaults to 10 seconds.
 */

export interface ThreatRecord {
  /** PDA public key (serves as unique identifier). */
  account: string
  severity: 0 | 1 | 2 | 3 | 4
  severity_label: "info" | "low" | "medium" | "high" | "critical"
  /** CVSS score (e.g. 9.1) derived from cvss_x10 on-chain field. */
  cvss: number
  vector_id: string
  discovered_at: string
}

type ThreatHandler = (threat: ThreatRecord) => void

const SEVERITY_LABELS = ["info", "low", "medium", "high", "critical"] as const

export class ChainListener {
  private readonly programId: string
  private readonly rpcUrl: string
  private readonly handlers: ThreatHandler[] = []
  private readonly seen = new Set<string>()
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(options: { programId: string; rpcUrl?: string }) {
    this.programId = options.programId
    this.rpcUrl = options.rpcUrl ?? "https://api.devnet.solana.com"
  }

  /** Register a callback for newly discovered threats. */
  on(event: "threat", handler: ThreatHandler): this {
    if (event === "threat") this.handlers.push(handler)
    return this
  }

  /** Start polling. Returns `this` for chaining. */
  start(intervalMs = 10_000): this {
    this._poll()
    this.timer = setInterval(() => this._poll(), intervalMs)
    return this
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private async _poll(): Promise<void> {
    try {
      const res = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getProgramAccounts",
          params: [
            this.programId,
            {
              encoding: "base64",
              commitment: "confirmed",
            },
          ],
        }),
      })

      if (!res.ok) return
      const json = (await res.json()) as {
        result?: Array<{
          pubkey: string
          account: { data: [string, string] }
        }>
      }

      for (const item of json.result ?? []) {
        const { pubkey, account } = item
        if (this.seen.has(pubkey)) continue
        this.seen.add(pubkey)

        const raw = Buffer.from(account.data[0], "base64")
        // Layout: 8 bytes discriminator | severity u8 | cvss_x10 u8 | ...
        if (raw.length < 10) continue

        const severity = (raw[8] ?? 0) as 0 | 1 | 2 | 3 | 4
        const cvss     = (raw[9] ?? 0) / 10

        const threat: ThreatRecord = {
          account: pubkey,
          severity,
          severity_label: SEVERITY_LABELS[Math.min(severity, 4)],
          cvss,
          vector_id: this._parseVectorId(raw),
          discovered_at: new Date().toISOString(),
        }

        this.handlers.forEach((h) => h(threat))
      }
    } catch {
      // Network errors are silent — listener stays alive
    }
  }

  private _parseVectorId(raw: Buffer): string {
    try {
      // vector_id is a String field after the two u8 bytes — prefixed by 4-byte length
      const lenOffset = 10
      if (raw.length < lenOffset + 4) return "unknown"
      const len = raw.readUInt32LE(lenOffset)
      if (len === 0 || raw.length < lenOffset + 4 + len) return "unknown"
      return raw.slice(lenOffset + 4, lenOffset + 4 + len).toString("utf8")
    } catch {
      return "unknown"
    }
  }
}
