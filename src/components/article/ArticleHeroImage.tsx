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
  /**
   * Når satt (f.eks. "3/4") fyller bildet en fast ramme i dette formatet med
   * `object-cover`. Brukes til side-oppsettet der vi vil ha en stående ramme
   * uansett om originalen er liggende. `src` må da være fokus-bevisst beskjært
   * (se coverSrc), så motivet treffer riktig. Uten `aspect` beholdes
   * originalformatet.
   */
  aspect?: string
  /**
   * Fyll forelderen (som må være `relative` med en fast/begrenset høyde) med
   * `object-cover`. Brukes til heldekkende toppbilde som er høydebegrenset, så
   * tittelen alltid er synlig. Krever som regel `focal` for riktig motiv.
   */
  cover?: boolean
  /** CSS object-position (fra fokuspunktet) for cover/aspect-modus. */
  focal?: string
}

/**
 * Hovedbilde for standard-artikler. Uten `aspect` beholder bildet ORIGINALFORMAT
 * (rendres med egne dimensjoner, ingen object-cover-beskjæring). Med `aspect`
 * fyller det en fast ramme. Får et mykt scroll-reveal. Respekterer redusert bevegelse.
 */
export function ArticleHeroImage({
  src,
  alt,
  width,
  height,
  className,
  sizes = '100vw',
  priority,
  aspect,
  cover,
  focal,
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

  if (aspect || cover) {
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${className ?? ''}`}
        style={aspect ? { aspectRatio: aspect } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          style={focal ? { objectPosition: focal } : undefined}
          sizes={sizes}
          priority={priority}
        />
      </div>
    )
  }

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
