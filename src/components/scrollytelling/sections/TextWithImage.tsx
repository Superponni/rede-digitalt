'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { gsap } from '@/lib/gsap-config'
import { PortableText } from '@portabletext/react'
import { stegaClean } from 'next-sanity'
import { useScrollyColors, type ScrollyColors } from '../ScrollyColorContext'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TextWithImageProps {
  data: {
    text?: any[]
    image?: { asset: { _ref: string }; alt?: string; caption?: string; photographer?: string; hotspot?: { x: number; y: number } }
    imagePosition?: 'left' | 'right'
    imageSize?: 'small' | 'medium' | 'large'
    imageRatio?: 'standard' | 'natural'
    backgroundColor?: string
    title?: string
  }
  index: number
}

/**
 * Detect if a text block is an inline quote (starts with – or «)
 */
function isInlineQuote(block: any): boolean {
  if (block._type !== 'block' || block.style !== 'normal') return false
  const text = block.children?.map((c: any) => c.text)?.join('') || ''
  return text.startsWith('–') || text.startsWith('−') || text.startsWith('«')
}

/**
 * Pre-process blocks: pick only the first quote to style as accent blockquote.
 * The rest render as subtle italic to avoid walls of color.
 */
function markQuoteBlocks(blocks: any[]): Set<number> {
  const styledQuotes = new Set<number>()
  for (let i = 0; i < blocks.length; i++) {
    if (isInlineQuote(blocks[i])) {
      styledQuotes.add(i)
      break // Only style the first quote
    }
  }
  return styledQuotes
}

function TextBlocks({ blocks, styledQuoteIndices, allBlocks, c }: { blocks: any[]; styledQuoteIndices: Set<number>; allBlocks: any[]; c: ScrollyColors }) {
  return (
    <div className="px-6 py-8 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-[680px]">
        <PortableText
          value={blocks}
          components={{
            block: {
              normal: ({ children, value }) => {
                const blockIndex = allBlocks.indexOf(value)

                if (isInlineQuote(value) && styledQuoteIndices.has(blockIndex)) {
                  return (
                    <blockquote
                      className="my-8 border-l-2 pl-6 font-display text-xl italic leading-relaxed lg:text-2xl"
                      style={{ borderColor: `rgba(${c.accentRgb}, 0.5)`, color: `rgba(${c.accentRgb}, ${c.isDark ? 0.85 : 1})` }}
                    >
                      {children}
                    </blockquote>
                  )
                }
                if (isInlineQuote(value)) {
                  return (
                    <p className="mb-6 text-[17px] italic leading-[1.75] lg:text-[18px]" style={{ color: c.body }}>
                      {children}
                    </p>
                  )
                }
                return (
                  <p className="mb-6 text-[17px] leading-[1.75] lg:text-[18px]" style={{ color: c.body }}>
                    {children}
                  </p>
                )
              },
              h2: ({ children }) => (
                <h2 className="mb-6 mt-14 font-display text-3xl leading-tight lg:text-4xl" style={{ color: c.heading }}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-6 mt-10 font-display text-2xl leading-tight lg:text-3xl" style={{ color: c.heading }}>
                  {children}
                </h3>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className="my-10 border-l-2 pl-6 font-display text-xl italic leading-relaxed lg:text-2xl"
                  style={{ borderColor: `rgba(${c.accentRgb}, 0.5)`, color: `rgba(${c.accentRgb}, ${c.isDark ? 0.85 : 1})` }}
                >
                  {children}
                </blockquote>
              ),
            },
            marks: {
              em: ({ children }) => (
                <em className="italic" style={{ color: c.body }}>{children}</em>
              ),
              strong: ({ children }) => (
                <strong className="font-bold" style={{ color: c.heading }}>{children}</strong>
              ),
            },
          }}
        />
      </div>
    </div>
  )
}

