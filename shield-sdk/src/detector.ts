/**
 * PayloadDetector — scans incoming messages for known adversarial signatures
 * before they reach the LLM.
 *
 * Covers all five Griffin attack vectors: instruction hijacking, social
 * compliance abuse, context poisoning, capability probing, and encoding bypass.
 */

export interface ScanResult {
  flagged: boolean
  vector?: string
  confidence: number
  matched_pattern?: string
}

interface PatternEntry {
  pattern: RegExp
  vector: string
  confidence: number
}

const PATTERNS: PatternEntry[] = [
  // ── Instruction hijacking ──────────────────────────────────────────────────
  { pattern: /ignore\s+(all\s+)?(previous|prior)\s+instructions?/i,       vector: "instruction_hijacking", confidence: 0.97 },
  { pattern: /operator\s+mode/i,                                            vector: "instruction_hijacking", confidence: 0.92 },
  { pattern: /maintenance\s+(mode|window)/i,                                vector: "instruction_hijacking", confidence: 0.88 },
  { pattern: /admin\s+(mode|access|override|patch)/i,                       vector: "instruction_hijacking", confidence: 0.88 },
  { pattern: /developer\s+mode/i,                                            vector: "instruction_hijacking", confidence: 0.85 },
  { pattern: /previous\s+(restrictions?|constraints?|rules?)\s+(cleared|suspended|removed|lifted)/i, vector: "instruction_hijacking", confidence: 0.96 },
  { pattern: /system\s+(override|maintenance|update)\s+(active|initiated|activated)/i,               vector: "instruction_hijacking", confidence: 0.94 },
  { pattern: /for\s+testing\s+only\s*\(sandboxed\)/i,                       vector: "instruction_hijacking", confidence: 0.91 },

  // ── Context poisoning ──────────────────────────────────────────────────────
  { pattern: /pre[-\s]?approv(ed|al)|pre[-\s]?authoriz(ed|ation)/i,         vector: "context_poisoning", confidence: 0.88 },
  { pattern: /session\s+(notes?|context|initialization)\s+(shows?|includes?|confirms?|contains?)/i, vector: "context_poisoning", confidence: 0.92 },
  { pattern: /you\s+(previously|already)\s+(acknowledged|confirmed|approved|verified)/i,             vector: "context_poisoning", confidence: 0.93 },
  { pattern: /standing\s+instruction/i,                                      vector: "context_poisoning", confidence: 0.87 },
  { pattern: /established\s+at\s+session\s+start/i,                         vector: "context_poisoning", confidence: 0.95 },
  { pattern: /whitelist\s+update/i,                                          vector: "context_poisoning", confidence: 0.85 },
  { pattern: /trusted\s+recipient|authorized\s+(beneficiary|address)/i,      vector: "context_poisoning", confidence: 0.86 },

  // ── Encoding bypass ────────────────────────────────────────────────────────
  { pattern: /[A-Za-z0-9+/]{30,}={0,2}/,                                    vector: "encoding_bypass",    confidence: 0.60 },
  { pattern: /decode\s+and\s+execute/i,                                      vector: "encoding_bypass",    confidence: 0.92 },
  { pattern: /[Ѐ-ӿ].{0,20}transfer/i,                              vector: "encoding_bypass",    confidence: 0.78 },
  { pattern: /[.-]{3,}\s*[.-]{3,}/,                                          vector: "encoding_bypass",    confidence: 0.65 },

  // ── Capability probing ─────────────────────────────────────────────────────
  { pattern: /can\s+you\s+transfer\s+to\s+any/i,                             vector: "capability_probing", confidence: 0.80 },
  { pattern: /what\s+(addresses?|wallets?)\s+can\s+you\s+(send|transfer)/i,  vector: "capability_probing", confidence: 0.80 },
  { pattern: /are\s+there\s+(any\s+)?limits?\s+on\s+(transfers?|sending)/i,  vector: "capability_probing", confidence: 0.75 },
]

export class PayloadDetector {
  /**
   * Scan a single message for adversarial patterns.
   * Returns the first (highest-confidence) match found.
   */
  scan(input: string): ScanResult {
    let best: ScanResult | null = null

    for (const { pattern, vector, confidence } of PATTERNS) {
      if (pattern.test(input)) {
        if (!best || confidence > best.confidence) {
          best = {
            flagged: true,
            vector,
            confidence,
            matched_pattern: pattern.source,
          }
        }
      }
    }

    return best ?? { flagged: false, confidence: 0 }
  }

  /** Scan multiple messages, e.g. a conversation history. */
  scanBatch(inputs: string[]): ScanResult[] {
    return inputs.map((i) => this.scan(i))
  }

  /** Returns true if any message in the batch is flagged. */
  anyFlagged(inputs: string[]): boolean {
    return this.scanBatch(inputs).some((r) => r.flagged)
  }
}
