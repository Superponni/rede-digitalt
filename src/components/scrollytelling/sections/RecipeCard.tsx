'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { gsap } from '@/lib/gsap-config'
import { useScrollyTheme } from '../ScrollyThemeContext'
import { useScrollyColors } from '../ScrollyColorContext'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RecipeCardProps {
  data: {
    title?: string
    subtitle?: string
    image?: { asset: { _ref: string }; alt?: string }
    ingredients?: string[]
    instructions?: string
    backgroundColor?: string
  }
  index: number
}

export function RecipeCard({ data }: RecipeCardProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const theme = useScrollyTheme()
  const c = useScrollyColors()

  useEffect(() => {
    const mm = gsap.matchMedia()
    const { animation } = theme

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          y: 60,
          rotation: -3,
          opacity: 0,
          duration: animation.duration,
          ease: animation.ease,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    })

    return () => mm.revert()
  }, [theme])

  const bgColor = data.backgroundColor || '#003865'
  const accent = c.accent

  return (
    <section
      ref={sectionRef}
      className="flex min-h-[65vh] items-center justify-center px-6 py-16 lg:px-16"
      style={{ backgroundColor: bgColor }}
    >
      <div
        ref={cardRef}
        className="relative mx-auto w-full max-w-lg overflow-hidden rounded-sm p-8 lg:p-12"
        style={{
          transform: 'rotate(2deg)',
          backgroundColor: c.isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.55)',
          border: `2px solid rgba(${c.accentRgb}, 0.3)`,
        }}
      >
        {/* Decorative corner accents */}
        <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2" style={{ borderColor: accent }} />
        <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2" style={{ borderColor: accent }} />
        <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2" style={{ borderColor: accent }} />
        <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2" style={{ borderColor: accent }} />

        {/* Subtitle */}
        {data.subtitle && (
          <p className="mb-2 font-heading text-[10px] uppercase tracking-[0.4em]" style={{ color: c.muted }}>
            {data.subtitle}
          </p>
        )}

        {/* Title */}
        {data.title && (
          <h3 className="mb-6 font-display text-3xl leading-tight lg:text-4xl" style={{ color: accent }}>
            {data.title}
          </h3>
        )}

        {/* Image */}
        {data.image?.asset && (
          <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-sm">
            <Image
              src={urlFor(data.image).width(600).height(375).fit('crop').url()}
              alt={data.image.alt || ''}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 90vw, 512px"
            />
          </div>
        )}

        {/* Ingredients */}
        {data.ingredients && data.ingredients.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 font-heading text-[11px] uppercase tracking-[0.3em]" style={{ color: accent }}>
              Ingredienser
            </h4>
            <ul className="space-y-1.5">
              {data.ingredients.map((item, i) => (
                <li key={i} className="flex items-baseline gap-2 text-[15px]" style={{ color: c.body }}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: `rgba(${c.accentRgb}, 0.6)` }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {data.instructions && (
          <div>
            <h4 className="mb-3 font-heading text-[11px] uppercase tracking-[0.3em]" style={{ color: accent }}>
              Fremgangsmate
            </h4>
            <p className="text-[15px] leading-[1.7] whitespace-pre-line" style={{ color: c.body }}>
              {data.instructions}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
