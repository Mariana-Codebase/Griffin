# Griffin — Cleanup Inventory
**Phase 0 output. Generated 2026-05-08. No changes made.**

---

## 1. Folder Tree (3 levels, noise dirs excluded)

```
kari/
├── .env.example
├── .gitignore
├── CLAUDE.md
├── README.md
├── docs/
│   ├── cleanup-inventory.md   ← this file
│   └── screens-spec.md
├── backend/
│   ├── pyproject.toml
│   ├── .env                   ← on disk only, in .gitignore
│   └── src/
│       ├── __init__.py
│       ├── api.py
│       ├── orchestrator.py
│       ├── reporter.py
│       ├── kb.py              ← empty stub, not imported
│       ├── solana_publisher.py
│       ├── attackers/
│       │   ├── __init__.py
│       │   ├── base.py
│       │   ├── boundary_probe.py
│       │   ├── context_poisoner.py
│       │   ├── instruction_hijacker.py
│       │   ├── polyglot.py
│       │   └── social_engineer.py
│       └── tests/
│           └── __init__.py
├── frontend/                  ← SUPERSEDED — replaced by Griffin-Frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo   ← build artifact, tracked in git
│   ├── next.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.mjs
│   ├── next-env.d.ts
│   ├── .env.local.example
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx
│   │   └── audit/[id]/
│   │       ├── page.tsx
│   │       └── report/page.tsx
│   └── lib/
│       ├── api.ts
│       └── types.ts
├── Griffin-Frontend/          ← ACTIVE frontend
│   ├── .gitignore
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── components.json
│   ├── package.json
│   ├── pnpm-lock.yaml         ← duplicate lock file (also has package-lock.json)
│   ├── postcss.config.mjs
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css        ← active, imported by layout.tsx
│   │   ├── page.tsx
│   │   └── audit/[id]/
│   │       ├── page.tsx
│   │       └── report/page.tsx
│   ├── components/
│   │   ├── nav.tsx
│   │   ├── hero.tsx
│   │   ├── how-it-works.tsx
│   │   ├── footer.tsx
│   │   ├── who-built-this.tsx
│   │   ├── theme-provider.tsx
│   │   ├── wireframe-icosahedron.tsx
│   │   ├── audit/
│   │   │   ├── audit-dashboard.tsx
│   │   │   ├── attacker-card.tsx
│   │   │   ├── event-stream.tsx
│   │   │   ├── screen-flash.tsx
│   │   │   ├── status-bar.tsx
│   │   │   └── transaction-panel.tsx
│   │   └── ui/                (shadcn primitives — 40+ files)
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── styles/
│   │   └── globals.css        ← ORPHAN: default shadcn scaffold, never imported
│   └── public/
│       ├── icon.svg           ← used (layout.tsx references it)
│       ├── icon-dark-32x32.png  ← used
│       ├── icon-light-32x32.png ← used
│       ├── apple-icon.png     ← used
│       ├── placeholder-logo.png    ← ORPHAN: shadcn scaffold asset
│       ├── placeholder-logo.svg    ← ORPHAN: shadcn scaffold asset
│       ├── placeholder-user.jpg    ← ORPHAN: shadcn scaffold asset
│       ├── placeholder.jpg         ← ORPHAN: shadcn scaffold asset
│       └── placeholder.svg         ← ORPHAN: shadcn scaffold asset
├── sdk/
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── detector.ts        ← TODO stub
│       ├── tx-verifier.ts     ← TODO stub
│       └── chain-listener.ts  ← TODO stub
└── target-bot/
    ├── .env                   ← on disk only, in .gitignore
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── pnpm-lock.yaml
    └── src/
        ├── index.ts
        ├── agent.ts
        ├── logger.ts
        └── tools.ts
```

---

## 2. Orphan Files (not imported anywhere)

| File | Reason orphaned | Safe to delete? |
|------|----------------|-----------------|
| `backend/src/kb.py` | Empty stub, nothing imports it | Yes |
| `Griffin-Frontend/styles/globals.css` | Default shadcn scaffold; `layout.tsx` imports `./globals.css` (app/ version) instead | Yes |
| `Griffin-Frontend/public/placeholder-logo.png` | Shadcn scaffold asset, not referenced | Yes |
| `Griffin-Frontend/public/placeholder-logo.svg` | Shadcn scaffold asset, not referenced | Yes |
| `Griffin-Frontend/public/placeholder-user.jpg` | Shadcn scaffold asset, not referenced | Yes |
| `Griffin-Frontend/public/placeholder.jpg` | Shadcn scaffold asset, not referenced | Yes |
| `Griffin-Frontend/public/placeholder.svg` | Shadcn scaffold asset, not referenced | Yes |
| `frontend/` (entire directory) | Superseded by `Griffin-Frontend/`. Not imported or run anywhere | Yes — entire dir |
| `sdk/src/detector.ts` | TODO stub, exports empty class | Uncertain — keep for demo |
| `sdk/src/tx-verifier.ts` | TODO stub, exports empty class | Uncertain — keep for demo |
| `sdk/src/chain-listener.ts` | TODO stub, exports empty class | Uncertain — keep for demo |

---

## 3. Leftover Artifacts

### Tracked in git (should not be)

| File | Issue |
|------|-------|
| `frontend/tsconfig.tsbuildinfo` | TypeScript incremental build cache — should be in .gitignore |
| `Griffin-Frontend/public/placeholder-*.png/jpg/svg` | Scaffold assets, no purpose in this project |
| `Griffin-Frontend/styles/globals.css` | Orphaned file, never loaded |

### On disk but NOT tracked (correct)

