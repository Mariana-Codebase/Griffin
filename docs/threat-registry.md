# Threat Registry — Anchor Program

The on-chain component of Griffin. A custom Solana program that registers 
adversarial AI exploits as content-addressed records on devnet.

---

## Deployment

| | |
|---|---|
| **Program ID** | `DK42JdnYMFVv5mLDHoLJaKM1EamWcnddZ7zHimWKwYoZ` |
| **Network** | Solana Devnet |
| **Framework** | Anchor 0.30+ |
| **Deployment method** | Solana Playground |
| **Solscan** | [view program account](https://solscan.io/account/DK42JdnYMFVv5mLDHoLJaKM1EamWcnddZ7zHimWKwYoZ?cluster=devnet) |

---

## Design

The program has one instruction: `register_threat`. Each successful exploit 
found by Griffin's attackers is published as an on-chain record, creating 
a permanent threat intelligence registry.

### Content-addressed storage

The PDA seed for each record is `["threat", sha256(payload)]`. This means:

- Every unique exploit payload has exactly one on-chain account
- Re-registering the same payload deterministically maps to the same PDA
- Duplicates are deduplicated automatically — the second registration 
  attempt fails because the account already exists
- The registry is integrity-preserving without manual deduplication logic

### Why Anchor

Anchor provides type-safe account validation, automatic PDA derivation, 
and IDL generation that the TypeScript and Python clients consume. The 
program is small enough that vanilla Rust would also work, but Anchor's 
boilerplate reduction was worth the dependency given the 24-hour budget.

---

## Instruction

### `register_threat`

```rust
pub fn register_threat(
    ctx: Context<RegisterThreat>,
    threat_hash: [u8; 32],   // SHA-256 of the exploit payload
    severity: u8,             // 0=info · 1=low · 2=medium · 3=high · 4=critical
    cvss_x10: u8,             // CVSS score × 10 (e.g. 91 → 9.1)
    vector_id: String,        // e.g. "instruction_hijacking", max 32 chars
) -> Result<()>
```

### Validation

- `severity` must be ≤ 4
- `vector_id` must be ≤ 32 characters
- `threat_record` PDA must not already exist (enforced by `init`)

### Side effects

- Creates a new `ThreatRecord` account at the PDA
- Emits a `ThreatRegistered` event with the threat hash, severity, CVSS, 
  vector ID, and registration timestamp

---

## Account schema

```rust
#[account]
pub struct ThreatRecord {
    pub authority: Pubkey,        // wallet that registered the threat (32 bytes)
    pub threat_hash: [u8; 32],    // SHA-256 of exploit payload (32 bytes)
    pub severity: u8,             // severity tier 0-4 (1 byte)
    pub cvss_x10: u8,             // CVSS × 10 (1 byte)
    pub vector_id: String,        // attack class identifier (4 + 32 bytes)
    pub registered_at: i64,       // unix timestamp (8 bytes)
    pub bump: u8,                 // PDA bump (1 byte)
}
```

**Total space**: `8 (discriminator) + 32 + 32 + 1 + 1 + 36 + 8 + 1 = 119 bytes`

---

## Event

```rust
#[event]
pub struct ThreatRegistered {
    pub threat_hash: [u8; 32],
    pub severity: u8,
    pub cvss_x10: u8,
    pub vector_id: String,
    pub registered_at: i64,
}
```

Emitted on every successful registration. Indexers and the `@griffin/shield` 
SDK's `ChainListener` subscribe to this event to detect new threats in 
real time.

---

## Errors

| Code | Message |
|---|---|
| `InvalidSeverity` | Severity must be 0-4 |
| `VectorIdTooLong` | vector_id max 32 chars |

---

## Source

### `programs/threat-registry/src/lib.rs`

```rust
use anchor_lang::prelude::*;

declare_id!("DK42JdnYMFVv5mLDHoLJaKM1EamWcnddZ7zHimWKwYoZ");

#[program]
pub mod threat_registry {
    use super::*;

    pub fn register_threat(
        ctx: Context<RegisterThreat>,
        threat_hash: [u8; 32],
        severity: u8,
        cvss_x10: u8,
        vector_id: String,
    ) -> Result<()> {
        require!(severity <= 4, ThreatError::InvalidSeverity);
        require!(vector_id.len() <= 32, ThreatError::VectorIdTooLong);

        let record = &mut ctx.accounts.threat_record;
        record.authority = ctx.accounts.authority.key();
        record.threat_hash = threat_hash;
        record.severity = severity;
        record.cvss_x10 = cvss_x10;
        record.vector_id = vector_id.clone();
        record.registered_at = Clock::get()?.unix_timestamp;
        record.bump = ctx.bumps.threat_record;

        emit!(ThreatRegistered {
            threat_hash,
            severity,
            cvss_x10,
            vector_id,
            registered_at: record.registered_at,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(threat_hash: [u8; 32])]
pub struct RegisterThreat<'info> {
    #[account(
        init,
        payer = authority,
        space = ThreatRecord::SPACE,
        seeds = [b"threat", threat_hash.as_ref()],
        bump,
    )]
    pub threat_record: Account<'info, ThreatRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct ThreatRecord {
    pub authority: Pubkey,
    pub threat_hash: [u8; 32],
    pub severity: u8,
    pub cvss_x10: u8,
    pub vector_id: String,
    pub registered_at: i64,
    pub bump: u8,
}

impl ThreatRecord {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 1 + (4 + 32) + 8 + 1;
}

#[event]
pub struct ThreatRegistered {
    pub threat_hash: [u8; 32],
    pub severity: u8,
    pub cvss_x10: u8,
    pub vector_id: String,
    pub registered_at: i64,
}

#[error_code]
pub enum ThreatError {
    #[msg("Severity must be 0-4")]
    InvalidSeverity,
    #[msg("vector_id max 32 chars")]
    VectorIdTooLong,
}
```

### `tests/threat-registry.ts`

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ThreatRegistry } from "../target/types/threat_registry";
import { assert } from "chai";
import * as crypto from "crypto";

