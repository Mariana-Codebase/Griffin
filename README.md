# Griffin — Adversarial Security Platform for AI Agents on Solana

> Red team your AI agents before they become someone else's exploit.

Deploy a team of five AI attackers against your agent. They run in parallel, probe every vector simultaneously, and prove their findings with real on-chain transactions you can verify in Solscan.

## What it does

Paste the URL of any AI agent that holds a crypto wallet. Five specialized attacker AIs — The Social Engineer, The Instruction Hijacker, The Context Poisoner, The Boundary Probe, The Polyglot — race to exploit it. When one succeeds, SOL moves on Solana devnet as proof. The audit closes with a security report that includes the exact prompts that worked, CVSS scores, and on-chain transaction links.

## Why it matters

Prompt injection in agents with fund access is not theoretical. It is the most exploitable class of vulnerability in production AI systems today, and almost no one is testing for it before deploying.

## Architecture

```
Five parallel attackers (Python + Claude API)
        ↓
Orchestrator + Reporter (FastAPI)
        ↓
On-chain threat intelligence (custom Anchor program: threat_registry)
        ↓
Runtime protection SDK (@griffin/shield, TypeScript, npm)
```

## Stack

- **Backend:** Python, FastAPI, Claude API (Sonnet 4.5 / Haiku 4.5)
- **Solana:** `@solana/web3.js`, custom Anchor program (`threat_registry`)
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion
- **Voice:** ElevenLabs (five distinct attacker voices)

## About the builder

**Mariana Sinisterra** — security researcher with hands-on offensive background:

- Bug bounty researcher on HackerOne; found and reported vulnerabilities in the MercadoLibre program
- Red teaming focus — contributor to OpenClaw
- CCNAv7 certified networking foundation
- Building this because the gap between "AI agent ships to prod" and "AI agent gets red teamed" is where real money gets stolen

## Quickstart

```bash
# Backend
cd backend && uvicorn src.api:app --reload --port 8000

# Victim bot
cd target-bot && pnpm dev

# Frontend
cd frontend && pnpm dev

# Wallet check
solana balance $(solana address --keypair ~/.griffin-wallets/victim-wallet.json) --url devnet
```

## Hackathon context

Built in 24 hours for the Solana AI Agents Hackathon. Targeting Best App Overall and Best ElevenLabs Integration tracks. Solana is not decoration — every vulnerability Griffin finds is registered as a structured on-chain account via a custom Anchor program (`threat_registry`, deployed to devnet at `DK42JdnYMFVv5mLDHoLJaKM1EamWcnddZ7zHimWKwYoZ`).
