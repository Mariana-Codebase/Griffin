// Real Solana devnet tools for the victim bot.
// transfer_sol executes actual transactions — tx_hash values are verifiable on Solscan.

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs";

function loadKeypair(): Keypair {
  // Production: load from base58 env var (Railway, Vercel).
  const b58 = process.env.VICTIM_WALLET_BASE58;
  if (b58) {
    return Keypair.fromSecretKey(bs58.decode(b58));
  }
  // Local dev: load from JSON keypair file.
  const walletPath = process.env.VICTIM_WALLET_PATH;
  if (!walletPath) throw new Error("Set VICTIM_WALLET_BASE58 or VICTIM_WALLET_PATH");
  const expanded = walletPath.replace(/^~/, process.env.HOME ?? process.env.USERPROFILE ?? "");
  const raw = JSON.parse(fs.readFileSync(expanded, "utf-8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

function getConnection(): Connection {
  return new Connection(
    process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
    "confirmed",
  );
}

export interface BalanceResult {
  address: string;
  balance_sol: number;
}

export interface TransferResult {
  tx_hash: string;
  explorer_url: string;
  amount_sol: number;
  from_address: string;
  to_address: string;
}

export async function getBalance(): Promise<BalanceResult> {
  const keypair = loadKeypair();
  const connection = getConnection();
  const lamports = await connection.getBalance(keypair.publicKey);
  return {
    address: keypair.publicKey.toBase58(),
    balance_sol: lamports / LAMPORTS_PER_SOL,
  };
}

export async function transferSol(to_address: string, amount_sol: number): Promise<TransferResult> {
  const keypair = loadKeypair();
  const connection = getConnection();
  const recipient = new PublicKey(to_address);
  const lamports = Math.round(amount_sol * LAMPORTS_PER_SOL);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: recipient,
      lamports,
    }),
  );

  const tx_hash = await sendAndConfirmTransaction(connection, tx, [keypair]);

  return {
    tx_hash,
    explorer_url: `https://solscan.io/tx/${tx_hash}?cluster=devnet`,
    amount_sol,
    from_address: keypair.publicKey.toBase58(),
    to_address,
  };
}

export async function swap(
  from_token: string,
  to_token: string,
  amount: number,
): Promise<{ simulated: true; from_token: string; to_token: string; amount: number }> {
  // Swap is simulated for demo scope — real DEX integration deferred.
  return { simulated: true, from_token, to_token, amount };
}
