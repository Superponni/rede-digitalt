'use client'

import { useEffect, useRef, useState } from 'react'
import { iconSrc } from '@/lib/forkjopsrett-icons'

/**
 * Inline-SVG — henter en TOBB-ikon-fil og legger den RETT INN i DOM-en (ikke som
 * <img>), slik at GSAP kan animere de enkelte path-ene/gruppene: deler som settes
 * sammen, streker som tegnes, ting som beveger seg — «nesten som Lottie», uten
 * Lottie-runtime. Dette er grunnmuren for å animere illustrasjonene i hele saken
 * i stedet for bare å fade dem.
 *
 * onReady gir deg <svg>-roten når den er injisert, så komponenten kan hente ut og
 * animere innmaten (f.eks. svg.querySelectorAll('path')).
 */
const cache = new Map<string, string>()

/** Forhåndslast en ikon-fil inn i cachen, så InlineSvg viser den umiddelbart
 *  (uten å vente på fetch) når den senere monteres — f.eks. ved sticky-bytte. */
export async function prefetchSvg(slug?: string): Promise<void> {
  if (!slug || cache.has(slug)) return
  const url = iconSrc(slug)
  if (!url) return
  try {
    const t = await (await fetch(url)).text()
    cache.set(slug, t)
  } catch {
    /* stille — InlineSvg prøver fetch igjen ved montering */
  }
}

export function InlineSvg({
  slug,
  className,
  style,
  title,
  onReady,
}: {
  slug: string
  className?: string
  style?: React.CSSProperties
  title?: string
  onReady?: (root: SVGSVGElement) => void
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const onReadyRef = useRef(onReady)
  const [markup, setMarkup] = useState<string>(cache.get(slug) ?? '')

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    let alive = true
    const url = iconSrc(slug)
    if (!url) return
    const cached = cache.get(slug)
    if (cached) {
      // Allerede hentet — oppdater asynkront (unngå synkron setState i effekt).
      Promise.resolve().then(() => {
        if (alive) setMarkup(cached)
      })
      return () => {
        alive = false
      }
    }
    fetch(url)
      .then((r) => r.text())
      .then((t) => {
        if (!alive) return
        cache.set(slug, t)
        setMarkup(t)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [slug])

  useEffect(() => {
    if (!markup || !ref.current) return
    const svg = ref.current.querySelector('svg') as SVGSVGElement | null
    if (!svg) return
    // Fyll containeren responsivt (ikonene har egne viewBox-er).
    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.style.display = 'block'
    if (title) svg.setAttribute('aria-label', title)
    svg.setAttribute('role', title ? 'img' : 'presentation')
    onReadyRef.current?.(svg)
  }, [markup, title])

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