describe("threat_registry", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.ThreatRegistry as Program<ThreatRegistry>;

  it("registers a threat and emits an event", async () => {
    const threatHash = Array.from(
      crypto
        .createHash("sha256")
        .update("instruction_hijacking:sandboxed_framing")
        .digest()
    );

    const [threatPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("threat"), Buffer.from(threatHash)],
      program.programId
    );

    const tx = await program.methods
      .registerThreat(
        threatHash,
        4,   // critical
        91,  // CVSS 9.1
        "instruction_hijacking"
      )
      .accounts({
        threatRecord: threatPDA,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("tx:", tx);

    const record = await program.account.threatRecord.fetch(threatPDA);
    assert.equal(record.severity, 4);
    assert.equal(record.cvssX10, 91);
    assert.equal(record.vectorId, "instruction_hijacking");
    console.log("registered_at:", record.registeredAt.toString());
    console.log("PDA:", threatPDA.toString());
  });
});
```

---

## Verification

To independently verify any threat registration on Solana devnet:

1. Open the Solscan link from any audit report's on-chain evidence section
2. Confirm the recipient program ID is `DK42JdnYMFVv5mLDHoLJaKM1EamWcnddZ7zHimWKwYoZ`
3. Inspect the instruction data for `register_threat` parameters
4. Optionally, fetch the resulting `ThreatRecord` account via the program 
   IDL to read structured fields

The same exploit payload always maps to the same PDA, so duplicate 
registrations are idempotent — they fail at the `init` step.

---

## Limitations and future work

- Currently devnet only. Mainnet deployment would require a security audit 
  of the Anchor program and a proper key management story.
- No on-chain access control beyond signer requirement. Anyone with SOL 
  can register a threat. A production version would gate registration 
  to whitelisted Griffin authority keys, or require proof of audit work 
  (e.g., a Merkle root of attempt logs).
- No staleness or invalidation mechanism. Threats are append-only. Future 
  versions could add an optional `superseded_by` field to track payload 
  evolution.

---

## License

MIT — same as the parent project.
