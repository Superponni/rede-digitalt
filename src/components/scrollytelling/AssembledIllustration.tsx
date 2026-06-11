'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { InlineSvg } from './InlineSvg'

/**
 * Assemblert illustrasjon — MALEN for å animere TOBB-SVG-ene «som Lottie»:
 * illustrasjonen legges inline (via InlineSvg), og delene settes sammen BIT FOR
 * BIT når scenen scrolles inn, i stedet for å fade som ett bilde. Grupper (<g>)
 * ekspanderes ett nivå, så f.eks. de 8 bokstavene i «Til salgs» kommer én og én.
 *
 * Hver del skalerer opp fra sitt eget sentrum (transformOrigin 50/50 → GSAP leser
 * getBBox), så ingenting «flyr» fra feil punkt. Respekterer reduced-motion:
 * da vises illustrasjonen ferdig, statisk.
 */
// Flere illustrasjoner blir gjerne klare i samme åndedrag (cache-treff). Én
// felles, utsatt refresh i stedet for én per illustrasjon — gjentatte fulle
// ScrollTrigger-omberegninger midt i scrollingen ga synlige hakk på mobil.
let refreshQueued = false
function queueScrollTriggerRefresh() {
  if (refreshQueued) return
  refreshQueued = true
  requestAnimationFrame(() => {
    refreshQueued = false
    ScrollTrigger.refresh()
  })
}

function collectParts(svg: SVGSVGElement): Element[] {
  const parts: Element[] = []
  Array.from(svg.children).forEach((ch) => {
    const t = ch.tagName.toLowerCase()
    if (t === 'defs') return
    if (t === 'g' && ch.children.length) parts.push(...Array.from(ch.children))
    else parts.push(ch)
  })
  return parts
}

export function AssembledIllustration({
  slug,
  className,
  style,
  start = 'top 80%',
  stagger = 0.5,
  mode = 'scroll',
}: {
  slug: string
  className?: string
  style?: React.CSSProperties
  start?: string
  /** TOTAL stagger-tid (sekunder) for HELE illustrasjonen — fordeles på delene
   *  uansett hvor mange de er, så ikoner med mange deler ikke blir trege. */
  stagger?: number
  /** 'scroll' = settes sammen når den scrolles inn. 'mount' = settes sammen
   *  umiddelbart (for sticky-bytte der illustrasjonen alltid er synlig). */
  mode?: 'scroll' | 'mount'
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const builtRef = useRef(false)

  const build = (svg: SVGSVGElement) => {
    if (builtRef.current || !wrapRef.current) return
    builtRef.current = true

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Avslør containeren først nå (den startet usynlig for å unngå glimt av
    // ferdig illustrasjon før delene rekker å skjules).
    gsap.set(wrapRef.current, { opacity: 1 })
    if (reduced) return

    const parts = collectParts(svg)
    if (!parts.length) return

    gsap.set(parts, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' })
    const tween: gsap.TweenVars = {
      opacity: 1,
      scale: 1,
      ease: 'back.out(1.7)',
      duration: 0.45,
      // amount = total stagger-tid fordelt på ALLE delene (ikke pr. del), så
      // antall deler ikke påvirker hvor lenge du venter på hele illustrasjonen.
      stagger: { amount: stagger, from: 'start' },
    }
    if (mode === 'mount') {
      gsap.to(parts, tween)
    } else {
      gsap.to(parts, { ...tween, scrollTrigger: { trigger: wrapRef.current, start, toggleActions: 'play none none none' } })
      // SVG-en ble nettopp hentet asynkront og lagt inline i DOM-en. Triggeren
      // over ble derfor regnet ut mot en flate som nettopp endret høyde — og om
      // fetchen var treg, rakk renderer-ens globale refresh-er (som bare lytter på
      // <img>, ikke inline-SVG) å kjøre FØR triggeren fantes. Da blir posisjonen
      // utdatert og illustrasjonen står usynlig til man refresher siden. Tving en
      // omberegning når layouten har satt seg, så triggeren fyrer riktig — og fyrer
      // umiddelbart dersom scenen allerede er i visning.
      queueScrollTriggerRefresh()
    }
  }

  useEffect(() => {
    const wrap = wrapRef.current
    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === wrap) t.kill()
      })
      // Tillat ny oppbygging ved remount (f.eks. Strict Mode i dev eller
      // klient-navigering): ellers ville build() bli stående med builtRef=true
      // mens triggeren over nettopp ble drept → delene aldri avslørt igjen.
      builtRef.current = false
    }
  }, [])

  return (
    <div ref={wrapRef} className={className} style={{ opacity: 0, ...style }}>
      <InlineSvg slug={slug} onReady={build} />
    </div>
  )
}
