'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { stegaClean } from 'next-sanity'
import { urlFor } from '@/sanity/lib/image'
import { gsap } from '@/lib/gsap-config'
import { useScrollyColors } from '../ScrollyColorContext'

interface GalleryImage {
  asset: { _ref: string }
  alt?: string
  caption?: string
  credit?: string
  photographer?: string
  hotspot?: { x: number; y: number }
  _key?: string
}

interface GalleryProps {
  data: {
    title?: string
    images?: GalleryImage[]
    layout?: 'grid' | 'carousel' | 'masonry' | 'montage'
    backgroundColor?: string
  }
  index: number
}

const objPos = (img: GalleryImage) =>
  img.hotspot ? `${img.hotspot.x * 100}% ${img.hotspot.y * 100}%` : 'center center'

/**
 * Asymmetrisk magasin-montasje: to forskjøvede kolonner (venstre litt bredere,
 * høyre senket ned) der bildene veksler i størrelse og format. Bildene ligger
 * ALDRI oppå hverandre, så bildeteksten under hvert bilde har alltid ren plass.
 * Flate bilder (ingen skygge) leses som et trykt oppslag. Hver kolonne glir i
 * sin egen fart på scroll for et lett dybde-dryss.
 *
 * Liggende kildebilder beskjæres til vekslende format via hotspot: venstre
 * kolonne får liggende/vide format, høyre kolonne stående — det gir kontrasten.
 */
const LEFT_ASPECTS = ['4 / 3', '16 / 10', '4 / 3', '3 / 2']
const RIGHT_ASPECTS = ['3 / 4', '1 / 1', '4 / 5', '3 / 4']

function MontageImage({
  img,
  aspect,
  par,
  c,
}: {
  img: GalleryImage
  aspect: string
  par: number
  c: ReturnType<typeof useScrollyColors>
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      if (!ref.current) return
      gsap.fromTo(
        ref.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 92%', toggleActions: 'play none none reverse' },
        },
      )
      gsap.to(ref.current, {
        yPercent: par,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
    return () => mm.revert()
  }, [par])

  return (
    <figure ref={ref}>
      <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: aspect }}>
        <Image
          src={urlFor(img).width(1100).url()}
          alt={img.alt || ''}
          fill
          className="object-cover"
          style={{ objectPosition: objPos(img) }}
          sizes="(max-width: 1024px) 50vw, 44vw"
        />
      </div>
      {(img.caption || img.credit || img.photographer) && (
        <figcaption className="mt-3 font-heading text-[10px] uppercase leading-relaxed tracking-[0.2em]" style={{ color: c.muted }}>
          {img.caption}
          {(img.credit || img.photographer) && (
            <>{img.caption ? ' — ' : ''}Foto: {img.credit || img.photographer}</>
          )}
        </figcaption>
      )}
    </figure>
  )
}

function Montage({ images, c }: { images: GalleryImage[]; c: ReturnType<typeof useScrollyColors> }) {
  // Fordel annenhver i hver kolonne: venstre 0,2,4 · høyre 1,3,5
  const left = images.filter((_, i) => i % 2 === 0)
  const right = images.filter((_, i) => i % 2 === 1)

  return (
    <>
      {/* Tablet / desktop — to forskjøvede kolonner, ingen overlapp */}
      <div className="mx-auto hidden max-w-[1200px] grid-cols-[1.5fr_1fr] gap-8 px-6 md:grid lg:gap-14 lg:px-16">
        <div className="flex flex-col gap-12 lg:gap-20">
          {left.map((img, i) => (
            <MontageImage key={img._key || `l${i}`} img={img} aspect={LEFT_ASPECTS[i % LEFT_ASPECTS.length]} par={-5} c={c} />
          ))}
        </div>
        {/* Høyre kolonne senkes ned for det forskjøvede, redaksjonelle blikket */}
        <div className="flex flex-col gap-12 pt-16 lg:gap-20 lg:pt-28">
          {right.map((img, i) => (
            <MontageImage key={img._key || `r${i}`} img={img} aspect={RIGHT_ASPECTS[i % RIGHT_ASPECTS.length]} par={8} c={c} />
          ))}
        </div>
      </div>

      {/* Mobil — forskjøvet stabel, vekslende kant, flate bilder */}
      <div className="flex flex-col gap-9 px-5 md:hidden">
        {images.map((img, i) => (
          <figure key={img._key || i} className={`w-[86%] ${i % 2 === 0 ? 'self-start' : 'self-end'}`}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
              <Image
                src={urlFor(img).width(800).url()}
                alt={img.alt || ''}
                fill
                className="object-cover"
                style={{ objectPosition: objPos(img) }}
                sizes="86vw"
              />
            </div>
            {(img.caption || img.credit || img.photographer) && (
              <figcaption className="mt-2.5 font-heading text-[10px] uppercase leading-relaxed tracking-[0.2em]" style={{ color: c.muted }}>
                {img.caption}
                {(img.credit || img.photographer) && (
                  <>{img.caption ? ' — ' : ''}Foto: {img.credit || img.photographer}</>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </>
  )
}

export function Gallery({ data }: GalleryProps) {
  const images = data.images || []
  const bgColor = data.backgroundColor || '#003865'
  const c = useScrollyColors()
  const layout = stegaClean(data.layout)

  if (images.length === 0) return null

  return (
    <section className="relative overflow-hidden py-12 lg:py-20" style={{ backgroundColor: bgColor }}>
      {data.title && (
        <div className={layout === 'montage' ? 'mx-auto mb-10 max-w-[1200px] px-6 lg:mb-14 lg:px-16' : 'px-6 pb-8 lg:px-16'}>
          <h2 className="font-display text-2xl lg:text-3xl" style={{ color: c.heading }}>
            {data.title}
          </h2>
        </div>
      )}

      {layout === 'montage' ? (
        <Montage images={images} c={c} />
      ) : (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide lg:gap-6 lg:px-16">
          {images.map((img, i) => (
            <div
              key={img._key || i}
              className="w-[72vw] flex-shrink-0 snap-center sm:w-[50vw] lg:w-[35vw]"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                {img.asset && (
                  <Image
                    src={urlFor(img).width(800).height(600).fit('crop').url()}
                    alt={img.alt || ''}
                    fill
                    className="object-cover"
                    style={{ objectPosition: objPos(img) }}
                    sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 35vw"
                  />
                )}
              </div>
              {(img.caption || img.photographer) && (
                <p className="mt-3 font-heading text-[10px] uppercase tracking-[0.2em]" style={{ color: c.muted }}>
                  {img.caption}
                  {img.photographer && (
                    <>{img.caption ? ' — ' : ''}Foto: {img.photographer}</>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
