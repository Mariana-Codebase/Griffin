"use client"

interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  className?: string
}

export function MiniSparkline({
  values,
  width = 80,
  height = 22,
  stroke = "#FF3344",
  fill = "rgba(255,51,68,0.12)",
  className,
}: SparklineProps) {
  if (values.length === 0) {
    return (
      <svg width={width} height={height} className={className} aria-hidden>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#262626"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      </svg>
    )
  }

  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const stepX = values.length > 1 ? width / (values.length - 1) : width

  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 2) - 1
    return [x, y] as const
  })

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  const fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <path d={fillPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
