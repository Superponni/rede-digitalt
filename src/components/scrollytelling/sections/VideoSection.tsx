'use client'

import { useEffect, useRef } from 'react'
import { stegaClean } from 'next-sanity'
import { gsap } from '@/lib/gsap-config'

interface VideoSectionProps {
  data: {
    url?: string
    video?: { asset: { _ref: string; url?: string } }
    caption?: string
    autoplay?: boolean
    layout?: 'fullWidth' | 'contained'
    backgroundColor?: string
  }
  index: number
}

export function VideoSection({ data }: VideoSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    // Autostart kun når redaktøren har bedt om det (data.autoplay). Før ble
    // play() kalt på ALLE videoer ved 50 % synlighet — også de med lyd og
    // kontroller — som nettleseren blokkerer (uhåndtert promise-rejection) og i
    // verste fall startet uventet avspilling med lyd.
    const video = videoRef.current
    if (video && data.autoplay) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        // Redusert bevegelse: ikke autostart — gi brukeren kontroller i stedet.
        video.controls = true
      } else {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) video.play().catch(() => {})
            else video.pause()
          },
          { threshold: 0.5 },
        )
        observer.observe(video)
        return () => {
          observer.disconnect()
          mm.revert()
        }
      }
    }

    return () => mm.revert()
  }, [data.autoplay])

  const isFullWidth = stegaClean(data.layout) === 'fullWidth'
  const isYouTube = data.url?.includes('youtube') || data.url?.includes('youtu.be')
  const isVimeo = data.url?.includes('vimeo')

  // Extract YouTube/Vimeo embed ID
  let embedUrl: string | null = null
  if (isYouTube && data.url) {
    const id = data.url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1]
    if (id) embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0`
  } else if (isVimeo && data.url) {
    const id = data.url.match(/vimeo\.com\/(\d+)/)?.[1]
    if (id) embedUrl = `https://player.vimeo.com/video/${id}`
  }

  return (
    <section
      ref={sectionRef}
      className={`py-16 ${isFullWidth ? '' : 'px-6'}`}
      style={{ backgroundColor: data.backgroundColor || '#003865' }}
    >
      <div className={isFullWidth ? '' : 'mx-auto max-w-4xl'}>
        {embedUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <iframe
              src={embedUrl}
              title={data.caption || 'Video'}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted={data.autoplay}
              playsInline
              loop={data.autoplay}
              controls={!data.autoplay}
              preload="metadata"
            >
              {data.url && <source src={data.url} />}
            </video>
          </div>
        )}
        {data.caption && (
          <p className="mt-3 text-center text-sm text-white/50">{data.caption}</p>
        )}
      </div>
    </section>
  )
}
