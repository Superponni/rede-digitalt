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
    })

    // Hvilket steg er «aktivt» → det du faktisk leser. Nøyaktig ett steg er
    // aktivt om gangen (stegene ligger kant i kant), og illustrasjonen byttes i
    // takt med lesingen. Leselinja er IKKE den samme på mobil og desktop: på
    // desktop står teksten midt på skjermen (50 %), men på mobil ligger hele
    // lesesonen UNDER den sticky illustrasjonen (øverste ~40vh), med midtpunkt
    // rundt 70 % nede. Med linja på 50 % også på mobil sto teksten man leste
    // som «falmet» helt til den var halvveis scrollet bak illustrasjonen.
    // Deteksjonen gjelder også ved redusert bevegelse — det er lesetilstand,
    // ikke pynt (før ble alle steg unntatt det første stående nedtonet).
    const makeTriggers = (line: number) =>
      stepRefs.current.filter(Boolean).map((el, i) =>
        ScrollTrigger.create({
          trigger: el as HTMLElement,
          start: `top ${line}%`,
          end: `bottom ${line}%`,
          onToggle: (self) => {
            if (self.isActive) setActive(i)
          },
        }),
      )
    mm.add('(min-width: 1024px)', () => {
      const triggers = makeTriggers(50)
      return () => triggers.forEach((t) => t.kill())
    })
    mm.add('(max-width: 1023.98px)', () => {
      const triggers = makeTriggers(70)
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
            className="sticky top-0 z-10 mx-auto flex h-[36vh] items-center justify-center lg:h-screen"
            style={{ backgroundColor: bgColor }}
          >
            {/* Ingen drop-shadow på illustrasjonen: iOS Safari rasteriserer
                filteret som en synlig firkant rundt boksen. Flat = artefaktfritt. */}
            {entered && activeStep?.icon && (
              <AssembledIllustration
                key={`${active}-${activeStep.icon}`}
                slug={activeStep.icon}
                mode="mount"
                stagger={0.4}
                className="h-[28vh] w-full max-w-[460px] lg:h-[44vh]"
              />
            )}
            {/* Myk underkant (kun mobil): teksten glir inn i en fade i stedet
                for å bli kuttet knivskarpt midt i en linje av illustrasjonsboksen. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-full h-14 lg:hidden"
              style={{ background: `linear-gradient(to bottom, ${bgColor}, transparent)` }}
            />
          </div>

          {/* steg-tekstene */}
          <div>
            {steps.map((s, i) => (
              // Nedtoningen av inaktive steg gjelder KUN desktop (der tekst og
              // illustrasjon står side om side og nedtoningen viser hvilket steg
              // illustrasjonen tilhører). På mobil leses alt rett nedover — der
              // så halvgjennomsiktig tekst midt på skjermen ut som en lastefeil.
              <div
                key={i}
                ref={(el) => {
                  stepRefs.current[i] = el
                }}
                className="flex min-h-[52vh] flex-col justify-center text-center opacity-100 lg:min-h-[78vh] lg:text-left lg:opacity-(--steg-o) lg:transition-opacity lg:duration-[400ms]"
                style={{ '--steg-o': active === i ? '1' : '0.32' } as React.CSSProperties}
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