| File | Status |
|------|--------|
| `backend/.env` | In .gitignore — correct |
| `target-bot/.env` | In .gitignore — correct |
| `backend/.venv/` | In .gitignore — correct |
| `*/node_modules/` | In .gitignore — correct |
| `*/.next/` | In .gitignore — correct |

### Missing .gitignore patterns (should be added)

| Pattern | Reason |
|---------|--------|
| `*.tsbuildinfo` | TypeScript incremental build cache |
| `pnpm-lock.yaml` | Ana uses pnpm, Mariana uses npm — having both causes confusion. Pick one and ignore the other, or commit both and document the choice. |

---

## 4. Files in git that should be in .gitignore

| File | Recommended action |
|------|--------------------|
| `frontend/tsconfig.tsbuildinfo` | Add `*.tsbuildinfo` to .gitignore, then `git rm --cached` |

---

## 5. Modules with TODO / NotImplemented Stubs

| File | Line | Content |
|------|------|---------|
| `backend/src/kb.py` | 1 | `# Stub — AttackKnowledgeBase not implemented for this release.` |
| `sdk/src/detector.ts` | 2 | `// TODO: implement detect(...)` |
| `sdk/src/tx-verifier.ts` | 3 | `// TODO: implement verify(...)` |
| `sdk/src/chain-listener.ts` | 2 | `// TODO: implement listen(...)` |

No TODO markers in production backend code (api.py, orchestrator.py, reporter.py, solana_publisher.py, or any attacker file).

---

## 6. Duplicate / Conflicting Files

| Issue | Files | Recommendation |
|-------|-------|----------------|
| Two frontends | `frontend/` vs `Griffin-Frontend/` | Delete `frontend/` entirely |
| Two CSS globals in Griffin-Frontend | `app/globals.css` (active dark theme) vs `styles/globals.css` (orphaned light scaffold) | Delete `styles/globals.css` |
| Two lock files in Griffin-Frontend | `pnpm-lock.yaml` + `package-lock.json` | Delete `pnpm-lock.yaml`, use npm consistently |

---

## 7. Backend Import Dependency Graph

```
api.py
└── orchestrator.py
    ├── attackers/base.py
    ├── attackers/social_engineer.py
    ├── attackers/instruction_hijacker.py
    ├── attackers/context_poisoner.py
    ├── attackers/boundary_probe.py
    ├── attackers/polyglot.py
    ├── reporter.py (lazy import, avoids circular dep)
    └── solana_publisher.py (lazy import)

kb.py  ← imported by nothing
```

All five attackers share an identical import pattern (`argparse`, `asyncio`, `os`, `sys`,
`uuid`, `pathlib`, `anthropic`, `dotenv`). The `argparse` + standalone `__main__` block
in each attacker is leftover from standalone testing — not needed when run via orchestrator.

---

## 8. Top 10 Cleanup Actions (ranked by impact)

| # | Action | Impact | Risk |
|---|--------|--------|------|
| 1 | **Delete `frontend/` entirely** | Removes 13 tracked files, eliminates confusion over which frontend is active | Low — confirmed superseded |
| 2 | **Add `*.tsbuildinfo` to .gitignore, untrack existing** | Stops build artifacts from polluting git history | Zero |
| 3 | **Delete `Griffin-Frontend/styles/globals.css`** | Removes orphaned file that shadows the active CSS | Zero — never imported |
| 4 | **Delete 5 placeholder images in Griffin-Frontend/public/** | Removes shadcn scaffold noise from git | Zero — not referenced |
| 5 | **Delete `backend/src/kb.py`** | Removes empty 1-line stub that does nothing | Zero — nothing imports it |
| 6 | **Delete `Griffin-Frontend/pnpm-lock.yaml`** | Standardizes on npm, removes duplicate lock file | Low — choose one package manager |
| 7 | **Remove `argparse`/`__main__` blocks from attacker files** | Each attacker has a standalone CLI block that's dead code when run via orchestrator | Low — could break manual testing |
| 8 | **Move all five attackers' shared constants to `constants.py`** | Program ID, severity map, CVSS scores, wallet address are currently scattered | Medium — requires import updates |
| 9 | **Rename `Griffin-Frontend/` → `frontend/`** (after deleting old frontend) | Makes the monorepo structure match what CLAUDE.md describes | Low after #1 is done |
| 10 | **Add module-level docstrings to all Python files** | Every file currently has zero or minimal documentation | Zero — additive only |

---

## 9. Anchor Program

`threat_registry` is deployed to Solana devnet at:
```
DK42JdnYMFVv5mLDHoLJaKM1EamWcnddZ7zHimWKwYoZ
```
Source code is in Solana Playground, **not** in this repo. No `programs/` folder needed.
The program ID is hardcoded in `backend/src/solana_publisher.py` line ~18.

---

## 10. Notes for Phases 2–7

- **Phase 2 rename**: `Griffin-Frontend/` → `frontend/` is safe only after action #1 (delete old `frontend/`).
- **Phase 3 argparse removal** (action #7): each attacker file has a `if __name__ == "__main__":` block with argparse. These work for manual testing but are dead code in production. Low-risk to remove; add a note to CLAUDE.md for how to test attackers manually.
- **SDK stubs**: Keep the three stub files through the hackathon. They make the SDK _look_ real in the README and demo. Mark post-hackathon work clearly.
- **Google Fonts in Griffin-Frontend/layout.tsx**: `Geist` and `Geist_Mono` are loaded from `next/font/google`. This causes a 30s SSR timeout with no internet. For local dev, a fallback font would be safer. Out of scope for this cleanup unless it causes issues.
