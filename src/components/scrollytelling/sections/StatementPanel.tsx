'use client'

import { useEffect, useRef } from 'react'
import { stegaClean } from 'next-sanity'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'

interface StatementPanelProps {
  data: {
    quote?: string
    attribution?: string
    frame?: boolean
    size?: 'band' | 'full'
    backgroundColor?: string
  }
  index: number
}

/**
 * Heldekkende fargeflate med stort kursiv serif-sitat. Erstatter «tekst oppå
 * mørklagt foto» — emfase bor på en solid signaturfarge (som trykksaken og
 * Joshua's blå paneler), ikke på et nedmørket bilde.
 */
export function StatementPanel({ data }: StatementPanelProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const quoteRef = useRef<HTMLQuoteElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const c = useScrollyColors()

  const showFrame = data.frame !== false
  // Panelet er alltid den fulle signaturfargen (dyp), med varm, lys tekst oppå —
  // robust mot alle accent-farger.
  const panelBg = `rgb(${c.accentRgb})`
  const textColor = '#FBF7F2'

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (frameRef.current) {
        gsap.from(frameRef.current, {
          opacity: 0,
          scale: 0.985,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            // Spill én gang — reversering av scale-from fikk panelet til å
            // krympe igjen ved scroll opp (synlig størrelsesendring).
            toggleActions: 'play none none none',
          },
        })
      }

      if (quoteRef.current) {
        const words = quoteRef.current.querySelectorAll('[data-word]')
        if (words.length > 0) {
          // Kun opacity (ingen y-transform → ingen reflow-hakking), høy bunn-
          // verdi (0.35 = lesbar selv om triggeren skulle henge i preview-iframen),
          // og tidlig start så den fyrer pålitelig idet panelet kommer inn.
          gsap.from(words, {
            opacity: 0.35,
            duration: 0.5,
            stagger: 0.03,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          })
        }
      }
    })

    return () => mm.revert()
  }, [])

  // Rens stega-tegn før splitting (samme grunn som PullQuote).
  const words = stegaClean(data.quote)?.split(/\s+/) || []

  return (
    <section
      ref={sectionRef}
      className={`relative flex w-full items-center justify-center overflow-hidden px-6 ${
        stegaClean(data.size) === 'full' ? 'min-h-screen py-24' : 'min-h-[68vh] py-20'
      }`}
      style={{ backgroundColor: panelBg }}
    >
      {showFrame && (
        <div
          ref={frameRef}
          className="pointer-events-none absolute inset-5 rounded-[20px] md:inset-10 lg:inset-14"
          style={{ border: `1px solid ${textColor}40` }}
        />
      )}

      <blockquote ref={quoteRef} className="relative z-10 max-w-4xl text-center">
        <p
          className="font-display text-[1.7rem] italic leading-[1.3] md:text-4xl lg:text-5xl lg:leading-[1.25]"
          style={{ color: textColor }}
        >
          {words.map((word, i) => (
            <span key={i} data-word className="inline-block">
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>

        {data.attribution && (
          <footer
            className="mt-8 font-heading text-[11px] uppercase tracking-[0.4em]"
            style={{ color: `${textColor}99` }}
          >
            — {data.attribution}
          </footer>
        )}
      </blockquote>
    </section>
  )
}
