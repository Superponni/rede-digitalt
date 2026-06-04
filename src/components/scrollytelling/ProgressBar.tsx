'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { useScrollyColors } from './ScrollyColorContext'

export function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)
  const c = useScrollyColors()

  useEffect(() => {
    if (!barRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${self.progress})`
        }
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <div className="fixed top-0 left-0 z-50 h-[3px] w-full">
      <div
        ref={barRef}
        className="h-full w-full origin-left"
        style={{ transform: 'scaleX(0)', backgroundColor: c.accent }}
      />
    </div>
  )
}
