"use client"

import Link from "next/link"
import { ArrowLeft, Download, Headphones, Share2, Check } from "lucide-react"
import { useState } from "react"

interface Props {
  auditId: string
  onListen: () => void
  onDownload: () => void
  listening: boolean
  children: React.ReactNode
}

export function ReportShell({
  auditId,
  onListen,
  onDownload,
  listening,
  children,
}: Props) {
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      // ignore — clipboard unavailable
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-[#262626] bg-[#0A0A0A]/90 backdrop-blur-md print:hidden">
        <div className="mx-auto max-w-[860px] px-6 h-14 flex items-center justify-between">
          <Link
            href={`/audit/${auditId}`}
            className="group flex items-center gap-2 font-mono text-[12px] lowercase text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            back to dashboard
          </Link>

          <div className="flex items-center gap-1">
            <NavButton onClick={onListen} active={listening} icon={Headphones} label="briefing" />
            <NavButton
              onClick={handleShare}
              icon={shared ? Check : Share2}
              label={shared ? "copied" : "share"}
            />
            <NavButton onClick={onDownload} icon={Download} label="pdf" />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[860px] px-6 py-16 print:py-8">{children}</main>
    </div>
  )
}

function NavButton({
  onClick,
  icon: Icon,
  label,
  active,
}: {
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono text-[12px] lowercase transition-colors ${
        active
          ? "bg-[#1F1F1F] text-[#F5F5F5]"
          : "text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1F1F1F]"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}
