'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()
  // Tilbake/frem-navigering skal IKKE hoppe til toppen — nettleseren gjenoppretter
  // posisjonen brukeren forlot. Flagget settes av popstate og leses (og nullstilles)
  // av rute-effekten under.
  const isBackForwardRef = useRef(false)
  const isFirstRenderRef = useRef(true)

  useEffect(() => {
    const onPopState = () => {
      isBackForwardRef.current = true
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Initialise Lenis once and wire it to GSAP's ticker
  useEffect(() => {
    // Respekter «redusert bevegelse»: smooth-scroll er bevegelse brukeren
    // eksplisitt har bedt om å slippe. Da lar vi nettleserens native scroll stå
    // (GSAP-laget er allerede vaktet hver for seg).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    })
    lenisRef.current = lenis

    // 1. Feed every Lenis scroll event into ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // 2. Drive Lenis from GSAP's ticker so they share the exact same frame
    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)

    // 3. Let Lenis handle lag — GSAP shouldn't also compensate
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // On route change: reset scroll and refresh all ScrollTrigger calculations.
  // Unntak: ved tilbake/frem (popstate) og ved første innlasting (reload) lar vi
  // nettleserens egen scroll-gjenoppretting stå — da bare refresher vi triggerne.
  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return

    const skipReset = isBackForwardRef.current || isFirstRenderRef.current
    isBackForwardRef.current = false
    isFirstRenderRef.current = false
    if (!skipReset) lenis.scrollTo(0, { immediate: true })

    // Double refresh: once after first paint, once after images load
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
    const delayed = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 600)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(delayed)
    }
  }, [pathname])

  return <>{children}</>
}
