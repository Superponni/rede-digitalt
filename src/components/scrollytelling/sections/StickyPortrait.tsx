'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { PortableText } from '@portabletext/react'
import { useScrollyTheme } from '../ScrollyThemeContext'
import { useScrollyColors } from '../ScrollyColorContext'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StickyPortraitProps {
  data: {
    image?: { asset: { _ref: string }; alt?: string; photographer?: string; hotspot?: { x: number; y: number } }
    text?: any[]
    imagePosition?: 'left' | 'right'
    backgroundColor?: string
  }
  index: number
}

export function StickyPortrait({ data }: StickyPortraitProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const imageColRef = useRef<HTMLDivElement>(null)
  const theme = useScrollyTheme()
  const c = useScrollyColors()

  const isLeft = data.imagePosition !== 'right'

  useEffect(() => {
    const mm = gsap.matchMedia()
    const { animation } = theme

    // Desktop only: pin the image column
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      if (imageColRef.current && sectionRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: imageColRef.current,
          pinSpacing: false,
          anticipatePin: 1,
        })
      }
    })

    // Animate text paragraphs in
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (sectionRef.current) {
        const paragraphs = sectionRef.current.querySelectorAll('[data-sticky-text] p, [data-sticky-text] h2, [data-sticky-text] h3, [data-sticky-text] blockquote')
        gsap.from(paragraphs, {
          y: 30,
          opacity: 0,
          duration: animation.duration * 0.5,
          stagger: animation.stagger,
          ease: animation.ease,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    })

    return () => mm.revert()
  }, [theme])

  const hotspot = data.image?.hotspot
  const objectPosition = hotspot
    ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
    : 'center 20%'

  const bgColor = data.backgroundColor || '#003865'

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* Mobile: stacked layout */}
      <div className="lg:hidden">
        {data.image?.asset && (
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={urlFor(data.image).width(800).height(1067).fit('crop').url()}
              alt={data.image.alt || ''}
              fill
              className="object-cover"
              style={{ objectPosition }}
              sizes="100vw"
            />
          </div>
        )}
        {data.text && (
          <div data-sticky-text className="px-6 py-14">
            <div className="mx-auto max-w-[680px]">
              <PortableText
                value={data.text}
                components={{
                  block: {
                    normal: ({ children }) => (
                      <p className="mb-6 text-[17px] leading-[1.75] lg:text-[18px]" style={{ color: c.body }}>
                        {children}
                      </p>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-6 mt-10 font-display text-3xl leading-tight lg:text-4xl" style={{ color: c.heading }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-6 mt-10 font-display text-2xl leading-tight lg:text-3xl" style={{ color: c.heading }}>
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote
                        className="my-8 border-l-2 pl-6 font-display text-xl italic leading-relaxed lg:text-2xl"
                        style={{ borderColor: `rgba(${c.accentRgb}, 0.5)`, color: `rgba(${c.accentRgb}, ${c.isDark ? 0.85 : 1})` }}
                      >
                        {children}
                      </blockquote>
                    ),
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop: side-by-side with pinned image */}
      <div className="hidden lg:grid lg:grid-cols-2">
        {/* Image column */}
        <div
          ref={imageColRef}
          className={`relative h-screen ${isLeft ? 'order-1' : 'order-2'}`}
        >
          {data.image?.asset && (
            <Image
              src={urlFor(data.image).width(1000).height(1400).fit('crop').url()}
              alt={data.image.alt || ''}
              fill
              className="object-cover"
              style={{ objectPosition }}
              sizes="50vw"
            />
          )}
          {data.image?.photographer && (
            <p className="absolute bottom-4 left-4 z-10 font-heading text-[10px] uppercase tracking-[0.3em] text-white/60">
              Foto: {data.image.photographer}
            </p>
          )}
        </div>

        {/* Text column */}
        <div
          data-sticky-text
          className={`px-12 py-16 xl:px-20 ${isLeft ? 'order-2' : 'order-1'}`}
        >
          <div className="max-w-[560px]">
            {data.text && (
              <PortableText
                value={data.text}
                components={{
                  block: {
                    normal: ({ children }) => (
                      <p className="mb-6 text-[17px] leading-[1.75] lg:text-[18px]" style={{ color: c.body }}>
                        {children}
                      </p>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-6 mt-10 font-display text-3xl leading-tight lg:text-4xl" style={{ color: c.heading }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-6 mt-10 font-display text-2xl leading-tight lg:text-3xl" style={{ color: c.heading }}>
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote
                        className="my-8 border-l-2 pl-6 font-display text-xl italic leading-relaxed lg:text-2xl"
                        style={{ borderColor: `rgba(${c.accentRgb}, 0.5)`, color: `rgba(${c.accentRgb}, ${c.isDark ? 0.85 : 1})` }}
                      >
                        {children}
                      </blockquote>
                    ),
                  },
                  marks: {
                    em: ({ children }) => <em className="italic" style={{ color: c.body }}>{children}</em>,
                    strong: ({ children }) => <strong className="font-bold" style={{ color: c.heading }}>{children}</strong>,
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
