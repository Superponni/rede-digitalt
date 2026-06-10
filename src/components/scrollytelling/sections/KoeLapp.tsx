'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'
import { iconSrc } from '@/lib/forkjopsrett-icons'

interface KoeLappProps {
  data: {
    competitors?: number
    backgroundColor?: string
  }
  index: number
}

const YOU = '#A4133C'
const GOLD = '#F6BE00'
const NAVY = '#003865'
const PAPER = '#FBF7EC'

/**
 * Kølapp-versjonen av «snik i køen» — SLIDER-DREVET. Et fysisk, taktilt objekt:
 * en papir-kølapp med perforert rivekant + et «NÅ BETJENES»-skilt i gull på navy.
 * Du drar — og lapp-nummeret RULLER mekanisk fra 30 ned mot 01 (odometer). Når
 * det lander på 01 stemples «DIN TUR», nøkkelen spretter opp + winning-gif.
 *
 * Bevisst slider, IKKE pin/scroll: nedtelling + en gif som folder seg ut endrer
 * høyden, og det kombinert med GSAP-pin gir ustabilitet (neste seksjon legger seg
 * oppå, jitter på vei opp). Slideren er deterministisk og kan ikke overlappe.
 */
export function KoeLapp({ data }: KoeLappProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const count = Math.max(6, Math.min(40, data.competitors ?? 29))
  const total = count + 1 // 30 lapper: 30 (bakerst) … 01 (din tur)
  const bgColor = data.backgroundColor || NAVY
  const c = useScrollyColors()

  const [posIdx, setPosIdx] = useState(0) // 0 = bakerst
  const number = total - posIdx // posIdx 0 → 30, posIdx total-1 → 1
  const atFront = number === 1
  const fillPct = (posIdx / (total - 1)) * 100 // hvor langt den røde lappen er trukket fram

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
    <section ref={sectionRef} className="relative px-6 py-16 lg:px-16 lg:py-24" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto w-full max-w-[640px] text-center">
        {/* «NÅ BETJENES»-skilt: gull-tall på navy, det faste målet (01) */}
        <div data-item className="mx-auto mb-10 inline-flex flex-col items-center rounded-xl px-7 py-3" style={{ backgroundColor: NAVY, boxShadow: '0 14px 30px rgba(0,32,64,0.28)' }}>
          <span className="mb-1 flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.34em]" style={{ color: 'rgba(255,255,255,0.66)' }}>
            <span className="inline-block h-[6px] w-[6px] rounded-full" style={{ backgroundColor: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
            Nå betjenes
          </span>
          <span className="font-mono text-[34px] font-bold leading-none tracking-[0.08em]" style={{ color: GOLD, textShadow: `0 0 14px rgba(246,190,0,0.45)` }}>
            01
          </span>
        </div>

        {/* Selve kølappen */}
        <div data-item className="relative mx-auto" style={{ maxWidth: 320, transform: 'rotate(-1.6deg)' }}>
          <div
            className="relative overflow-hidden rounded-[14px] px-8 pb-9 pt-10"
            style={{
              backgroundColor: PAPER,
              boxShadow: '0 30px 60px rgba(0,32,64,0.22), inset 0 0 0 1px rgba(0,32,64,0.06)',
              outline: atFront ? `3px solid ${GOLD}` : '3px solid transparent',
              transition: 'outline-color 0.4s ease',
            }}
          >
            {/* Perforert rivekant øverst */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-0 h-3"
              style={{
                backgroundImage: `radial-gradient(circle at 7px 0, ${bgColor} 5px, transparent 5.5px)`,
                backgroundSize: '14px 12px',
                backgroundRepeat: 'repeat-x',
              }}
            />

            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="h-px w-6" style={{ backgroundColor: 'rgba(0,32,64,0.25)' }} />
              <span className="font-heading text-[11px] uppercase tracking-[0.4em]" style={{ color: NAVY }}>
                Kølapp
              </span>
              <span className="h-px w-6" style={{ backgroundColor: 'rgba(0,32,64,0.25)' }} />
            </div>

            <span className="mb-1 block font-heading text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(0,32,64,0.5)' }}>
              Ditt nummer
            </span>

            {/* Rullende nummer */}
            <RollingNumber value={number} color={atFront ? YOU : NAVY} />

            {/* DIN TUR-stempel — egen plass under nummeret (reservert høyde) */}
            <div className="mt-3 flex h-[46px] items-center justify-center" aria-hidden>
              <span
                className="font-display text-[26px] uppercase leading-none"
                style={{
                  color: YOU,
                  border: `3px solid ${YOU}`,
                  borderRadius: 8,
                  padding: '4px 14px',
                  letterSpacing: '0.04em',
                  transform: `rotate(-7deg) scale(${atFront ? 1 : 0.6})`,
                  opacity: atFront ? 0.95 : 0,
                  transition: 'opacity 0.45s ease, transform 0.5s cubic-bezier(.34,1.56,.64,1)',
                }}
              >
                Din tur
              </span>
            </div>

            <span className="mt-4 block font-heading text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(0,32,64,0.4)' }}>
              TOBB · Forkjøpsrett
            </span>
          </div>

          {/* Nøkkel som dukker opp på lappen når det er din tur */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconSrc('nokkel')}
            alt=""
            className="absolute -right-4 -top-6 h-14 w-14 object-contain"
            style={{
              filter: 'drop-shadow(0 8px 16px rgba(0,32,64,0.24))',
              transform: atFront ? 'rotate(8deg) scale(1)' : 'rotate(-24deg) scale(0.5)',
              opacity: atFront ? 1 : 0,
              transition: 'transform 0.55s cubic-bezier(.34,1.56,.64,1), opacity 0.4s ease',
            }}
          />
        </div>

        {/* Slider */}
        <div className="mt-12">
          <input
            data-item
            type="range"
            min={0}
            max={total - 1}
            step={1}
            value={posIdx}
            onChange={(e) => setPosIdx(Number(e.target.value))}
            aria-label="Snik deg fremover i køen"
            className="koelapp-slider mx-auto block w-full max-w-[420px]"
            style={{ '--koe-fill': `${fillPct}%` } as CSSProperties}
          />
          <div
            data-item
            className="mx-auto mt-2 flex max-w-[420px] justify-between font-heading text-[10px] uppercase tracking-[0.25em]"
            style={{ color: c.muted }}
          >
            <span>Bakerst</span>
            <span>Din tur</span>
          </div>
        </div>

        {/* Fortellertekst */}
        <p data-item className="mx-auto mt-9 max-w-[480px] text-[18px] leading-[1.6] lg:text-[20px]" style={{ color: c.body }}>
          {atFront ? (
            <>
              Lapp nummer 01 — <strong style={{ color: c.heading }}>din tur, forbi alle {count}.</strong>
            </>
          ) : (
            <>
              Du trakk lapp <strong style={{ color: c.heading }}>{pad(number)}</strong>. Men forkjøpsretten lar deg bytte til en bedre — dra deg fremover, helt lovlig.
            </>
          )}
        </p>

        {/* Winning-gif når du er fremme — grid-rows-kollaps (klipper ikke kortets
            skygge/avrundede hjørner). Stabil her fordi seksjonen ikke er pinnet. */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: atFront ? '1fr' : '0fr',
            opacity: atFront ? 1 : 0,
            transition: 'grid-template-rows 0.55s ease, opacity 0.5s ease',
          }}
        >
          <div style={{ overflow: 'hidden', minHeight: 0 }}>
            {/* Rikelig bunn-padding så den myke skyggen toner helt ut FØR den
                ytre overflow:hidden (grid-kollaps) klipper — ellers kuttes
                skyggen rett av og lager en synlig hard kant mot neste seksjon. */}
            <div style={{ padding: '24px 34px 64px' }}>
              <div
                className="mx-auto rounded-2xl bg-white p-3"
                style={{ maxWidth: 300, boxShadow: '0 20px 50px rgba(0,32,64,0.16)' }}
              >
                {/* Egen overflow-hidden RUNDT gif-en (innenfor den hvite ramma)
                    så klippet skjer akkurat ved gif-kanten. Ørliten oppskalering
                    forankret oppe til venstre dytter den bakte 1px svarte kanten
                    (bunn/høyre) ut av klippet — topp/venstre står i ro. */}
                <div className="overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/forkjopsrett/winning.gif"
                    alt="Winning"
                    className="block w-full"
                    style={{ transform: 'scale(1.03)', transformOrigin: 'top left' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

/** Mekanisk rullende to-sifret tall (odometer). Hvert siffer er en strip 0–9
 *  som forskyves med transform → myk rulle-bevegelse når nummeret endrer seg. */
function RollingNumber({ value, color }: { value: number; color: string }) {
  const tens = Math.floor(value / 10)
  const ones = value % 10
  return (
    <div className="flex items-center justify-center font-mono font-bold leading-none" style={{ fontSize: 92, color, letterSpacing: '0.02em' }}>
      <DigitStrip digit={tens} />
      <DigitStrip digit={ones} />
    </div>
  )
}

function DigitStrip({ digit }: { digit: number }) {
  return (
    <span style={{ display: 'inline-block', height: '1em', width: '0.62em', overflow: 'hidden' }}>
      <span
        style={{
          display: 'block',
          transform: `translateY(-${digit}em)`,
          transition: 'transform 0.35s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} style={{ display: 'block', height: '1em', lineHeight: 1, textAlign: 'center' }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  )
}
