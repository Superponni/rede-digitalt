'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'
import { iconSrc } from '@/lib/forkjopsrett-icons'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface IllustratedCoverProps {
  data: {
    kicker?: string
    title?: string
    dek?: string
    icon?: string
    secondaryIcon?: string
    backgroundColor?: string
  }
  index: number
}

/**
 * Illustrert cover — helskjerms åpning for feature-saker uten foto. Stor tittel
 * + signatur-illustrasjon + scroll-pekepinn, midtstilt på artikkelens flate.
 * Innholdet fader rolig inn ved last (ikke scroll-trigget — det ligger øverst).
 */
export function IllustratedCover({ data }: IllustratedCoverProps) {
  const rootRef = useRef<HTMLElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  const c = useScrollyColors()
  const bgColor = data.backgroundColor || '#003865'

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!rootRef.current) return
      const items = rootRef.current.querySelectorAll('[data-cover-item]')
      gsap.from(items, {
        y: 36,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.15,
      })
      if (cueRef.current) {
        gsap.to(cueRef.current, {
          y: 8,
          duration: 1.1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 py-24 text-center"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto flex max-w-[900px] flex-col items-center">
        {data.kicker && (
          <span
            data-cover-item
            className="mb-6 inline-block font-heading text-[13px] uppercase tracking-[0.4em]"
            style={{ color: c.accent }}
          >
            {data.kicker}
          </span>
        )}

        {data.title && (
          <h1
            data-cover-item
            className="font-display text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl"
            style={{ color: c.title }}
          >
            {data.title}
          </h1>
        )}

        {data.dek && (
          <p
            data-cover-item
            className="mt-7 max-w-[560px] text-[18px] leading-[1.7] lg:text-xl"
            style={{ color: c.body }}
          >
            {data.dek}
          </p>
        )}

        {data.icon && (
          <div data-cover-item className="relative mt-14 w-full max-w-[340px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconSrc(data.icon)}
              alt=""
              className="h-auto w-full object-contain"
              style={{ filter: 'drop-shadow(0 26px 44px rgba(0,32,64,0.16))' }}
            />
            {data.secondaryIcon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconSrc(data.secondaryIcon)}
                alt=""
                className="absolute -bottom-2 right-0 w-[32%] object-contain"
                style={{ filter: 'drop-shadow(0 14px 22px rgba(0,32,64,0.18))' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Scroll-pekepinn */}
      <div
        ref={cueRef}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="font-heading text-[10px] uppercase tracking-[0.3em]" style={{ color: c.muted }}>
          Bla nedover
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: c.accent }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}
