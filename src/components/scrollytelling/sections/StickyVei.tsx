'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'
import { AssembledIllustration } from '../AssembledIllustration'
import { prefetchSvg } from '../InlineSvg'

interface Step {
  title: string
  text: string
  icon?: string
}
interface StickyVeiProps {
  data: {
    label?: string
    badge?: string
    intro?: string
    steps: Step[]
    backgroundColor?: string
  }
  index: number
}

/**
 * Sticky-vei — klassisk scrollytelling: illustrasjonen blir STÅENDE (CSS sticky,
 * snapper ikke som GSAP-pin) mens teksten leses smooth nedover. For hvert steg
 * SETTES ILLUSTRASJONEN SAMMEN på nytt (AssembledIllustration mode="mount", keyet
 * på aktivt steg) — det er der spenningen ligger, ikke i klikk-navigasjon.
 *
 * Alt leses nedover; ingen horisontal scroll, ingen klikk-galleri.
 */
export function StickyVei({ data }: StickyVeiProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const c = useScrollyColors()
  const bgColor = data.backgroundColor || '#003865'
  const steps = useMemo(() => data.steps || [], [data.steps])
  const [active, setActive] = useState(0)
  const [entered, setEntered] = useState(false)

  // Slik at FØRSTE steg også settes sammen når veien scrolles inn (ikke på
  // page-load, off-screen). Uavhengig av bevegelses-preferanse.
  useEffect(() => {
    if (!sectionRef.current) return
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 72%',
      once: true,
      onEnter: () => setEntered(true),
    })
    return () => st.kill()
  }, [])

  // Forhåndslast alle steg-illustrasjonene, så de er klare før du scroller dit.
  useEffect(() => {
    steps.forEach((s) => prefetchSvg(s.icon))
  }, [steps])

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

      // Hvilket steg er «aktivt» → det hvis MIDT er ved skjermmidten (dvs. det du
      // faktisk leser). 'top center'→'bottom center' gjør at nøyaktig ett steg er
      // aktivt om gangen, og illustrasjonen byttes i takt med lesingen.
      const triggers = stepRefs.current.filter(Boolean).map((el, i) =>
        ScrollTrigger.create({
          trigger: el as HTMLElement,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) setActive(i)
          },
        }),
      )
      return () => triggers.forEach((t) => t.kill())
    })
    return () => mm.revert()
  }, [steps.length])

  const activeStep = steps[active]

  return (
    <section ref={sectionRef} className="relative px-6 lg:px-16" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto w-full max-w-[1100px]">
        {/* Header */}
        <div className="pt-16 text-center lg:pt-24">
          {data.label && (
            <span data-head className="mb-3 inline-block font-heading text-[12px] uppercase tracking-[0.3em]" style={{ color: c.accent }}>
              {data.label}
            </span>
          )}
          {data.badge && (
            <span
              data-head
              className="mb-5 ml-2 inline-block rounded-full px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ backgroundColor: `rgba(${c.accentRgb}, 0.12)`, color: c.accent }}
            >
              {data.badge}
            </span>
          )}
          {data.intro && (
            <p data-head className="mx-auto max-w-[560px] text-[18px] leading-[1.7]" style={{ color: c.body }}>
              {data.intro}
            </p>
          )}
        </div>

        {/* Sticky illustrasjon + steg som scroller forbi */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* illustrasjon */}
          <div
            className="sticky top-0 z-10 mx-auto flex h-[40vh] items-center justify-center lg:h-screen"
            style={{ backgroundColor: bgColor }}
          >
            {entered && activeStep?.icon && (
              <AssembledIllustration
                key={`${active}-${activeStep.icon}`}
                slug={activeStep.icon}
                mode="mount"
                stagger={0.4}
                className="flex h-[34vh] w-auto items-center justify-center lg:h-[44vh]"
                style={{ filter: 'drop-shadow(0 22px 38px rgba(0,32,64,0.14))' }}
              />
            )}
          </div>

          {/* steg-tekstene */}
          <div>
            {steps.map((s, i) => (
              <div
                key={i}
                ref={(el) => {
                  stepRefs.current[i] = el
                }}
                className="flex min-h-[78vh] flex-col justify-center text-center lg:text-left"
                style={{ opacity: active === i ? 1 : 0.32, transition: 'opacity 0.4s ease' }}
              >
                <span className="mb-3 font-heading text-[12px] uppercase tracking-[0.3em]" style={{ color: c.accent }}>
                  Steg {i + 1} av {steps.length}
                </span>
                <h3 className="mb-4 font-display text-2xl leading-tight lg:text-4xl" style={{ color: c.heading }}>
                  {s.title}
                </h3>
                <p className="mx-auto max-w-[440px] text-[18px] leading-[1.7] lg:mx-0" style={{ color: c.body }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