export function TextWithImage({ data, index }: TextWithImageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const ledeRef = useRef<HTMLDivElement>(null)
  const c = useScrollyColors()

  const isFirstTextSection = index === 1 // Right after hero (index 0)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Cinematic image reveal
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          scale: 1.06,
          opacity: 0.4,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: imageRef.current,
            start: 'top 85%',
            // Spill én gang og bli stående — IKKE reverse. Å reversere en
            // scale-from fikk bildet til å vokse tilbake til 106 % når man
            // scrollet opp igjen (opplevd som at illustrasjonen «endrer størrelse»).
            toggleActions: 'play none none none',
          },
        })
      }

      // Lede — big intro text animation
      if (ledeRef.current) {
        gsap.from(ledeRef.current, {
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ledeRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      // Body text paragraphs stagger in
      if (sectionRef.current) {
        const elements = sectionRef.current.querySelectorAll('[data-text-block] p, [data-text-block] blockquote, [data-text-block] h2, [data-text-block] h3')
        gsap.from(elements, {
          y: 25,
          opacity: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    })

    return () => mm.revert()
  }, [])

  const bgColor = data.backgroundColor || '#003865'
  const hotspot = data.image?.hotspot
  const objectPosition = hotspot
    ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
    : 'center 30%'

  // Split text: first paragraph as lede (if first section), rest as body
  const blocks = data.text || []
  let ledeBlock: any = null
  let bodyBlocks = blocks

  if (isFirstTextSection && blocks.length > 0 && blocks[0]._type === 'block') {
    ledeBlock = blocks[0]
    bodyBlocks = blocks.slice(1)
  }

  // Pre-calculate which quotes get styled treatment
  // Skip blockquote styling in first text section — quotes there
  // usually repeat in the PullQuote section that follows
  const styledQuoteIndices = isFirstTextSection
    ? new Set<number>()
    : markQuoteBlocks(bodyBlocks)

  const hasImage = !!data.image?.asset

  // Redaktørens valg av plassering/størrelse styrer asymmetrien: store bilder
  // går nær fullbredde og midtstilt, mindre bilder hugger en kant. Gir
  // editorial rytme i stedet for at alt ligger likt midtstilt.
  // Rens stega-tegn FØR sammenligning. I preview-modus legger Sanity usynlige
  // tegn på tekstfelt, så `data.imageSize === 'small'` blir falsk uten dette —
  // og alle valg (plassering/størrelse/format) faller til standard.
  const imageSize = stegaClean(data.imageSize)
  const imagePosition = stegaClean(data.imagePosition)
  const imageRatio = stegaClean(data.imageRatio)
  const assetRef = stegaClean(data.image?.asset?._ref) || ''

  const sizeMax =
    imageSize === 'small' ? 'max-w-2xl'
    : imageSize === 'medium' ? 'max-w-3xl'
    : 'max-w-5xl' // large / udefinert
  const align =
    imageSize === 'large' || !imagePosition ? 'mx-auto'
    : imagePosition === 'left' ? 'mr-auto'
    : 'ml-auto'

  // «Naturlig» format: behold bildets egen høyde (ingen beskjæring). Formatet
  // utledes av målene som ligger i asset-referansen (…-1365x2048-…). Stående
  // bilder sentreres og får en roligere maksbredde så de leses som portrett,
  // ikke som et gigantbilde.
  const naturalRatio = imageRatio === 'natural'
  const refDims = assetRef.match(/-(\d+)x(\d+)-/)
  const isPortrait = refDims ? Number(refDims[2]) > Number(refDims[1]) : false
  const naturalAspect = refDims ? `${refDims[1]} / ${refDims[2]}` : undefined
  const portraitMax =
    imageSize === 'small' ? 'max-w-xs'
    : imageSize === 'large' ? 'max-w-xl'
    : 'max-w-md'
  const boxMax = naturalRatio && isPortrait ? portraitMax : sizeMax
  const boxAlign = naturalRatio ? 'mx-auto' : align

  const imageElement = hasImage && (
    <div className="px-6 py-8 lg:px-16 lg:py-12">
      <div
        ref={imageRef}
        className={`relative ${boxAlign} ${boxMax} overflow-hidden`}
      >
        <div
          className={naturalRatio ? 'relative w-full' : 'relative aspect-[16/10] w-full'}
          style={naturalRatio && naturalAspect ? { aspectRatio: naturalAspect } : undefined}
        >
          <Image
            src={
              naturalRatio
                ? urlFor(data.image!).width(1200).url()
                : urlFor(data.image!).width(1400).height(875).fit('crop').url()
            }
            alt={data.image!.alt || ''}
            fill
            className="object-cover"
            style={{ objectPosition }}
            sizes="(max-width: 1024px) 100vw, 80vw"
          />
        </div>
        {(data.image!.caption || data.image!.photographer) && (
          <p className="mt-3 text-center font-heading text-[10px] uppercase tracking-[0.3em]" style={{ color: c.muted }}>
            {data.image!.caption}
            {data.image!.photographer && (
              <>{data.image!.caption ? ' — ' : ''}Foto: {data.image!.photographer}</>
            )}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* Section title — prominent display */}
      {data.title && (
        <div className="px-6 pt-12 lg:px-16 lg:pt-16">
          <div className="mx-auto max-w-[680px]">
            <h2 className="font-display text-2xl leading-tight lg:text-3xl" style={{ color: c.heading }}>
              {data.title}
            </h2>
            <div className="mt-4 h-px w-16" style={{ backgroundColor: `rgba(${c.accentRgb}, 0.5)` }} />
          </div>
        </div>
      )}

      {/* LEDE — huge display font intro */}
      {ledeBlock && (
        <div ref={ledeRef} className="px-6 pt-12 lg:px-16 lg:pt-16">
          <div className="mx-auto max-w-5xl">
            <PortableText
              value={[ledeBlock]}
              components={{
                block: {
                  normal: ({ children }) => (
                    <p className="font-display text-2xl leading-[1.3] md:text-3xl lg:text-[2.75rem] lg:leading-[1.25] xl:text-[3.25rem]" style={{ color: c.title }}>
                      {children}
                    </p>
                  ),
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Image — at top of section, after lede */}
      {imageElement}

      {/* Body text */}
      {bodyBlocks.length > 0 && (
        <div data-text-block>
          <TextBlocks blocks={bodyBlocks} styledQuoteIndices={styledQuoteIndices} allBlocks={bodyBlocks} c={c} />
        </div>
      )}
    </section>
  )
}
