"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Volume2Icon } from "lucide-react"

interface BriefingPlayerProps {
  briefingUrl: string
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

const SPEEDS = [1, 1.25, 1.5] as const

export function BriefingPlayer({ briefingUrl }: BriefingPlayerProps) {
  const audioRef         = useRef<HTMLAudioElement | null>(null)
  const generatingTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      <div className="briefing-player w-full bg-[#141414] border border-[#262626] rounded p-4">
        <p className="font-mono text-[13px] text-[#525252] text-center">
          Audio briefing unavailable
        </p>
      </div>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="briefing-player w-full bg-[#141414] border border-[#262626] rounded">
      <div className="flex items-center p-4 gap-0">

        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          className="shrink-0 w-10 h-10 rounded-full border border-[#F5F5F5] flex items-center justify-center text-[#F5F5F5] hover:bg-[#1F1F1F] transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          ) : isPlaying ? (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="3" height="12" rx="1"/>
              <rect x="10" y="2" width="3" height="12" rx="1"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 translate-x-0.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 3l10 5-10 5V3z"/>
            </svg>
          )}
        </button>

        {/* Divider */}
        <div className="w-px bg-[#262626] self-stretch mx-4"/>

        {/* Center */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#525252] mb-1.5">
            Audio Briefing
          </p>
          <p className="font-mono text-[13px] text-[#F5F5F5] tabular-nums mb-2">
            {fmt(currentTime)}{" "}
            <span className="text-[#525252]">/ {duration > 0 ? fmt(duration) : "--:--"}</span>
          </p>

          {/* Scrubber */}
          <div className="relative h-[3px] bg-[#262626] rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-[#F5F5F5] rounded-full pointer-events-none transition-all"
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
            <p className="font-mono text-[11px] text-[#525252] mt-1.5 animate-pulse">
              Generating briefing…
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-[#262626] self-stretch mx-4"/>

        {/* Speed + volume */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={cycleSpeed}
            className="font-mono text-[12px] text-[#525252] hover:text-[#A3A3A3] transition-colors w-10 text-center"
            aria-label="Change playback speed"
          >
            {speed}x
          </button>
          <Volume2Icon className="w-4 h-4 text-[#525252]"/>
        </div>

      </div>
    </div>
  )
}
