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
 * Overlappende bilde-collage som glir i lag på scroll (ulik parallax-fart gir
 * dybde), og som kan klikkes for å forstørre/fokusere ett bilde. På mobil faller
 * den tilbake til en pen, lett overlappende stabel — overlapp i full bredde
 * fungerer ikke på liten skjerm.
 */
const SLOTS = [
  { left: '1%', top: '3%', width: '44%', aspect: '4 / 5', z: 4, rot: -2, par: -7 },
  { left: '42%', top: '0%', width: '40%', aspect: '4 / 3', z: 6, rot: 1.4, par: 9 },
  { left: '60%', top: '38%', width: '36%', aspect: '4 / 5', z: 5, rot: -1.2, par: -11 },
  { left: '8%', top: '50%', width: '40%', aspect: '4 / 3', z: 7, rot: 2, par: 7 },
  { left: '40%', top: '60%', width: '30%', aspect: '1 / 1', z: 8, rot: -2.6, par: -13 },
  { left: '74%', top: '6%', width: '23%', aspect: '3 / 4', z: 3, rot: 2.8, par: 13 },
]

export function Collage({ data }: CollageProps) {
  const images = data.images || []
  const bg = data.backgroundColor
  const c = useScrollyColors()
  const containerRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const [focused, setFocused] = useState<number | null>(null)

  const close = useCallback(() => setFocused(null), [])

  useEffect(() => {
    const mm = gsap.matchMedia()

    // Parallax + entré kun på tablet/desktop der bildene faktisk overlapper.
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      slotRefs.current.forEach((el, i) => {
        if (!el) return
        const slot = SLOTS[i % SLOTS.length]
        gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
          },
        )
        gsap.to(el, {
          yPercent: slot.par,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
    })

    return () => mm.revert()
  }, [images.length])

  // Esc lukker lightbox
  useEffect(() => {
    if (focused === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focused, close])

  if (images.length === 0) return null

  const objPos = (img: CollageImage) =>
    img.hotspot ? `${img.hotspot.x * 100}% ${img.hotspot.y * 100}%` : 'center center'

  return (
    <section className="relative overflow-hidden py-14 lg:py-20" style={{ backgroundColor: bg }}>
      {data.title && (
        <div className="mx-auto mb-8 max-w-[1200px] px-6 lg:mb-10 lg:px-16">
          <h2 className="font-display text-2xl lg:text-3xl" style={{ color: c.heading }}>
            {data.title}
          </h2>
        </div>
      )}

      {/* Tablet / desktop — overlappende collage */}
      <div
        ref={containerRef}
        className="relative mx-auto hidden h-[640px] max-w-[1200px] px-6 md:block md:h-[760px] lg:h-[900px] lg:px-16"
      >
        {images.map((img, i) => {
          const slot = SLOTS[i % SLOTS.length]
          return (
            <div
              key={img._key || i}
              ref={(el) => {
                slotRefs.current[i] = el
              }}
              className="absolute"
              style={{ left: slot.left, top: slot.top, width: slot.width, zIndex: slot.z }}
            >
              <button
                onClick={() => setFocused(i)}
                className="group block w-full cursor-zoom-in"
                style={{ transform: `rotate(${slot.rot}deg)` }}
                aria-label={img.alt || 'Forstørr bilde'}
              >
                <div
                  className="relative w-full overflow-hidden rounded-sm shadow-[0_18px_50px_-20px_rgba(0,0,0,0.5)] ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ aspectRatio: slot.aspect }}
                >
                  <Image
                    src={urlFor(img).width(900).height(1100).fit('crop').url()}
                    alt={img.alt || ''}
                    fill
                    className="object-cover"
                    style={{ objectPosition: objPos(img) }}
                    sizes="(max-width: 1024px) 45vw, 40vw"
                  />
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Mobil — pen, lett overlappende stabel */}
      <div className="flex flex-col px-5 md:hidden">
        {images.map((img, i) => (
          <button
            key={img._key || i}
            onClick={() => setFocused(i)}
            className={`group relative block w-[86%] cursor-zoom-in ${i === 0 ? '' : '-mt-6'} ${
              i % 2 === 0 ? 'self-start' : 'self-end'
            }`}
            style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`, zIndex: i + 1 }}
            aria-label={img.alt || 'Forstørr bilde'}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_14px_40px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/5">
              <Image
                src={urlFor(img).width(700).height(875).fit('crop').url()}
                alt={img.alt || ''}
                fill
                className="object-cover"
                style={{ objectPosition: objPos(img) }}
                sizes="86vw"
              />
            </div>
          </button>
        ))}
      </div>

      <p
        className="mt-8 text-center font-heading text-[10px] uppercase tracking-[0.3em]"
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
        >
          <button
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
              src={urlFor(images[focused]).width(1800).fit('max').url()}
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
