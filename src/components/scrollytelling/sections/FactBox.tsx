'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'
import { PortableText } from '@portabletext/react'
import { useScrollyColors } from '../ScrollyColorContext'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FactBoxProps {
  data: {
    title?: string
    content?: any[]
    style?: 'highlight' | 'sidebar' | 'fullWidth'
    icon?: string
    backgroundColor?: string
  }
  index: number
}

export function FactBox({ data }: FactBoxProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const c = useScrollyColors()

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (boxRef.current) {
        gsap.from(boxRef.current, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    })

    return () => mm.revert()
  }, [])

  const bgColor = data.backgroundColor || '#003865'

  return (
    <section
      ref={sectionRef}
      className="px-6 py-12 lg:px-16 lg:py-16"
      style={{ backgroundColor: bgColor }}
    >
      <div ref={boxRef} className="mx-auto max-w-2xl">
        {/* Decorative title */}
        {data.title && (
          <div className="mb-8 lg:mb-10">
            <h3 className="font-display text-2xl leading-tight lg:text-3xl" style={{ color: c.heading }}>
              {data.title}
            </h3>
            <div className="mt-4 h-px w-16" style={{ backgroundColor: `rgba(${c.accentRgb}, 0.4)` }} />
          </div>
        )}

        {/* Body text — open, no box */}
        {data.content && (
          <div className="fact-box-content">
            <PortableText
              value={data.content}
              components={{
                block: {
                  normal: ({ children }) => (
                    <p className="mb-5 text-[17px] leading-[1.8]" style={{ color: c.body }}>
                      {children}
                    </p>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-3 mt-8 font-heading text-lg" style={{ color: c.heading }}>
                      {children}
                    </h3>
                  ),
                },
                list: {
                  bullet: ({ children }) => (
                    <ul className="mb-5 list-none space-y-3 pl-0">
                      {children}
                    </ul>
                  ),
                },
                listItem: {
                  bullet: ({ children }) => (
                    <li className="flex items-baseline gap-3 text-[16px] leading-[1.7]" style={{ color: c.body }}>
                      <span className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: `rgba(${c.accentRgb}, 0.6)` }} />
                      {children}
                    </li>
                  ),
                },
              }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
