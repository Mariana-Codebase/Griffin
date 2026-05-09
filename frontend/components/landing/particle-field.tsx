"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hue: "white" | "red"
  base: number
}

interface Props {
  density?: number
  connectDistance?: number
}

/**
 * Constellation-style particle network.
 *  - small dots drift slowly across the viewport
 *  - dots within `connectDistance` get connected with a hairline
 *  - cursor exerts a subtle repulsion field
 *  - ~5% of dots are tinted red for accent
 *
 * Honors prefers-reduced-motion: emits a static frame, no rAF loop.
 */
export function ParticleField({
  density = 0.00009,
  connectDistance = 130,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let particles: Particle[] = []
    const cursor = { x: -9999, y: -9999, active: false }
    let raf = 0
    let lastT = performance.now()

    const setSize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      const count = Math.max(40, Math.min(180, Math.floor(width * height * density)))
      particles = Array.from({ length: count }, () => {
        const isRed = Math.random() < 0.06
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 0.6 + Math.random() * 1.2,
          hue: isRed ? "red" : "white",
          base: 0.35 + Math.random() * 0.4,
        } as Particle
      })
    }

    const onMove = (e: MouseEvent) => {
      cursor.x = e.clientX
      cursor.y = e.clientY
      cursor.active = true
    }
    const onLeave = () => {
      cursor.active = false
      cursor.x = -9999
      cursor.y = -9999
    }
    const onResize = () => {
      setSize()
      seed()
    }

    setSize()
    seed()
    window.addEventListener("resize", onResize)
    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseout", onLeave)

    const drawFrame = (now: number) => {
      const dt = Math.min(40, now - lastT) / 16.6 // normalised to ~60fps step
      lastT = now

      ctx.clearRect(0, 0, width, height)

      // ── Update positions ──
      for (const p of particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt

        // Cursor repulsion (only inside ~140px radius)
        if (cursor.active) {
          const dx = p.x - cursor.x
          const dy = p.y - cursor.y
          const d2 = dx * dx + dy * dy
          if (d2 < 140 * 140 && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const force = (1 - d / 140) * 0.7
            p.x += (dx / d) * force
            p.y += (dy / d) * force
          }
        }

        // Wrap edges
        if (p.x < -10) p.x = width + 10
        else if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        else if (p.y > height + 10) p.y = -10
      }

      // ── Draw connections (cheap O(n²) but n is bounded) ──
      ctx.lineWidth = 0.6
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > connectDistance * connectDistance) continue
          const d = Math.sqrt(d2)
          const t = 1 - d / connectDistance
          const eitherRed = a.hue === "red" || b.hue === "red"
          ctx.strokeStyle = eitherRed
            ? `rgba(255, 51, 68, ${t * 0.18})`
            : `rgba(245, 245, 245, ${t * 0.07})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // ── Draw points ──
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle =
          p.hue === "red"
            ? `rgba(255, 51, 68, ${p.base})`
            : `rgba(245, 245, 245, ${p.base * 0.55})`
        ctx.fill()
      }

      raf = requestAnimationFrame(drawFrame)
    }

    if (reduceMotion) {
      // Static single render
      drawFrame(performance.now())
      cancelAnimationFrame(raf)
    } else {
      raf = requestAnimationFrame(drawFrame)
    }

    // Pause when tab is not visible
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (!reduceMotion) {
        lastT = performance.now()
        raf = requestAnimationFrame(drawFrame)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseout", onLeave)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [density, connectDistance])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        // Top-fade so the canvas doesn't compete with the nav
        maskImage:
          "radial-gradient(ellipse 95% 75% at 50% 45%, black 55%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 95% 75% at 50% 45%, black 55%, transparent 100%)",
      }}
    />
  )
}
