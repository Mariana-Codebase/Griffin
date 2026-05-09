"use client"

import { motion } from "framer-motion"

interface Props {
  score: number
  riskLabel: string
  size?: number
}

function scoreColor(score: number): string {
  if (score < 30) return "#FF3344"
  if (score < 60) return "#FFB020"
  return "#4ADE80"
}

/**
 * 10×10 dot-matrix gauge. The first (100 - score) dots are filled with the
 * score color (representing the *risk surface*); the rest stay neutral.
 *
 * A risky score (low number) lights up MORE dots — visually heavier.
 */
export function ScoreGauge({ score, riskLabel, size = 220 }: Props) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)))
  const litCount = 100 - safeScore
  const color = scoreColor(safeScore)

  const cellSize = size / 10
  const dotR = cellSize * 0.28

  const cells = Array.from({ length: 100 }, (_, i) => {
    const row = Math.floor(i / 10)
    const col = i % 10
    const cx = col * cellSize + cellSize / 2
    const cy = row * cellSize + cellSize / 2
    // We light dots column-by-column from the left so the matrix feels like
    // a "filling up risk meter" rather than random pointillism.
    const lit = i < litCount
    return { i, cx, cy, lit }
  })

  return (
    <div className="flex flex-col items-center print:break-inside-avoid">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Security score ${safeScore} of 100`}>
        {cells.map(({ i, cx, cy, lit }) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={dotR}
            fill={lit ? color : "#262626"}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: lit ? 1 : 0.55, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.004, ease: "easeOut" }}
          />
        ))}
      </svg>

      <div className="mt-6 flex items-baseline gap-1">
        <span
          className="font-mono text-[88px] font-semibold leading-none tabular-nums"
          style={{ color }}
        >
          {safeScore}
        </span>
        <span className="font-mono text-[36px] text-[#3F3F3F]">/100</span>
      </div>

      <p
        className="mt-3 font-mono text-[12px] uppercase tracking-[0.22em]"
        style={{ color }}
      >
        {riskLabel}
      </p>
    </div>
  )
}
