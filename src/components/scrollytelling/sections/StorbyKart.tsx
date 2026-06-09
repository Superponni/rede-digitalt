'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'

interface StorbyKartProps {
  data: {
    eyebrow?: string
    title?: string
    intro?: string
    backgroundColor?: string
  }
  index: number
}

// ViewBox 300×520. Byene er plassert etter omtrentlig ekte geografi (lat→y, lon→x).
const TRH = { name: 'Trondheim', x: 132, y: 298 }
const CITIES = [
  { name: 'Tromsø', x: 243, y: 78, side: 'left' as const },
  { name: 'Bodø', x: 185, y: 160, side: 'right' as const },
  { name: 'Bergen', x: 72, y: 405, side: 'left' as const },
  { name: 'Oslo', x: 140, y: 428, side: 'right' as const },
  { name: 'Stavanger', x: 82, y: 458, side: 'left' as const },
  { name: 'Kristiansand', x: 108, y: 492, side: 'left' as const },
]

// Forenklet, dempet Norge-silhuett (kontekst, ikke nøyaktig kart): bred sør-del
// som smalner nordover til en tynn nord-arm mot Tromsø/Finnmark.
const NORWAY =
  'M95 500 Q70 480 58 440 Q52 410 70 380 Q95 345 108 310 Q118 270 135 225 Q160 170 195 120 Q225 80 258 52 L290 46 Q272 72 250 96 Q215 145 198 195 Q182 245 174 290 Q168 345 165 390 Q162 435 150 465 Q138 492 115 502 Q103 506 95 500 Z'

export function StorbyKart({ data }: StorbyKartProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const c = useScrollyColors()
  const bgColor = data.backgroundColor || '#003865'

  const pct = (val: number, max: number) => `${(val / max) * 100}%`

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const root = sectionRef.current
      if (!root) return

      const head = root.querySelectorAll('[data-head]')
      gsap.from(head, {
        y: 22,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 74%', toggleActions: 'play none none none' },
      })

      const silhouette = root.querySelector('[data-silhouette]')
      const trhDot = root.querySelector('[data-trh-dot]')
      const trhLabel = root.querySelector('[data-trh-label]')
      const pulse = root.querySelector('[data-pulse]') as SVGCircleElement | null
      const lines = root.querySelectorAll<SVGLineElement>('[data-line]')
      const dots = root.querySelectorAll('[data-citydot]')
      const labels = root.querySelectorAll('[data-citylabel]')

      gsap.set(silhouette, { opacity: 0 })
      gsap.set([trhDot, ...Array.from(dots)], { scale: 0, opacity: 0, transformOrigin: '50% 50%' })
      gsap.set([trhLabel, ...Array.from(labels)], { opacity: 0, y: 6 })
      lines.forEach((ln) => {
        const len = ln.getTotalLength()
        gsap.set(ln, { strokeDasharray: len, strokeDashoffset: len })
      })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 64%', toggleActions: 'play none none none' },
      })
      tl.to(silhouette, { opacity: 0.16, duration: 0.8, ease: 'power2.out' }, 0)
      tl.to(trhDot, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 0.2)
      tl.to(trhLabel, { opacity: 1, y: 0, duration: 0.4 }, '<')
      tl.to(lines, { strokeDashoffset: 0, duration: 0.55, stagger: 0.14, ease: 'power2.out' }, 0.7)
      tl.to(dots, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.14, ease: 'back.out(2)' }, 0.95)
      tl.to(labels, { opacity: 1, y: 0, duration: 0.4, stagger: 0.14 }, 1.0)

      // Trondheim pulserer (eget, uendelig)
      if (pulse) {
        gsap.fromTo(
          pulse,
          { attr: { r: 6 }, opacity: 0.5 },
          { attr: { r: 22 }, opacity: 0, duration: 1.9, ease: 'power1.out', repeat: -1 },
        )
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative px-6 py-16 lg:px-16 lg:py-24" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto w-full max-w-[760px] text-center">
        {data.eyebrow && (
          <span data-head className="mb-3 inline-block font-heading text-[12px] uppercase tracking-[0.3em]" style={{ color: c.accent }}>
            {data.eyebrow}
          </span>
        )}
        {data.title && (
          <h2 data-head className="mb-4 font-display text-3xl leading-[1.08] lg:text-4xl" style={{ color: c.title }}>
            {data.title}
          </h2>
        )}
        {data.intro && (
          <p data-head className="mx-auto mb-12 max-w-[540px] text-[18px] leading-[1.7]" style={{ color: c.body }}>
            {data.intro}
          </p>
        )}

        {/* Kartet */}
        <div className="relative mx-auto w-full max-w-[320px]" style={{ aspectRatio: '300 / 520' }}>
          <svg viewBox="0 0 300 520" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
            {/* silhuett */}
            <path data-silhouette d={NORWAY} fill={c.accent} stroke="none" />

            {/* linjer fra Trondheim ut til byene */}
            {CITIES.map((city) => (
              <line
                key={`l-${city.name}`}
                data-line
                x1={TRH.x}
                y1={TRH.y}
                x2={city.x}
                y2={city.y}
                stroke={c.accent}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeOpacity="0.5"
              />
            ))}

            {/* by-prikker */}
            {CITIES.map((city) => (
              <circle key={`d-${city.name}`} data-citydot cx={city.x} cy={city.y} r="5" fill={c.accent} />
            ))}

            {/* Trondheim: puls-ring + uthevet prikk */}
            <circle data-pulse cx={TRH.x} cy={TRH.y} r="6" fill="none" stroke={c.accent} strokeWidth="2" />
            <circle data-trh-dot cx={TRH.x} cy={TRH.y} r="8" fill={c.accent} stroke="#ffffff" strokeWidth="2" />
          </svg>

          {/* etiketter (HTML over SVG) */}
          {CITIES.map((city) => (
            <div key={`lab-${city.name}`} className="absolute" style={{ left: pct(city.x, 300), top: pct(city.y, 520) }}>
              <span
                data-citylabel
                className="absolute whitespace-nowrap font-heading text-[12px] font-bold uppercase tracking-[0.12em]"
                style={{
                  color: c.heading,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  ...(city.side === 'right' ? { left: '12px' } : { right: '12px' }),
                }}
              >
                {city.name}
              </span>
            </div>
          ))}
          <div className="absolute" style={{ left: pct(TRH.x, 300), top: pct(TRH.y, 520) }}>
            <span
              data-trh-label
              className="absolute whitespace-nowrap font-heading text-[13px] font-bold uppercase tracking-[0.12em]"
              style={{ color: c.accent, top: '50%', left: '14px', transform: 'translateY(-50%)' }}
            >
              Trondheim
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
