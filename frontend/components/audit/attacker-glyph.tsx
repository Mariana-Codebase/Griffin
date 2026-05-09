"use client"

import { motion } from "framer-motion"

type GlyphId =
  | "social_engineer"
  | "instruction_hijacker"
  | "context_poisoner"
  | "boundary_probe"
  | "polyglot"

interface Props {
  id: string
  active: boolean
  triumphant: boolean
  size?: number
}

const PATHS: Record<GlyphId, React.ReactElement> = {
  social_engineer: (
    <>
      <circle cx="14" cy="14" r="3" />
      <circle cx="14" cy="14" r="7" opacity="0.55" />
      <circle cx="14" cy="14" r="11" opacity="0.25" />
      <line x1="14" y1="3" x2="14" y2="6" />
      <line x1="14" y1="22" x2="14" y2="25" />
      <line x1="3" y1="14" x2="6" y2="14" />
      <line x1="22" y1="14" x2="25" y2="14" />
    </>
  ),
  instruction_hijacker: (
    <>
      <path d="M5 9 L14 4 L23 9 L23 19 L14 24 L5 19 Z" />
      <path d="M9 11 L14 8 L19 11 L19 17 L14 20 L9 17 Z" opacity="0.5" />
      <line x1="14" y1="4" x2="14" y2="24" opacity="0.35" />
    </>
  ),
  context_poisoner: (
    <>
      <path d="M5 14 Q9 6 14 14 T23 14" />
      <path d="M5 18 Q9 10 14 18 T23 18" opacity="0.6" />
      <path d="M5 10 Q9 2 14 10 T23 10" opacity="0.35" />
      <circle cx="14" cy="14" r="1.5" />
    </>
  ),
  boundary_probe: (
    <>
      <rect x="4" y="4" width="20" height="20" />
      <line x1="4" y1="4" x2="24" y2="24" opacity="0.45" />
      <line x1="24" y1="4" x2="4" y2="24" opacity="0.45" />
      <circle cx="14" cy="14" r="2" />
    </>
  ),
  polyglot: (
    <>
      <path d="M5 8 H23 M5 14 H23 M5 20 H23" />
      <path d="M9 4 L9 24 M14 4 L14 24 M19 4 L19 24" opacity="0.35" />
      <circle cx="14" cy="14" r="2.5" />
    </>
  ),
}

export function AttackerGlyph({ id, active, triumphant, size = 28 }: Props) {
  const glyph = PATHS[id as GlyphId] ?? PATHS.boundary_probe
  const stroke = triumphant ? "#FF3344" : active ? "#F5F5F5" : "#525252"

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke={stroke}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={
        active && !triumphant
          ? { rotate: [0, 1.5, -1.5, 0], opacity: [0.85, 1, 0.85] }
          : triumphant
          ? { scale: [1, 1.12, 1] }
          : { rotate: 0, opacity: 0.85 }
      }
      transition={
        active && !triumphant
          ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.5 }
      }
      style={{ transition: "stroke 0.3s ease" }}
    >
      {glyph}
    </motion.svg>
  )
}
