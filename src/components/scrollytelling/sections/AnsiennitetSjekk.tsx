'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'

interface AnsiennitetSjekkProps {
  data: {
    nowYear?: number
    minYear?: number
    ctaLabel?: string
    ctaHref?: string
    backgroundColor?: string
  }
  index: number
}

// Kvalitativ vurdering, finmasket og med litt leken variasjon. 0 år = ikke i køen
// ennå (ikke-medlem) → oppfordring. 1+ år = medlem → hvor sterkt du står. Ingen
// falske presise tall — det er prinsippet som teller: lengst ansiennitet vinner.
function verdict(years: number): { label: string; note: string } {
  if (years === 0)
    return { label: 'Helt fersk — men da er du i gang.', note: 'Meld deg inn, så starter klokka og du klatrer i køen år for år.' }
  if (years <= 2)
    return { label: 'Du har så vidt begynt.', note: 'Men de tidlige årene er gull — forspranget starter nå.' }
  if (years <= 5)
    return { label: 'Du er i gang.', note: 'Ansienniteten din vokser mens du sover.' }
  if (years <= 9)
    return { label: 'Du er godt i gang.', note: 'Du har alt passert dem som meldte seg inn i fjor og året før.' }
  if (years <= 14)
    return { label: 'Du står støtt.', note: 'Det begynner å bli mange bak deg i køen.' }
  if (years <= 19)
    return { label: 'Du står sterkt.', note: 'Nå er forkjøpsretten en reell fordel på visning.' }
  if (years <= 25)
    return { label: 'Du er langt fremme.', note: 'Her er forkjøpsretten en skikkelig superkraft.' }
  if (years <= 31)
    return { label: 'Du er i toppsjiktet.', note: 'Det er kort vei til front i de fleste køer nå.' }
  if (years <= 37)
    return { label: 'Du er nesten på toppen.', note: 'Drømmeboligen er innen rekkevidde.' }
  return { label: 'Du er blant de aller, aller fremste.', note: 'Ærlig talt — det er nesten urettferdig hvor sterkt du står.' }
}

/**
 * Ansiennitet-sjekk — den PERSONLIGE landingen («gjør det om til deg»), formet som
 * en kalkulator i en hvit boks (visuelt avbrekk fra canvas). Sett året du ble
 * medlem → din ansiennitet + hvor sterkt du står. CTA «bli medlem» vises KUN ved
 * 0 år (er du allerede medlem, er den unødvendig). Lett slider → smooth, ingen pin.
 */
export function AnsiennitetSjekk({ data }: AnsiennitetSjekkProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const c = useScrollyColors()
  const bgColor = data.backgroundColor || '#003865'
  const now = data.nowYear ?? new Date().getFullYear()
  const min = data.minYear ?? now - 40

  const [joinYear, setJoinYear] = useState(now - 8)
  const ans = Math.max(0, now - joinYear)
  const v = verdict(ans)
  const showCta = ans === 0 && !!data.ctaHref && !!data.ctaLabel

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!sectionRef.current) return
      const items = sectionRef.current.querySelectorAll('[data-item]')
      gsap.from(items, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 74%', toggleActions: 'play none none none' },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative px-6 py-16 lg:px-16 lg:py-24" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto w-full max-w-[600px] text-center">
        <span data-item className="mb-4 inline-block font-heading text-[12px] uppercase tracking-[0.3em]" style={{ color: c.accent }}>
          Enn du da?
        </span>
        <h3 data-item className="mb-8 font-display text-2xl leading-tight lg:text-4xl" style={{ color: c.title }}>
          Når ble du medlem?
        </h3>

        {/* Hvit kalkulator-boks — visuelt avbrekk */}
        <div
          data-item
          className="rounded-3xl bg-white px-6 py-10 text-center lg:px-12 lg:py-12"
          style={{ boxShadow: '0 24px 60px rgba(0,32,64,0.12)' }}
        >
          {/* Stor readout */}
          <div className="mb-1">
            <span className="font-display text-6xl leading-none lg:text-7xl" style={{ color: c.accent }}>
              {ans}
            </span>
            <span className="ml-3 font-heading text-[14px] uppercase tracking-[0.2em]" style={{ color: c.body }}>
              års ansiennitet
            </span>
          </div>
          <div className="mb-8 font-heading text-[12px] uppercase tracking-[0.22em]" style={{ color: c.muted }}>
            {ans === 0 ? 'Ennå ikke i køen' : `Medlem siden ${joinYear}`}
          </div>

          {/* Slider over år */}
          <input
            type="range"
            min={min}
            max={now}
            value={joinYear}
            onChange={(e) => setJoinYear(Number(e.target.value))}
            aria-label="Året du ble medlem"
            className="h-2 w-full cursor-pointer appearance-none rounded-full"
            style={{ accentColor: c.accent, backgroundColor: `rgba(${c.accentRgb}, 0.18)` }}
          />
          <div className="mt-2 flex justify-between font-heading text-[10px] uppercase tracking-[0.25em]" style={{ color: c.muted }}>
            <span>{min}</span>
            <span>I år</span>
          </div>

          {/* Vurdering — to-linjers notat låst i høyde så boksen ikke hopper */}
          <div className="mt-9">
            <p className="font-display text-2xl leading-snug lg:text-3xl" style={{ color: c.heading }}>
              {v.label}
            </p>
            <p className="mx-auto mt-3 flex min-h-[3.4em] max-w-[420px] items-start justify-center text-[17px] leading-[1.6]" style={{ color: c.body }}>
              {v.note}
            </p>
          </div>

          {/* Bunn-slot med FAST høyde: knapp ved 0 år, ellers en stille linje —
              så boksen er like høy uansett ansiennitet (ingen hopp 0 → 1). */}
          <div className="mt-8 flex min-h-[52px] items-center justify-center">
            {showCta ? (
              <a
                href={data.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm px-7 py-3.5 font-heading text-[14px] font-bold uppercase tracking-[0.15em] shadow-md transition-opacity hover:opacity-90"
                style={{ backgroundColor: c.accent, color: '#ffffff' }}
              >
                {data.ctaLabel}
                <span aria-hidden="true">→</span>
              </a>
            ) : (
              <span className="font-heading text-[12px] uppercase tracking-[0.22em]" style={{ color: c.muted }}>
                Du er allerede i køen
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
