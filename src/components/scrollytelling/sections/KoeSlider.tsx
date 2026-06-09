'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'
import { iconSrc } from '@/lib/forkjopsrett-icons'

interface KoeSliderProps {
  data: {
    competitors?: number
    backgroundColor?: string
  }
  index: number
}

// «Du» er ikke et eget element — det er den røde personen I køen.
const YOU = '#A4133C'

/**
 * Snik i køen — interaktiv slider. «Du» er IKKE et eget element: du er én av
 * personene som allerede står i køen, markert dyp rød. Når du drar mot «Først»,
 * bytter den røde fargen til neste person mot høyre — du ER køen som flytter seg
 * framover. Telleren «X foran deg» står i brødteksten; når du er først dukker en
 * winning-gif opp i et hvitt postkort.
 *
 * Slideren har ett steg per person (snapper person-for-person). Folkemengden
 * tegnes bare på nytt når den røde flytter seg → smooth.
 */
export function KoeSlider({ data }: KoeSliderProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const c = useScrollyColors()
  const bgColor = data.backgroundColor || '#003865'
  const count = Math.max(6, Math.min(40, data.competitors ?? 29))
  const total = count + 1 // du + de andre
  const [posIdx, setPosIdx] = useState(0) // 0 = bakerst, total-1 = først

  const ahead = total - 1 - posIdx
  const atFront = ahead === 0

  const people = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => ({
        i,
        left: 8 + (i / (total - 1)) * (86 - 8),
        h: 46 + ((i * 7) % 4) * 5,
        tone: 0.4 + ((i * 13) % 5) * 0.05,
      })),
    [total],
  )

  // Folkemengden, inkl. den røde «deg». Tegnes på nytt KUN når posIdx endrer seg.
  const crowd = useMemo(
    () =>
      people.map((p) => {
        const isYou = p.i === posIdx
        return (
          <div
            key={p.i}
            className="absolute bottom-6"
            style={{ left: `${p.left}%`, transform: 'translateX(-50%)', zIndex: isYou ? 10 : 1 }}
          >
            {isYou ? (
              <Figure rgb={c.accentRgb} alpha={1} height={66} solid accent={YOU} />
            ) : (
              <Figure rgb={c.accentRgb} alpha={p.tone} height={p.h} />
            )}
          </div>
        )
      }),
    [people, posIdx, c.accentRgb],
  )

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
        scrollTrigger: { trigger: sectionRef.current, start: 'top 76%', toggleActions: 'play none none none' },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative px-6 py-14 lg:px-16 lg:py-20" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto w-full max-w-[840px] text-center">
        <span data-item className="mb-10 inline-block font-heading text-[12px] uppercase tracking-[0.3em]" style={{ color: c.accent }}>
          Prøv sniking
        </span>

        {/* Køen — du er den røde personen i rekka */}
        <div className="relative mx-auto mb-8 h-[150px] w-full" data-item>
          <div className="absolute bottom-6 left-0 right-0 h-px" style={{ backgroundColor: `rgba(${c.accentRgb}, 0.22)` }} />

          {crowd}

          {/* døra + nøkkel */}
          <div
            className="absolute bottom-6 flex flex-col items-center"
            style={{ left: '93%', transform: 'translateX(-50%)', opacity: atFront ? 1 : 0.5, transition: 'opacity 0.3s ease' }}
          >
            <div
              className="mb-1 rounded-t-md"
              style={{ width: 40, height: 74, backgroundColor: `rgba(${c.accentRgb}, 0.12)`, border: `2px solid ${c.accent}`, borderBottom: 'none' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconSrc('nokkel')}
              alt=""
              className="absolute -top-8 h-8 w-8 object-contain"
              style={{
                filter: 'drop-shadow(0 5px 10px rgba(0,32,64,0.18))',
                transform: atFront ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(-20deg)',
                opacity: atFront ? 1 : 0.55,
                transition: 'transform 0.5s cubic-bezier(.34,1.56,.64,1), opacity 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Slider — ett steg per person */}
        <input
          data-item
          type="range"
          min={0}
          max={total - 1}
          step={1}
          value={posIdx}
          onChange={(e) => setPosIdx(Number(e.target.value))}
          aria-label="Snik deg fremover i køen"
          className="h-2 w-full max-w-[460px] cursor-pointer appearance-none rounded-full"
          style={{ accentColor: YOU, backgroundColor: `rgba(${c.accentRgb}, 0.18)` }}
        />
        <div
          data-item
          className="mx-auto mt-2 flex max-w-[460px] justify-between font-heading text-[10px] uppercase tracking-[0.25em]"
          style={{ color: c.muted }}
        >
          <span>Bakerst</span>
          <span>Først</span>
        </div>

        {/* Teller i brødteksten */}
        <p data-item className="mx-auto mt-8 max-w-[520px] text-[18px] leading-[1.6] lg:text-[20px]" style={{ color: c.body }}>
          {atFront ? (
            <>
              Du gikk forbi alle {count} — <strong style={{ color: c.heading }}>helt lovlig.</strong>
            </>
          ) : (
            <>
              <strong style={{ color: c.heading }}>{ahead}</strong> foran deg i køen. Dra deg fremover — forkjøpsretten lar deg gå forbi, på ansiennitet.
            </>
          )}
        </p>

        {/* Winning-gif i hvitt postkort når du er først */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: atFront ? 460 : 0,
            opacity: atFront ? 1 : 0,
            transition: 'max-height 0.55s ease, opacity 0.5s ease',
          }}
        >
          <div
            className="mx-auto mt-9 rounded-2xl bg-white p-3"
            style={{ maxWidth: 400, boxShadow: '0 20px 50px rgba(0,32,64,0.16)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/forkjopsrett/winning.gif" alt="Winning" className="w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Enkel, flat piktogram-figur (hode + kropp). */
function Figure({ rgb, alpha, height, solid, accent }: { rgb: string; alpha: number; height: number; solid?: boolean; accent?: string }) {
  const fill = solid && accent ? accent : `rgba(${rgb}, ${alpha})`
  const headSize = Math.round(height * 0.28)
  const bodyW = Math.round(height * 0.4)
  const bodyH = Math.round(height * 0.6)
  return (
    <div className="flex flex-col items-center" style={{ height }}>
      <span className="rounded-full" style={{ width: headSize, height: headSize, backgroundColor: fill }} />
      <span className="mt-[3px] rounded-t-[10px]" style={{ width: bodyW, height: bodyH, backgroundColor: fill }} />
    </div>
  )
}
