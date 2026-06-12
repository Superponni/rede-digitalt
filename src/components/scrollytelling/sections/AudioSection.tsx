'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'
import { spotifyEmbedUrl } from '@/lib/spotify'

interface AudioSectionProps {
  data: {
    spotifyUrl?: string
    title?: string
    description?: string
    backgroundColor?: string
  }
  index: number
}

export function AudioSection({ data }: AudioSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(sectionRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    return () => mm.revert()
  }, [])

  const embedUrl = spotifyEmbedUrl(data.spotifyUrl)

  return (
    <section
      ref={sectionRef}
      className="px-6 py-16"
      style={{ backgroundColor: data.backgroundColor || '#003865' }}
    >
      <div className="mx-auto max-w-2xl">
        {data.title && (
          <h3 className="mb-2 font-display text-2xl text-white">{data.title}</h3>
        )}
        {data.description && (
          <p className="mb-6 text-base text-white/60">{data.description}</p>
        )}
        {embedUrl && (
          <iframe
            src={embedUrl}
            title={data.title || 'Lydspiller'}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />
        )}
      </div>
    </section>
  )
}
