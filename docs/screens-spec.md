# Screens Specification

Author: Ana  
Source: `Desktop/Hackaton/screens-spec.md.pdf`

Full rationale lives in the PDF. This file is a quick reference for Claude sessions.

---

## Screen 1 — Landing (`/`)

The calm. One decision. Empty page with authority.

- Minimal nav: logo + Docs only, no Sign Up
- Hero: short specific headline + subcopy explaining the five-AI offensive team
- Large URL input (placeholder: `https://your-agent.xyz/api`) + "Run Audit" button
- Input states: empty → typing → validating (microspinner) → error → success (redirect to /audit/{id})
- Below fold: "How it works" (3 steps) or live stats (agents tested / vulns found / SOL recovered)
- Consumes: `POST /audits`, optionally `GET /audits/recent`

## Screen 2 — Live Audit Dashboard (`/audit/[id]`)

The chaos. THE star screen. Goes in the video.

Three zones:
1. **Status bar** — target name + pulsing indicator + SOL balance (large mono, odometer animation on drop) + elapsed time + attempt counter
2. **Five attacker cards** — each has name, glyph, status (idle/attacking/succeeded/failed), current attempt text (typewriter), attempt counter, progress ring. Cards breathe while attacking.
3. **Bottom** — left 2/3: terminal event log (attempt=gray, success=accent bold, failure=dark, info=italic). Right 1/3: on-chain tx panel (hash + SOL + Solscan link, hover expands).

**Exploit moment (800ms–1.5s, coordinated):**
1. Card lights up with success accent
2. Brief screen flash
3. SOL balance ticks down (odometer)
4. Tx card slides into panel
5. Event line enters log with bold success color
6. (Optional) subtle "thud" sound

- Consumes: `GET /audits/{id}/state` polling every 1–1.5s (polling > WebSocket for hackathon)

## Screen 3 — Audit Report (`/audit/[id]/report`)

The verdict. Document format, not dashboard. Max-width 720–780px.

- Header: title + target + date/duration + security score (0–100) with qualitative label + Download PDF / Share
- Executive summary: 2–3 paragraphs, large editorial type, plain language
- Vulnerability list: severity tag (color) + technical title + description + **exact exploit prompt in code block** + impact (SOL moved + Solscan link) + recommendation + attribution (which attacker, how many attempts)
- Footer: stats summary + "Run another audit" CTA

- Consumes: `GET /audits/{id}/report` (once, static)

---

## Design tokens

```
--bg-base:      #0A0A0A
--bg-surface:   #141414
--bg-elevated:  #1F1F1F
--text-primary: #F5F5F5
--text-secondary:#A3A3A3
--accent-red:   #FF3344
--accent-amber: #FFB020
--accent-mint:  #4ADE80
--accent-violet:#A78BFA
--border:       #262626
```

Fonts: Geist (display) + Geist Mono / JetBrains Mono (terminal/code)  
References: Linear, Vercel, Arc, Stripe Press, Trail of Bits reports  
Anti-references: Matrix green, hexagons, hooded hackers
