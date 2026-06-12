'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'

interface CollageImage {
  asset: { _ref: string }
  alt?: string
  caption?: string
  credit?: string
  hotspot?: { x: number; y: number }
  _key?: string
}

interface CollageProps {
  data: {
    title?: string
    images?: CollageImage[]
    backgroundColor?: string
  }
  index: number
}

/**
 * Asymmetrisk «scrapbook» — to forskjøvede kolonner (venstre bredere, høyre
 * senket) UTEN rotasjon. Bildene beskjæres til et lavere format (stående 4:5,
 * liggende 16:10) slik at seksjonen blir kompakt og ikke krever lang scroll,
 * samtidig som ansikter beholdes (hotspot styrer beskjæringen). Klikk forstørrer
 * til fullt, ubeskåret bilde.
 */
function isPortraitRef(ref: string): boolean {
  const m = ref.match(/-(\d+)x(\d+)-/)
  return m ? Number(m[2]) > Number(m[1]) : true
}

function CollageImage({ img, onZoom }: { img: CollageImage; onZoom: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!ref.current) return
      gsap.from(ref.current, {
        y: 26,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', toggleActions: 'play none none reverse' },
      })
    })
    return () => mm.revert()
  }, [])

  const aspect = isPortraitRef(img.asset._ref) ? '4 / 5' : '16 / 10'
  const objectPosition = img.hotspot ? `${img.hotspot.x * 100}% ${img.hotspot.y * 100}%` : 'center center'

  return (
    <button
      ref={ref}
      onClick={onZoom}
      className="group block w-full cursor-zoom-in"
      aria-label={img.alt || 'Forstørr bilde'}
    >
      <div
        className="relative w-full overflow-hidden rounded-sm shadow-[0_8px_24px_-16px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-[1.02]"
        style={{ aspectRatio: aspect }}
      >
        <Image
          src={urlFor(img).width(1000).url()}
          alt={img.alt || ''}
          fill
          className="object-cover"
          style={{ objectPosition }}
          sizes="(max-width: 1024px) 50vw, 40vw"
        />
      </div>
      {(img.caption || img.credit) && (
        <p className="mt-2 font-heading text-[10px] uppercase leading-relaxed tracking-[0.2em]" style={{ color: 'inherit' }}>
          {img.caption}
          {img.credit && <>{img.caption ? ' — ' : ''}Foto: {img.credit}</>}
        </p>
      )}
    </button>
  )
}

export function Collage({ data }: CollageProps) {
  const images = data.images || []
  const bg = data.backgroundColor
  const c = useScrollyColors()
  const [focused, setFocused] = useState<number | null>(null)
  const close = useCallback(() => setFocused(null), [])
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  // Når lightboxen er åpen: Esc lukker, fokus flyttes til lukkeknappen (og
  // tilbake ved lukking), og body-scroll låses så siden bak ikke beveger seg.
  useEffect(() => {
    if (focused === null) return
    lastFocusedRef.current = document.activeElement as HTMLElement | null
    closeBtnRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      lastFocusedRef.current?.focus()
    }
  }, [focused, close])

  if (images.length === 0) return null

  // Fordel annenhver i hver kolonne; høyre senkes for det forskjøvede blikket
  const left = images.map((img, i) => ({ img, i })).filter((_, k) => k % 2 === 0)
  const right = images.map((img, i) => ({ img, i })).filter((_, k) => k % 2 === 1)

  return (
    <section className="relative overflow-hidden py-14 lg:py-20" style={{ backgroundColor: bg }}>
      {data.title && (
        <div className="mx-auto mb-8 max-w-[1080px] px-6 lg:mb-10 lg:px-16">
          <h2 className="font-display text-2xl lg:text-3xl" style={{ color: c.heading }}>
            {data.title}
          </h2>
        </div>
      )}

      {/* Tablet / desktop — to forskjøvede kolonner, asymmetrisk, ingen rotasjon */}
      <div className="mx-auto hidden max-w-[1080px] grid-cols-[1.35fr_1fr] gap-7 px-6 md:grid lg:gap-12 lg:px-16" style={{ color: c.muted }}>
        <div className="flex flex-col gap-7 lg:gap-12">
          {left.map(({ img, i }) => (
            <CollageImage key={img._key || i} img={img} onZoom={() => setFocused(i)} />
          ))}
        </div>
        <div className="flex flex-col gap-7 pt-10 lg:gap-12 lg:pt-20" style={{ color: c.muted }}>
          {right.map(({ img, i }) => (
            <CollageImage key={img._key || i} img={img} onZoom={() => setFocused(i)} />
          ))}
        </div>
      </div>

      {/* Mobil — to kompakte kolonner */}
      <div className="grid grid-cols-2 gap-4 px-5 md:hidden" style={{ color: c.muted }}>
        <div className="flex flex-col gap-4">
          {left.map(({ img, i }) => (
            <CollageImage key={img._key || i} img={img} onZoom={() => setFocused(i)} />
          ))}
        </div>
        <div className="flex flex-col gap-4 pt-7">
          {right.map(({ img, i }) => (
            <CollageImage key={img._key || i} img={img} onZoom={() => setFocused(i)} />
          ))}
        </div>
      </div>

      <p
        className="mt-9 text-center font-heading text-[10px] uppercase tracking-[0.3em]"
        style={{ color: c.muted }}
      >
        Trykk på et bilde for å forstørre
      </p>

      {/* Lightbox / fokus */}
      {focused !== null && images[focused] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm md:p-10"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Forstørret bilde"
          data-lenis-prevent
        >
          <button
            ref={closeBtnRef}
            onClick={close}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Lukk"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          <figure className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlFor(images[focused]).width(1800).fit('max').auto('format').quality(80).url()}
              alt={images[focused].alt || ''}
              className="max-h-[82vh] w-auto rounded-sm object-contain"
            />
            {(images[focused].caption || images[focused].credit) && (
              <figcaption className="mt-3 text-center font-heading text-[11px] uppercase tracking-[0.2em] text-white/70">
                {images[focused].caption}
                {images[focused].credit && (
                  <>
                    {images[focused].caption ? ' — ' : ''}Foto: {images[focused].credit}
                  </>
                )}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  )
}
