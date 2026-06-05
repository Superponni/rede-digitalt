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

    // IntersectionObserver for play/pause
    if (videoRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            videoRef.current?.play()
          } else {
            videoRef.current?.pause()
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(videoRef.current)
      return () => {
        observer.disconnect()
        mm.revert()
      }
    }

    return () => mm.revert()
  }, [])

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
              loop
              controls={!data.autoplay}
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
