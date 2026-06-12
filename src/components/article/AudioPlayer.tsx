'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface AudioPlayerProps {
  src: string
  theme?: 'light' | 'dark'
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioPlayer({ src, theme = 'dark' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const light = theme === 'light'

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration)
    const onEnded = () => { setPlaying(false); setCurrentTime(0) }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
      setExpanded(true)
    }
    setPlaying(!playing)
  }, [playing])

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = progressRef.current
    if (!audio || !bar || !duration) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * duration
  }, [duration])

  // Tastaturspoling: piltaster ±5 s, Home/End til start/slutt. Gjør spolefeltet
  // betjenbart uten mus (det er ellers en ren klikk-div).
  const onSeekKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = audio.currentTime + 5
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = audio.currentTime - 5
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = duration
    if (next === null) return
    e.preventDefault()
    audio.currentTime = Math.max(0, Math.min(duration, next))
  }, [duration])

  const hasDuration = Number.isFinite(duration) && duration > 0
  const progress = hasDuration ? (currentTime / duration) * 100 : 0

  return (
    <div className={`rounded-xl transition-all duration-300 ${
      light
        ? 'bg-navy/[0.06]'
        : 'bg-white/[0.06]'
    }`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Collapsed: play button + label */}
      <button
        onClick={togglePlay}
        className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
          light ? 'text-navy/70 hover:text-navy' : 'text-white/70 hover:text-white'
        }`}
      >
        {/* Play/pause icon */}
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          light ? 'bg-navy/10' : 'bg-white/10'
        }`}>
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-3.5 w-3.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>

        <span className="font-heading text-[11px] uppercase tracking-[0.2em]">
          {playing ? 'Spiller av' : 'Hør artikkelen'}
        </span>

        {hasDuration && !expanded && (
          <span className={`ml-auto font-heading text-[10px] tabular-nums ${
            light ? 'text-navy/30' : 'text-white/30'
          }`}>
            {formatTime(duration)}
          </span>
        )}
      </button>

      {/* Expanded: progress bar + time */}
      {expanded && (
        <div className="px-4 pb-3">
          {/* Progress bar — slider med tastatur (piltaster/Home/End) */}
          <div
            ref={progressRef}
            onClick={seek}
            onKeyDown={onSeekKey}
            role="slider"
            tabIndex={0}
            aria-label="Spol i lydsporet"
            aria-valuemin={0}
            aria-valuemax={hasDuration ? Math.round(duration) : 0}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} av ${formatTime(duration)}`}
            className={`h-1 w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              light ? 'bg-navy/10 focus-visible:ring-navy/40 focus-visible:ring-offset-mint' : 'bg-white/10 focus-visible:ring-white/50 focus-visible:ring-offset-navy'
            }`}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-100 ${
                light ? 'bg-navy/40' : 'bg-white/40'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time display */}
          <div className={`mt-1.5 flex justify-between font-heading text-[10px] tabular-nums ${
            light ? 'text-navy/30' : 'text-white/30'
          }`}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
