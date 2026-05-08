"use client"

import { useEffect, useRef } from "react"

// Icosahedron vertices (normalized)
const PHI = (1 + Math.sqrt(5)) / 2
const vertices = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
].map(v => {
  const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)
  return v.map(c => c / len)
})

// Edges connecting vertices
const edges = [
  [0,11],[0,5],[0,1],[0,7],[0,10],
  [1,5],[1,9],[1,7],[1,8],
  [2,11],[2,4],[2,3],[2,6],[2,10],
  [3,4],[3,9],[3,6],[3,8],
  [4,5],[4,9],[4,11],
  [5,9],[5,11],
  [6,7],[6,8],[6,10],
  [7,8],[7,10],
  [8,9],[10,11]
]

export function WireframeIcosahedron() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef({ x: 0, y: 0 })
  const highlightRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 500
    canvas.width = size
    canvas.height = size
    const cx = size / 2
    const cy = size / 2
    const scale = size * 0.35

    let animationId: number

    const rotateX = (v: number[], angle: number) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos]
    }

    const rotateY = (v: number[], angle: number) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos]
    }

    const project = (v: number[]) => {
      const z = v[2] + 3
      const perspective = 2 / z
      return [cx + v[0] * scale * perspective, cy + v[1] * scale * perspective]
    }

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // Slowly rotate
      rotationRef.current.x += 0.003
      rotationRef.current.y += 0.002

      // Update highlight (drifts around edges)
      highlightRef.current = (highlightRef.current + 0.02) % edges.length

      // Transform vertices
      const transformed = vertices.map(v => {
        let tv = rotateX(v, rotationRef.current.x)
        tv = rotateY(tv, rotationRef.current.y)
        return tv
      })

      // Project and draw edges
      edges.forEach((edge, i) => {
        const p1 = project(transformed[edge[0]])
        const p2 = project(transformed[edge[1]])

        // Rare red highlight on one edge at a time
        const highlightDist = Math.abs(i - Math.floor(highlightRef.current))
        const isHighlighted = highlightDist < 1

        ctx.beginPath()
        ctx.moveTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        
        if (isHighlighted) {
          ctx.strokeStyle = "rgba(255, 51, 68, 0.15)"
          ctx.lineWidth = 1.5
        } else {
          ctx.strokeStyle = "#262626"
          ctx.lineWidth = 1
        }
        ctx.stroke()
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-30 pointer-events-none"
      aria-hidden="true"
    />
  )
}
