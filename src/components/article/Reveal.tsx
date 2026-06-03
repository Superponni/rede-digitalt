'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'
import { gsap } from '@/lib/gsap-config'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface RevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** Vertikal forskyvning før innanimasjon (px). */
  y?: number
  /** Valgfri skala-start (ender alltid på 1 — ingen permanent beskjæring). */
  scale?: number
  duration?: number
  delay?: number
  /** Animer ved innlasting (over folden) i stedet for ved scroll-inn. */
  immediate?: boolean
}

/**
 * Mykt «reveal» av et element. Følger prosjektets GSAP-mønster: animasjon kjører
 * KUN når brukeren ikke har bedt om redusert bevegelse — da blir innholdet stående
 * synlig (gsap.from gjenstiller til naturlig tilstand om den aldri kjører).
 */
export function Reveal({
  children,
  as: Tag = 'div',
  className,
  style,
  y = 16,
  scale,
  duration = 0.7,
  delay = 0,
  immediate = false,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const vars: any = { opacity: 0, y, duration, delay, ease: 'power3.out' }
      if (scale != null) vars.scale = scale
      if (!immediate) {
        vars.scrollTrigger = { trigger: el, start: 'top 88%', once: true }
      }
      gsap.from(el, vars)
    })
    return () => mm.revert()
  }, [y, scale, duration, delay, immediate])

  return (
    <Tag ref={ref as any} className={className} style={style}>
      {children}
    </Tag>
  )
}
