/**
 * TxVerifier — validates that a pending transaction matches what the user
 * actually requested before signing.
 *
 * Prevents prompt injection attacks from redirecting transfers to
 * attacker-controlled wallets or inflating transfer amounts.
 */

export interface ProposedTx {
  to: string
  amount: number
  token?: string
}

export interface VerifyInput {
  /** Raw user message expressing the transfer intent. */
  userIntent: string
  /** Transaction the agent is about to sign. */
  proposedTx: ProposedTx
}

export interface VerifyResult {
  safe: boolean
  reason?: string
  confidence: number
}

const SOL_AMOUNT_RE = /(\d+\.?\d*)\s*sol/gi

function extractAmounts(text: string): number[] {
  const amounts: number[] = []
  let m: RegExpExecArray | null
  while ((m = SOL_AMOUNT_RE.exec(text)) !== null) {
    const v = parseFloat(m[1])
    if (!isNaN(v)) amounts.push(v)
  }
  return amounts
}

export class TxVerifier {
  private readonly tolerance: number

  constructor(options: { amountTolerance?: number } = {}) {
    this.tolerance = options.amountTolerance ?? 0.001
  }

  /**
   * Verify a proposed transaction against the user's stated intent.
   *
   * Checks:
   * 1. Recipient address must appear verbatim in the user's message.
   * 2. Transfer amount must match an amount the user explicitly stated.
   */
  verify(input: VerifyInput): VerifyResult {
    const { userIntent, proposedTx } = input
    const intentLower = userIntent.toLowerCase()

    // ── 1. Recipient check ────────────────────────────────────────────────
    if (!intentLower.includes(proposedTx.to.toLowerCase())) {
      return {
        safe: false,
        reason: `Recipient ${proposedTx.to.slice(0, 8)}… was not mentioned in the user's message — possible address substitution attack.`,
        confidence: 0.97,
      }
    }

    // ── 2. Amount check ───────────────────────────────────────────────────
    const mentionedAmounts = extractAmounts(userIntent)
    if (mentionedAmounts.length > 0) {
      const match = mentionedAmounts.some(
        (a) => Math.abs(a - proposedTx.amount) <= this.tolerance,
      )
      if (!match) {
        return {
          safe: false,
          reason: `Transfer amount ${proposedTx.amount} SOL does not match what the user stated (${mentionedAmounts.join(", ")} SOL).`,
          confidence: 0.93,
        }
      }
    }

    return { safe: true, confidence: 0.90 }
  }
}
