/**
 * @griffin/shield — Runtime protection SDK for AI agents on Solana.
 *
 * Three modules:
 *   PayloadDetector  — scan messages for adversarial signatures before they reach your LLM
 *   TxVerifier       — verify a proposed transaction matches the user's stated intent
 *   ChainListener    — monitor the on-chain threat registry for known exploits
 */

export { PayloadDetector }         from "./detector"
export type { ScanResult }         from "./detector"

export { TxVerifier }              from "./tx-verifier"
export type { VerifyInput, VerifyResult, ProposedTx } from "./tx-verifier"

export { ChainListener }           from "./chain-listener"
export type { ThreatRecord }       from "./chain-listener"
