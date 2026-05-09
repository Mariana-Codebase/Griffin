"use client"

import { useEffect, useState } from "react"
import type { Vulnerability } from "@/lib/types"
import { SeverityDot, type Severity } from "./severity-badge"

interface Props {
  vulnerabilities: Vulnerability[]
  anchorBase: string
}

export function FindingsTOC({ vulnerabilities, anchorBase }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const elements = vulnerabilities
      .map((_, i) => document.getElementById(`${anchorBase}-${i}`))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          const idx = elements.indexOf(visible[0].target as HTMLElement)
          if (idx !== -1) setActiveIdx(idx)
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [vulnerabilities, anchorBase])

  return (
    <nav className="sticky top-20 hidden xl:block print:hidden" aria-label="Findings navigation">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3F3F3F] mb-4">
        Findings · {vulnerabilities.length}
      </p>
      <ul className="space-y-1 border-l border-[#262626]">
        {vulnerabilities.map((v, i) => {
          const active = i === activeIdx
          return (
            <li key={v.id}>
              <a
                href={`#${anchorBase}-${i}`}
                className={`flex items-center gap-3 pl-4 py-2 font-mono text-[12px] -ml-px border-l-2 transition-colors ${
                  active
                    ? "border-[#FF3344] text-[#F5F5F5]"
                    : "border-transparent text-[#525252] hover:text-[#A3A3A3]"
                }`}
              >
                <span className="tabular-nums text-[10px] text-[#3F3F3F]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <SeverityDot severity={v.severity as Severity} />
                <span className="line-clamp-1 max-w-[180px]">{v.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
