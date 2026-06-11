'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'

interface VeidelingProps {
  data: {
    intro?: string
    mainLabel?: string
    mainBadge?: string
    sideLabel?: string
    sideBadge?: string
    backgroundColor?: string
  }
  index: number
}

/**
 * Veideling — lite visuelt veiskille: en strek som kommer ned og DELER SEG i to.
 * Hovedveien (tykk, accent) = Forhånd · 95 %. Sideveien (tynn, dempet) = Fastpris ·
 * unntaket. Stregene tegnes inn ved innscroll. Ren overgang, lesbar rett nedover —
 * setter opp de to sticky-veiene som følger.
 */
export function Veideling({ data }: VeidelingProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const trunkRef = useRef<SVGPathElement>(null)
  const mainRef = useRef<SVGPathElement>(null)
  const sideRef = useRef<SVGPathElement>(null)
  const dotsRef = useRef<SVGGElement>(null)
  const c = useScrollyColors()
  const bgColor = data.backgroundColor || '#003865'

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

      const draw = (el: SVGPathElement | null) => {
        if (!el) return null
        const len = el.getTotalLength()
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
        return len
      }
      draw(trunkRef.current)
      draw(mainRef.current)
      draw(sideRef.current)
      if (dotsRef.current) gsap.set(dotsRef.current.children, { opacity: 0, scale: 0, transformOrigin: '50% 50%' })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 64%', toggleActions: 'play none none none' },
      })
      tl.to(trunkRef.current, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' })
      tl.to([mainRef.current, sideRef.current], { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }, '>-0.05')
      if (dotsRef.current)
        tl.to(dotsRef.current.children, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.12 }, '>-0.2')
    })
    return () => mm.revert()
  }, [])

  const main = { label: data.mainLabel || 'Forhåndsavklaring', badge: data.mainBadge || '95 % av salgene' }
  const side = { label: data.sideLabel || 'Fastprisavklaring', badge: data.sideBadge || 'Unntaket' }

  return (
    <section ref={sectionRef} className="relative px-6 py-16 lg:px-16 lg:py-24" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto w-full max-w-[640px] text-center">
        {data.intro && (
          <p data-head className="mx-auto mb-10 max-w-[520px] text-[18px] leading-[1.7]" style={{ color: c.body }}>
            {data.intro}
          </p>
        )}

        {/* Veiskillet */}
        <div className="mx-auto max-w-[340px]">
          <svg data-head viewBox="0 0 300 150" className="w-full" fill="none" aria-hidden="true">
            {/* stamme */}
            <path ref={trunkRef} d="M150 6 V52" stroke={c.accent} strokeWidth="6" strokeLinecap="round" />
            {/* hovedvei (tykk) — ned mot venstre */}
            <path ref={mainRef} d="M150 52 C150 96 92 96 70 132" stroke={c.accent} strokeWidth="6" strokeLinecap="round" />
            {/* sidevei (tynn, dempet) — ned mot høyre */}
            <path
              ref={sideRef}
              d="M150 52 C150 96 210 96 232 132"
              stroke={`rgba(${c.accentRgb}, 0.42)`}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <g ref={dotsRef}>
              <circle cx="70" cy="135" r="7" fill={c.accent} />
              <circle cx="232" cy="135" r="5" fill={`rgba(${c.accentRgb}, 0.5)`} />
            </g>
          </svg>

          {/* etiketter under hver gren */}
          {/* gap + orddeling: «Forhåndsavklaring»/«Fastprisavklaring» er lange
              enkeltord som ellers kolliderer i midten på smale skjermer. */}
          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="max-w-[46%] break-words text-left" style={{ hyphens: 'auto' }}>
              <span className="block font-display text-base leading-tight sm:text-lg" style={{ color: c.heading }}>
                {main.label}
              </span>
              <span className="mt-0.5 block font-heading text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: c.accent }}>
                {main.badge}
              </span>
            </div>
            <div className="max-w-[46%] break-words text-right" style={{ hyphens: 'auto' }}>
              <span className="block font-display text-sm leading-tight sm:text-base" style={{ color: c.muted }}>
                {side.label}
              </span>
              <span className="mt-0.5 block font-heading text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: c.muted }}>
                {side.badge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
