'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'

interface ArticleHeroImageProps {
  src: string
  alt: string
  /** Bildets egne dimensjoner — bevarer originalformatet (ingen beskjæring). */
  width: number
  height: number
  className?: string
  sizes?: string
  priority?: boolean
}

/**
 * Hovedbilde for standard-artikler. Beholder bildets ORIGINALFORMAT i alle
 * topp-oppsett (rendres med egne dimensjoner, ingen object-cover-beskjæring) og
 * får et mykt scroll-reveal. Respekterer redusert bevegelse.
 */
export function ArticleHeroImage({
  src,
  alt,
  width,
  height,
  className,
  sizes = '100vw',
  priority,
}: ArticleHeroImageProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        scale: 1.04,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ''}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full"
        sizes={sizes}
        priority={priority}
      />
    </div>
  )
}
