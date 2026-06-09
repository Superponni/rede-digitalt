'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { PortableText } from '@portabletext/react'
import { useScrollyTheme } from '../ScrollyThemeContext'
import { useScrollyColors } from '../ScrollyColorContext'
import { iconSrc } from '@/lib/forkjopsrett-icons'
import { AssembledIllustration } from '../AssembledIllustration'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface IllustratedSceneProps {
  data: {
    eyebrow?: string
    title?: string
    text?: any[]
    icon?: string
    secondaryIcon?: string
    /** Sett delene sammen bit for bit (inline SVG) i stedet for å fade ikonet. */
    animateIllustration?: boolean
    /** Midtstill brødteksten (for korte broer/utsagn på 1–2 linjer). Lange avsnitt
     *  bør stå venstrestilt for lesbarhet — da lar du denne være av. */
    centerBody?: boolean
    ctaLabel?: string
    ctaHref?: string
    backgroundColor?: string
  }
  index: number
}

/**
 * Illustrert scene — flytende, MIDTSTILT narrativ-byggekloss. Illustrasjonen
 * (valgfri) flyter fritt over teksten og dukker opp med fade + svak parallaks
 * når den scrolles inn. Ingen pin, ingen venstre/høyre-veksling — alt sentreres
 * for et immersivt langlesings-uttrykk (ikke «standard nettside»).
 */
export function IllustratedScene({ data }: IllustratedSceneProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const figureRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const theme = useScrollyTheme()
  const c = useScrollyColors()

  const bgColor = data.backgroundColor || '#003865'
  const hasImage = !!data.icon

  useEffect(() => {
    const mm = gsap.matchMedia()
    const { animation } = theme

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!sectionRef.current) return

      // Når illustrasjonen settes sammen bit for bit, håndterer den sin egen
      // entré — da skal vi IKKE også fade hele figuren (det ville skjult delene).
      if (figureRef.current && !data.animateIllustration) {
        gsap.from(figureRef.current, {
          y: 48,
          opacity: 0,
          duration: animation.duration,
          ease: animation.ease,
          scrollTrigger: {
            trigger: figureRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        })
      }

      const textEls = sectionRef.current.querySelectorAll('[data-scene-text] > *')
      if (textEls.length) {
        gsap.from(textEls, {
          y: 26,
          opacity: 0,
          duration: animation.duration * 0.7,
          stagger: animation.stagger,
          ease: animation.ease,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            toggleActions: 'play none none none',
          },
        })
      }

      // Svak parallaks på selve bildet (ikke pin) — kun desktop
      mm.add('(min-width: 1024px)', () => {
        if (imgWrapRef.current) {
          gsap.fromTo(
            imgWrapRef.current,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        }
      })
    })

    return () => mm.revert()
  }, [theme, data.animateIllustration])

  const blockComponents = {
    block: {
      normal: ({ children }: any) => (
        <p className="mb-6 text-[18px] leading-[1.8] lg:text-[19px]" style={{ color: c.body }}>
          {children}
        </p>
      ),
      h3: ({ children }: any) => (
        <h3 className="mb-5 mt-10 font-display text-2xl leading-tight lg:text-3xl" style={{ color: c.heading }}>
          {children}
        </h3>
      ),
      blockquote: ({ children }: any) => (
        <blockquote
          className="my-8 font-display text-2xl italic leading-relaxed lg:text-3xl"
          style={{ color: c.heading }}
        >
          {children}
        </blockquote>
      ),
    },
    marks: {
      em: ({ children }: any) => <em className="italic" style={{ color: 'inherit' }}>{children}</em>,
      strong: ({ children }: any) => (
        <strong className="font-bold" style={{ color: c.heading }}>{children}</strong>
      ),
    },
  }

  return (
    <section ref={sectionRef} className="relative px-6 py-20 lg:px-16 lg:py-28" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto max-w-[760px] text-center">
        {hasImage && (
          <div ref={figureRef} className="mb-12 flex items-center justify-center">
            <div ref={imgWrapRef} className="relative w-full max-w-[400px]">
              {data.animateIllustration ? (
                <AssembledIllustration
                  slug={data.icon!}
                  className="h-auto w-full"
                  style={{ filter: 'drop-shadow(0 22px 38px rgba(0,32,64,0.14))' }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconSrc(data.icon)}
                  alt=""
                  className="h-auto w-full object-contain"
                  style={{ filter: 'drop-shadow(0 22px 38px rgba(0,32,64,0.14))' }}
                />
              )}
              {data.secondaryIcon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconSrc(data.secondaryIcon)}
                  alt=""
                  className="absolute -bottom-2 right-0 w-[34%] object-contain"
                  style={{ filter: 'drop-shadow(0 12px 20px rgba(0,32,64,0.16))' }}
                />
              )}
            </div>
          </div>
        )}

        <div data-scene-text>
          {data.eyebrow && (
            <span
              className="mb-4 inline-block font-heading text-[12px] uppercase tracking-[0.3em]"
              style={{ color: c.accent }}
            >
              {data.eyebrow}
            </span>
          )}
          {data.title && (
            <h2 className="mb-6 font-display text-3xl leading-[1.05] lg:text-5xl" style={{ color: c.title }}>
              {data.title}
            </h2>
          )}
          {data.text && (
            <div className={`mx-auto max-w-[600px] ${data.centerBody ? 'text-center' : 'text-left'}`}>
              <PortableText value={data.text} components={blockComponents} />
            </div>
          )}
          {data.ctaHref && data.ctaLabel && (
            <a
              href={data.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border-b-2 pb-1 font-heading text-[14px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
              style={{ color: c.accent, borderColor: `rgba(${c.accentRgb}, 0.4)` }}
            >
              {data.ctaLabel}
              <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
