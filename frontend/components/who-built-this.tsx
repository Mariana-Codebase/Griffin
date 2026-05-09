"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ExternalLink } from "lucide-react"

interface FounderLink {
  href: string
  label: string
}

interface Founder {
  index: string
  name: string
  handle: string
  role: string
  scope: string
  bio: string
  tags: string[]
  links: FounderLink[]
}

const founders: Founder[] = [
  {
    index: "01",
    name: "Mariana Sinisterra",
    handle: "MarianaCodebase",
    role: "Backend · Solana · Adversarial AI",
    scope: "attackers · orchestrator · solana program · sdk",
    bio:
      "Computer Engineering student and security researcher with a background in bug bounty " +
      "hunting (HackerOne, MercadoLibre program), red teaming, and open-source contributions " +
      "to OpenClaw. Griffin is the product this background was waiting to build.",
    tags: ["Bug Bounty", "Red Teaming", "OpenClaw Contributor", "CCNAv7"],
    links: [
      { href: "https://marianacodebase.com",                  label: "marianacodebase.com" },
      { href: "https://linkedin.com/in/marianasinisterra",    label: "linkedin" },
      { href: "https://github.com/Mariana-Codebase",          label: "github" },
    ],
  },
  {
    index: "02",
    name: "Ana Sofia Suarez",
    handle: "anaarismendy",
    role: "Frontend · Design · AI Engineering",
    scope: "ui · interaction design · ai-driven product",
    bio:
      "Fullstack software engineer focused on AI-driven product development, currently building " +
      "at Inerxia. On Griffin, owns the frontend — from the Pentest Atelier visual language to " +
      "the live Mission Control dashboard and the editorial audit report.",
    tags: ["Fullstack", "AI Development", "Frontend Architecture", "@ Inerxia"],
    links: [
      { href: "https://github.com/anaarismendy", label: "github" },
      { href: "https://inerxia.co",              label: "inerxia.co" },
    ],
  },
]

function FounderCard({ founder, delay }: { founder: Founder; delay: number }) {
  return (
    <motion.div
      className="relative bg-[#0F0F0F]/70 backdrop-blur-sm border border-[#262626] p-8 md:p-10 h-full"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay }}
    >
      {/* Corner decorations */}
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#FF3344]" />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#FF3344]" />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#FF3344]" />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#FF3344]" />

      {/* Index + role */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-mono text-[11px] text-[#3F3F3F] tabular-nums">
          {founder.index}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#525252]">
          {founder.role}
        </span>
      </div>

      {/* Name + handle */}
      <h3 className="text-[24px] font-semibold tracking-[-0.015em] text-[#F5F5F5] leading-tight">
        {founder.name}
      </h3>
      <p className="font-mono text-[12px] text-[#A3A3A3] mt-1">@{founder.handle}</p>

      {/* Scope kicker */}
      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#3F3F3F]">
        {founder.scope}
      </p>

      {/* Bio */}
      <p className="mt-3 text-[14px] text-[#A3A3A3] leading-[1.7]">{founder.bio}</p>

      {/* Tags */}
      <div className="mt-6 flex flex-wrap gap-2">
        {founder.tags.map((t) => (
          <span
            key={t}
            className="inline-block px-2.5 py-1 border border-[#262626] font-mono text-[11px] text-[#A3A3A3]"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="mt-6 pt-5 border-t border-[#262626] flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px]">
        {founder.links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-[#A78BFA] hover:text-[#C4B5FD] transition-colors"
          >
            {l.label}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </motion.div>
  )
}

export function WhoBuiltThis() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="mx-auto max-w-[1100px]">
        {/* Section heading */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="flex-1 h-px bg-[#262626]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#525252]">
            Who Built This
          </span>
          <div className="flex-1 h-px bg-[#262626]" />
        </motion.div>

        <motion.p
          className="text-center text-[#525252] font-mono text-[12px] uppercase tracking-[0.18em] mb-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          Two founders · equal partnership
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {founders.map((f, i) => (
            <FounderCard key={f.handle} founder={f} delay={0.15 + i * 0.12} />
          ))}
        </div>
      </div>
    </section>
  )
}
