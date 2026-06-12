'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface HeroSectionProps {
  data: {
    image?: { asset: { _ref: string }; alt?: string; hotspot?: { x: number; y: number } }
    title?: string
    subtitle?: string
    backgroundColor?: string
    author?: string
    photographer?: string
    date?: string
    audioFileUrl?: string
  }
  index: number
}

function HeroAudioButton({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }, [playing])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => setPlaying(false)
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [])

  return (
    <button
      onClick={toggle}
      className="mt-6 flex cursor-pointer items-center gap-2.5 rounded-sm bg-white/[0.14] px-4 py-2 transition-colors hover:bg-white/[0.22]"
    >
      <audio ref={audioRef} src={src} preload="none" />
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
        {playing ? (
          <svg viewBox="0 0 24 24" fill="white" className="h-2.5 w-2.5">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="white" className="ml-0.5 h-2.5 w-2.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </span>
      <span className="font-heading text-[11px] uppercase tracking-[0.2em] text-white/70">
        {playing ? 'Spiller' : 'Hør artikkelen'}
      </span>
    </button>
  )
}

export function HeroSection({ data }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Pin the hero — content scrolls OVER it
      if (sectionRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        })
      }

      // Title reveal
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
        })
      }

      // Meta reveal
      if (metaRef.current) {
        gsap.from(metaRef.current, {
          y: 20,
          opacity: 0,
          duration: 1,
          delay: 0.4,
          ease: 'power3.out',
        })
      }
    })

    return () => mm.revert()
  }, [])

  // Use hotspot for object-position if available
  const hotspot = data.image?.hotspot
  const objectPosition = hotspot
    ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
    : 'center 30%'

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen w-full overflow-hidden"
      style={{ backgroundColor: data.backgroundColor || '#000' }}
    >
      {/* Background image */}
      {data.image?.asset && (
        <Image
          src={urlFor(data.image).width(1920).height(1080).fit('crop').url()}
          alt={data.image.alt || ''}
          fill
          className="object-cover"
          style={{ objectPosition }}
          sizes="100vw"
          priority
        />
      )}

      {/* Gradient overlays — strong bottom for title legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

      {/* Content — centered at bottom */}
      <div className="relative z-10 flex w-full flex-col items-center justify-end px-6 pb-16 text-center lg:px-16 lg:pb-20">
        {data.title && (
          <h1
            ref={titleRef}
            className="max-w-5xl font-display text-4xl leading-[1.05] text-white md:text-5xl lg:text-[4.5rem] xl:text-[5.5rem]"
          >
            {data.title}
          </h1>
        )}

        <div ref={metaRef} className="flex flex-col items-center">
          {data.subtitle && (
            <p className="mt-4 max-w-xl text-center text-base leading-relaxed text-white/60 lg:text-lg">
              {data.subtitle}
            </p>
          )}
          {(data.author || data.photographer || data.date) && (
            <p className="mt-6 font-heading text-[10px] uppercase tracking-[0.4em] text-white/40">
              {data.author && data.photographer && data.author === data.photographer ? (
                <span>Tekst &amp; Foto: {data.author}</span>
              ) : (
                <>
                  {data.author && <span>Tekst: {data.author}</span>}
                  {data.author && data.photographer && <span className="mx-2">&middot;</span>}
                  {data.photographer && <span>Foto: {data.photographer}</span>}
                </>
              )}
              {(data.author || data.photographer) && data.date && <span className="mx-2">&middot;</span>}
              {data.date && <span>{data.date}</span>}
            </p>
          )}
          {data.audioFileUrl && <HeroAudioButton src={data.audioFileUrl} />}
        </div>
      </div>
    </section>
  )
}
