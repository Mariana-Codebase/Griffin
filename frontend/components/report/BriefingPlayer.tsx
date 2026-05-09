"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Pause, Play, Volume2 } from "lucide-react"

interface BriefingPlayerProps {
  briefingUrl: string
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

const SPEEDS = [1, 1.25, 1.5] as const

/**
 * Decorative static waveform — a fixed pseudo-random shape rendered as bars.
 * Not analysing the actual audio; it's just visual identity for the player.
 */
function Waveform({ progress, playing }: { progress: number; playing: boolean }) {
  const heights = [
    0.4, 0.7, 0.55, 0.85, 0.4, 0.95, 0.6, 0.45, 0.7, 0.85,
    0.55, 0.3, 0.75, 0.9, 0.5, 0.65, 0.8, 0.4, 0.95, 0.55,
    0.6, 0.35, 0.7, 0.85, 0.45, 0.55, 0.9, 0.5, 0.4, 0.75,
  ]
  const playedCount = Math.round((progress / 100) * heights.length)

  return (
    <div className="flex items-end gap-[2px] h-8" aria-hidden>
      {heights.map((h, i) => {
        const played = i < playedCount
        return (
          <span
            key={i}
            className={`w-[2px] rounded-full ${
              played ? "bg-[#FF3344]" : "bg-[#262626]"
            } ${playing && !played && i === playedCount ? "animate-pulse" : ""}`}
            style={{ height: `${h * 100}%` }}
          />
        )
      })}
    </div>
  )
}

export function BriefingPlayer({ briefingUrl }: BriefingPlayerProps) {
  const audioRef        = useRef<HTMLAudioElement | null>(null)
  const generatingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPlaying,      setIsPlaying]      = useState(false)
  const [currentTime,    setCurrentTime]    = useState(0)
  const [duration,       setDuration]       = useState(0)
  const [isLoading,      setIsLoading]      = useState(false)
  const [showGenerating, setShowGenerating] = useState(false)
  const [hasError,       setHasError]       = useState(false)
  const [speedIdx,       setSpeedIdx]       = useState(0)

  const speed = SPEEDS[speedIdx]

  const setupAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current
    const audio = new Audio(briefingUrl)
    audioRef.current = audio

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration))
    audio.addEventListener("timeupdate",     () => setCurrentTime(audio.currentTime))
    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
    })
    audio.addEventListener("error", () => {
      setIsLoading(false)
      setShowGenerating(false)
      setHasError(true)
      if (generatingTimer.current) clearTimeout(generatingTimer.current)
    })
    return audio
  }, [briefingUrl])

  const handlePlayPause = async () => {
    if (hasError) return
    const audio = setupAudio()

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    setIsLoading(true)
    generatingTimer.current = setTimeout(() => setShowGenerating(true), 2000)

    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
      if (generatingTimer.current) clearTimeout(generatingTimer.current)
      setShowGenerating(false)
    }
  }

  const handleScrubStart = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value)
    setCurrentTime(t)
    if (audioRef.current) audioRef.current.currentTime = t
  }

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length
    setSpeedIdx(next)
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next]
  }

  useEffect(() => () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (generatingTimer.current) clearTimeout(generatingTimer.current)
  }, [])

  if (hasError) {
    return (
      <div className="briefing-player w-full bg-[#0F0F0F] border border-[#262626] p-4">
        <p className="font-mono text-[12px] text-[#525252] text-center">
          Audio briefing unavailable
        </p>
      </div>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="briefing-player w-full bg-[#0F0F0F] border border-[#262626]">
      {/* Top strip: kicker + waveform */}
      <div className="flex items-center justify-between border-b border-[#262626] px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#525252]">
          Audio Briefing
        </p>
        <Waveform progress={progress} playing={isPlaying} />
      </div>

      {/* Main row */}
      <div className="flex items-center gap-5 p-5">
        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          className="shrink-0 w-9 h-9 rounded-full border border-[#262626] flex items-center justify-center text-[#F5F5F5] hover:border-[#FF3344] hover:text-[#FF3344] transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 translate-x-[1px]" />
          )}
        </button>

        {/* Time + scrubber */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[12px] text-[#A3A3A3] tabular-nums mb-2">
            {fmt(currentTime)}
            <span className="text-[#3F3F3F]"> / {duration > 0 ? fmt(duration) : "--:--"}</span>
          </p>
          <div className="relative h-[2px] bg-[#262626] rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-[#FF3344] rounded-full pointer-events-none"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onMouseDown={handleScrubStart}
              onTouchStart={handleScrubStart}
              onChange={handleScrub}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek"
            />
          </div>
          {showGenerating && (
            <p className="font-mono text-[10px] text-[#525252] mt-2 animate-pulse">
              Generating briefing…
            </p>
          )}
        </div>

        {/* Speed + volume */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={cycleSpeed}
            className="font-mono text-[11px] text-[#525252] hover:text-[#F5F5F5] transition-colors w-10 text-center tabular-nums"
            aria-label="Change playback speed"
          >
            {speed}×
          </button>
          <Volume2 className="w-3.5 h-3.5 text-[#525252]" />
        </div>
      </div>
    </div>
  )
}
