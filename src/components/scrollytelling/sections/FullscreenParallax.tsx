'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { gsap } from '@/lib/gsap-config'
import { PortableText } from '@portabletext/react'
import { stegaClean } from 'next-sanity'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FullscreenParallaxProps {
  data: {
    backgroundImage?: { asset: { _ref: string }; alt?: string; caption?: string; photographer?: string; hotspot?: { x: number; y: number } }
    overlayText?: any[]
    overlayPosition?: 'left' | 'center' | 'right'
    darkenOverlay?: number
    backgroundColor?: string
  }
  index: number
}

/**
 * Check if text is short enough to be a title (under ~60 chars, single block)
 */
function isShortTitle(blocks: any[]): boolean {
  if (!blocks || blocks.length !== 1) return false
  // Rens stega-tegn før lengdemåling — usynlige tegn ville blåst opp lengden.
  const text = stegaClean(blocks[0].children?.map((c: any) => c.text)?.join('')) || ''
  return text.length < 80
}

export function FullscreenParallax({ data }: FullscreenParallaxProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Parallax on background image
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      // Fade in overlay text
      if (textRef.current) {
        gsap.from(textRef.current, {
          y: 40,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    })

    return () => mm.revert()
  }, [])

  // Mørklegging tvinges kun når det faktisk ligger tekst oppå (lesbarhet).
  // Uten overlay-tekst er seksjonen et rent, pustende helbilde — ingen slør.
  const hasOverlay = !!(data.overlayText && data.overlayText.length > 0)
  const rawDarken = data.darkenOverlay ?? (hasOverlay ? 40 : 0)
  const darken = hasOverlay ? Math.max(rawDarken, 50) : rawDarken

  // Use hotspot for object-position if available
  const hotspot = data.backgroundImage?.hotspot
  const objectPosition = hotspot
    ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
    : 'center 30%'

  const shortTitle = isShortTitle(data.overlayText || [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: data.backgroundColor || undefined }}
    >
      {/* Parallax image — taller than viewport */}
      {data.backgroundImage?.asset && (
        <div ref={imageRef} className="absolute inset-x-0 -top-[12%] h-[130%]">
          <Image
            src={urlFor(data.backgroundImage).width(1920).height(1400).fit('crop').url()}
            alt={data.backgroundImage.alt || ''}
            fill
            className="object-cover"
            style={{ objectPosition }}
            sizes="100vw"
          />
        </div>
      )}

      {/* Mørklegging kun når det ligger tekst oppå */}
      {hasOverlay && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${darken / 100})` }}
          />
        </>
      )}

      {/* Overlay text */}
      {data.overlayText && data.overlayText.length > 0 && (
        <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-20 lg:px-16 lg:pb-28">
          <div
            ref={textRef}
            className={shortTitle ? 'mx-auto max-w-5xl text-center' : 'mx-auto max-w-[680px]'}
          >
            <PortableText
              value={data.overlayText}
              components={{
                block: {
                  normal: ({ children }) =>
                    shortTitle ? (
                      <h2 className="font-display text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl xl:text-7xl">
                        {children}
                      </h2>
                    ) : (
                      <p className="mb-6 text-[17px] leading-[1.75] text-white/80 lg:text-[18px]">
                        {children}
                      </p>
                    ),
                  h2: ({ children }) => (
                    <h2 className="mb-6 font-display text-4xl leading-tight text-white lg:text-5xl xl:text-6xl">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-6 mt-10 font-display text-2xl leading-tight text-white lg:text-3xl">
                      {children}
                    </h3>
                  ),
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Caption — myk bunn-gradient vises KUN når det finnes bildetekst, så
          rene bilder uten tekst forblir helt rene. Gir lesbarhet uansett hvor
          lyst motivet er, uten å mørklegge hele bildet. */}
      {(data.backgroundImage?.caption || data.backgroundImage?.photographer) && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-6 pb-6 pt-24 lg:px-16 lg:pb-8">
          <p
            className="mx-auto max-w-[1100px] text-center font-heading text-[11px] uppercase leading-relaxed tracking-[0.28em] text-white/90"
            style={{ textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}
          >
            {data.backgroundImage.caption}
            {data.backgroundImage.photographer && (
              <>{data.backgroundImage.caption ? ' — ' : ''}Foto: {data.backgroundImage.photographer}</>
            )}
          </p>
        </div>
      )}
    </section>
  )
}
