'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

interface GifKortProps {
  data: {
    src: string
    alt?: string
    caption?: string
    maxWidth?: number
    backgroundColor?: string
  }
  index: number
}

/**
 * Gif i et hvitt postkort — lite visuelt avbrekk/spøk. Kortet toner inn ved scroll.
 */
export function GifKort({ data }: GifKortProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const c = useScrollyColors()
  const reduced = usePrefersReducedMotion()
  const bgColor = data.backgroundColor || '#003865'

  // Gamle .gif-er er konvertert til langt lettere .mp4 (samme filnavn). Peker
  // src på en gif, spiller vi mp4-en i stedet — 90 %+ mindre data. Andre stier
  // (ekte bilde) faller tilbake til <img>.
  const videoSrc = /\.gif$/i.test(data.src || '')
    ? data.src.replace(/\.gif$/i, '.mp4')
    : null

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!sectionRef.current) return
      const card = sectionRef.current.querySelector('[data-card]')
      gsap.from(card, {
        y: 30,
        opacity: 0,
        scale: 0.96,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play none none none' },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative px-6 py-10 lg:py-14" style={{ backgroundColor: bgColor }}>
      <div
        data-card
        className="mx-auto rounded-2xl bg-white p-3"
        style={{ maxWidth: data.maxWidth || 320, boxShadow: '0 20px 50px rgba(0,32,64,0.16)' }}
      >
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay={!reduced}
            muted
            loop={!reduced}
            playsInline
            controls={reduced}
            preload="metadata"
            aria-label={data.alt || undefined}
            className="w-full rounded-xl"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.src} alt={data.alt || ''} className="w-full rounded-xl" />
        )}
        {data.caption && (
          <p className="px-2 pb-1 pt-3 text-center font-heading text-[12px] uppercase tracking-[0.18em]" style={{ color: c.muted }}>
            {data.caption}
          </p>
        )}
      </div>
    </section>
  )
}
