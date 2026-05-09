import { ParticleField } from "./particle-field"

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden">
      {/* ── Static grid background ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 30%, black 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 30%, black 55%, transparent 100%)",
        }}
      />

      {/* ── Animated particle network ── */}
      <ParticleField />

      {/* ── Vignette ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 30%, transparent 60%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  )
}
