'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'
import { useScrollyTheme } from '../ScrollyThemeContext'

interface CountUpFactProps {
  data: {
    number?: number
    prefix?: string
    suffix?: string
    label?: string
    backgroundColor?: string
  }
  index: number
}

export function CountUpFact({ data }: CountUpFactProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)
  const theme = useScrollyTheme()

  const targetNumber = data.number || 0

  useEffect(() => {
    const mm = gsap.matchMedia()
    const { animation } = theme

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!numberRef.current || !sectionRef.current) return

      const el = numberRef.current
      const proxy = { value: 0 }

      // Duration scales with theme personality
      const countDuration = theme.name === 'warm' ? 2.5 : theme.name === 'playful' ? 1.2 : 1.8
      const countEase = theme.name === 'playful' ? 'back.out(1.2)' : animation.ease

      gsap.to(proxy, {
        value: targetNumber,
        duration: countDuration,
        ease: countEase,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          toggleActions: 'play none none reverse',
        },
        onUpdate: () => {
          // Show integer or decimal based on target
          el.textContent = Number.isInteger(targetNumber)
            ? Math.round(proxy.value).toLocaleString('nb-NO')
            : proxy.value.toFixed(1).replace('.', ',')
        },
      })
    })

    // Reduced motion fallback
    mm.add('(prefers-reduced-motion: reduce)', () => {
      if (numberRef.current) {
        numberRef.current.textContent = Number.isInteger(targetNumber)
          ? targetNumber.toLocaleString('nb-NO')
          : targetNumber.toFixed(1).replace('.', ',')
      }
    })

    return () => mm.revert()
  }, [targetNumber, theme])

  const bgColor = data.backgroundColor || '#003865'

  return (
    <section
      ref={sectionRef}
      className="flex min-h-[55vh] items-center justify-center px-6 py-20 text-center lg:px-16"
      style={{ backgroundColor: bgColor }}
    >
      <div>
        <p className="font-display text-6xl leading-none md:text-8xl lg:text-[10rem]" style={{ color: theme.colors.accent }}>
          {data.prefix && <span className="mr-2 text-[0.6em] text-white/40">{data.prefix}</span>}
          <span ref={numberRef}>0</span>
          {data.suffix && <span className="ml-2 text-[0.5em] text-white/50">{data.suffix}</span>}
        </p>
        {data.label && (
          <p className="mt-6 font-heading text-[11px] uppercase tracking-[0.4em] text-white/50 lg:text-xs">
            {data.label}
          </p>
        )}
      </div>
    </section>
  )
}
