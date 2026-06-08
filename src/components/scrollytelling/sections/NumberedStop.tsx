'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { gsap } from '@/lib/gsap-config'
import { PortableText } from '@portabletext/react'
import { useScrollyTheme } from '../ScrollyThemeContext'
import { useScrollyColors } from '../ScrollyColorContext'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface NumberedStopProps {
  data: {
    stopNumber?: number
    title?: string
    text?: any[]
    image?: { asset: { _ref: string }; alt?: string; caption?: string; photographer?: string; hotspot?: { x: number; y: number } }
    backgroundColor?: string
  }
  index: number
}

export function NumberedStop({ data }: NumberedStopProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<SVGLineElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const theme = useScrollyTheme()
  const c = useScrollyColors()

  useEffect(() => {
    const mm = gsap.matchMedia()
    const { animation } = theme

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!sectionRef.current) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      })

      // Line draws in from top
      if (lineRef.current) {
        const length = lineRef.current.getTotalLength()
        gsap.set(lineRef.current, { strokeDasharray: length, strokeDashoffset: length })
        tl.to(lineRef.current, {
          strokeDashoffset: 0,
          duration: animation.duration * 0.6,
          ease: animation.ease,
        })
      }

      // Circle scales in
      if (circleRef.current) {
        tl.from(circleRef.current, {
          scale: 0,
          opacity: 0,
          duration: animation.duration * 0.4,
          ease: animation.ease,
        }, '-=0.3')
      }

      // Content fades in
      if (contentRef.current) {
        tl.from(contentRef.current, {
          y: 30,
          opacity: 0,
          duration: animation.duration * 0.5,
          ease: animation.ease,
        }, '-=0.2')
      }
    })

    return () => mm.revert()
  }, [theme])

  const bgColor = data.backgroundColor || '#003865'
  const accent = c.accent
  const stopNum = data.stopNumber || 1

  const hotspot = data.image?.hotspot
  const objectPosition = hotspot
    ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
    : 'center center'

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-12 lg:px-16 lg:py-16"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Vertical connecting line (from previous stop) */}
        {stopNum > 1 && (
          <svg className="mx-auto mb-5 h-12 w-px" aria-hidden="true">
            <line
              ref={lineRef}
              x1="0.5" y1="0" x2="0.5" y2="48"
              stroke={accent}
              strokeWidth="2"
              strokeOpacity="0.3"
            />
          </svg>
        )}

        {/* Number circle */}
        <div className="mb-8 flex justify-center">
          <div
            ref={circleRef}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 lg:h-20 lg:w-20"
            style={{ borderColor: accent }}
          >
            <span className="font-display text-2xl lg:text-3xl" style={{ color: accent }}>
              {stopNum}
            </span>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef}>
          {data.title && (
            <h3 className="mb-6 text-center font-display text-3xl leading-tight lg:text-4xl" style={{ color: c.heading }}>
              {data.title}
            </h3>
          )}

          {data.image?.asset && (
            <div className="relative mx-auto mb-8 aspect-[16/9] max-w-3xl overflow-hidden rounded-sm">
              <Image
                src={urlFor(data.image).width(1200).height(675).fit('crop').url()}
                alt={data.image.alt || ''}
                fill
                className="object-cover"
                style={{ objectPosition }}
                sizes="(max-width: 1024px) 100vw, 768px"
              />
              {data.image.photographer && (
                <p className="absolute bottom-2 right-3 font-heading text-[9px] uppercase tracking-[0.2em] text-white/30">
                  Foto: {data.image.photographer}
                </p>
              )}
            </div>
          )}

          {data.image?.asset && data.image.caption && (
            <p className="mx-auto -mt-4 mb-8 max-w-3xl text-center font-heading text-[10px] uppercase tracking-[0.3em]" style={{ color: c.muted }}>
              {data.image.caption}
            </p>
          )}

          {data.text && (
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
          )}
        </div>
      </div>
    </section>
  )
}
