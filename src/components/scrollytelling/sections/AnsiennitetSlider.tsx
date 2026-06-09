'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'
import { iconSrc } from '@/lib/forkjopsrett-icons'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AnsiennitetSliderProps {
  data: {
    title?: string
    intro?: string
    footnote?: string
    maxYears?: number
    backgroundColor?: string
  }
  index: number
}

// Kvalitativ vurdering — bevisst uten falske presise tall (vi har ikke ekte
// fordelingsdata). Det er prinsippet som teller: lengst ansiennitet vinner.
function verdict(years: number): { label: string; note: string } {
  if (years <= 2) return { label: 'Helt bakerst — men klokka har begynt å tikke.', note: 'Hvert år fra nå teller.' }
  if (years <= 7) return { label: 'Du er i gang.', note: 'Ansienniteten bygger seg opp år for år.' }
  if (years <= 15) return { label: 'Godt plassert i køen.', note: 'Du slår mange som meldte seg inn etter deg.' }
  if (years <= 25) return { label: 'Langt fremme i køen.', note: 'Nå begynner forkjøpsretten å bli en reell superkraft.' }
  return { label: 'Blant de aller fremste.', note: 'Drømmeboligen er innen rekkevidde.' }
}

export function AnsiennitetSlider({ data }: AnsiennitetSliderProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const max = data.maxYears ?? 40
  const [years, setYears] = useState(5)
  const c = useScrollyColors()
  const bgColor = data.backgroundColor || '#003865'

  const pct = (years / max) * 100
  const v = verdict(years)

  // «Andre» i køen — illustrative markører du passerer etter hvert som du drar.
  const others = [10, 24, 40, 58, 76, 90]

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!sectionRef.current) return
      const items = sectionRef.current.querySelectorAll('[data-slider-item]')
      gsap.from(items, {
        y: 28,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', toggleActions: 'play none none reverse' },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative px-6 py-20 lg:px-16 lg:py-28" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto max-w-[720px] text-center">
        <span
          data-slider-item
          className="mb-4 inline-block font-heading text-[12px] uppercase tracking-[0.3em]"
          style={{ color: c.accent }}
        >
          Test deg selv
        </span>
        <h2 data-slider-item className="mb-4 font-display text-3xl leading-[1.05] lg:text-5xl" style={{ color: c.title }}>
          {data.title || 'Hvor sterkt står du i køen?'}
        </h2>
        {data.intro && (
          <p data-slider-item className="mx-auto mb-12 max-w-[540px] text-[18px] leading-[1.7] lg:text-[19px]" style={{ color: c.body }}>
            {data.intro}
          </p>
        )}

        {/* Stor tallverdi */}
        <div data-slider-item className="mb-2">
          <span className="font-display text-6xl lg:text-7xl" style={{ color: c.accent }}>{years}</span>
          <span className="ml-2 font-heading text-lg" style={{ color: c.body }}>
            {years === 1 ? 'år som medlem' : 'år som medlem'}
          </span>
        </div>

        {/* Køen */}
        <div data-slider-item className="mb-8 mt-10">
          <div className="relative mx-auto h-20 w-full">
            {/* spor */}
            <div
              className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
              style={{ backgroundColor: `rgba(${c.accentRgb}, 0.18)` }}
            />
            {/* fylt del bak DU */}
            <div
              className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
              style={{ width: `${pct}%`, backgroundColor: c.accent, transition: 'width 0.12s ease-out' }}
            />
            {/* andre i køen */}
            {others.map((o) => {
              const passed = o < pct
              return (
                <span
                  key={o}
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${o}%`,
                    backgroundColor: passed ? `rgba(${c.accentRgb}, 0.25)` : `rgba(${c.accentRgb}, 0.55)`,
                    transition: 'background-color 0.15s ease',
                  }}
                />
              )
            })}
            {/* premien (nøkkel) helt fremst */}
            <img
              src={iconSrc('nokkel')}
              alt=""
              className="absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 translate-x-1/2 object-contain"
            />
            {/* DU-markør */}
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pct}%`, transition: 'left 0.12s ease-out' }}
            >
              <span
                className="block rounded-full px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-[0.15em] shadow-md"
                style={{ backgroundColor: c.accent, color: bgColor }}
              >
                Du
              </span>
            </div>
          </div>
          {/* ender-etiketter */}
          <div className="mt-2 flex justify-between font-heading text-[10px] uppercase tracking-[0.25em]" style={{ color: c.muted }}>
            <span>Bakerst</span>
            <span>Fremst i køen</span>
          </div>
        </div>

        {/* slider */}
        <input
          data-slider-item
          type="range"
          min={0}
          max={max}
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          aria-label="Antall år som TOBB-medlem"
          className="h-2 w-full max-w-[420px] cursor-pointer appearance-none rounded-full"
          style={{ accentColor: c.accent, backgroundColor: `rgba(${c.accentRgb}, 0.18)` }}
        />

        {/* vurdering */}
        <div data-slider-item className="mt-10">
          <p className="font-display text-2xl leading-snug lg:text-3xl" style={{ color: c.heading }}>
            {v.label}
          </p>
          <p className="mt-3 text-[17px] leading-[1.6]" style={{ color: c.body }}>{v.note}</p>
        </div>

        <p data-slider-item className="mt-10 text-[14px] italic leading-[1.6]" style={{ color: c.muted }}>
          {data.footnote || 'Illustrasjon av prinsippet — den med lengst ansiennitet vinner. Jo tidligere du startet, jo sterkere står du.'}
        </p>
      </div>
    </section>
  )
}
