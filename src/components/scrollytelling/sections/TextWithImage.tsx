'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { gsap } from '@/lib/gsap-config'
import { PortableText } from '@portabletext/react'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TextWithImageProps {
  data: {
    text?: any[]
    image?: { asset: { _ref: string }; alt?: string; caption?: string; photographer?: string; hotspot?: { x: number; y: number } }
    imagePosition?: 'left' | 'right'
    imageSize?: 'small' | 'medium' | 'large'
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
 * Pre-process blocks: pick only the first quote to style as gold blockquote.
 * The rest render as subtle italic to avoid walls of gold.
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

function TextBlocks({ blocks, styledQuoteIndices, allBlocks }: { blocks: any[]; styledQuoteIndices: Set<number>; allBlocks: any[] }) {
  return (
    <div className="px-6 py-14 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-[680px]">
        <PortableText
          value={blocks}
          components={{
            block: {
              normal: ({ children, value }) => {
                const blockIndex = allBlocks.indexOf(value)

                if (isInlineQuote(value) && styledQuoteIndices.has(blockIndex)) {
                  return (
                    <blockquote className="my-8 border-l-2 border-[#ff9cca]/40 pl-6 font-display text-xl italic leading-relaxed text-[#ff9cca]/80 lg:text-2xl">
                      {children}
                    </blockquote>
                  )
                }
                if (isInlineQuote(value)) {
                  return (
                    <p className="mb-6 text-[17px] italic leading-[1.75] text-white/60 lg:text-[18px]">
                      {children}
                    </p>
                  )
                }
                return (
                  <p className="mb-6 text-[17px] leading-[1.75] text-white/80 lg:text-[18px]">
                    {children}
                  </p>
                )
              },
              h2: ({ children }) => (
                <h2 className="mb-6 mt-14 font-display text-3xl leading-tight text-white lg:text-4xl">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-6 mt-10 font-display text-2xl leading-tight text-white lg:text-3xl">
                  {children}
                </h3>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-10 border-l-2 border-[#ff9cca]/40 pl-6 font-display text-xl italic leading-relaxed text-[#ff9cca]/80 lg:text-2xl">
                  {children}
                </blockquote>
              ),
            },
            marks: {
              em: ({ children }) => (
                <em className="italic text-white/70">{children}</em>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-white">{children}</strong>
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
            toggleActions: 'play none none reverse',
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
  const sizeMax =
    data.imageSize === 'small' ? 'max-w-2xl'
    : data.imageSize === 'medium' ? 'max-w-3xl'
    : 'max-w-5xl' // large / udefinert
  const align =
    data.imageSize === 'large' || !data.imagePosition ? 'mx-auto'
    : data.imagePosition === 'left' ? 'mr-auto'
    : 'ml-auto'

  const imageElement = hasImage && (
    <div className="px-6 py-16 lg:px-16 lg:py-24">
      <div
        ref={imageRef}
        className={`relative ${align} ${sizeMax} overflow-hidden`}
      >
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={urlFor(data.image!).width(1400).height(875).fit('crop').url()}
            alt={data.image!.alt || ''}
            fill
            className="object-cover"
            style={{ objectPosition }}
            sizes="(max-width: 1024px) 100vw, 80vw"
          />
        </div>
        {(data.image!.caption || data.image!.photographer) && (
          <p className="mt-3 text-center font-heading text-[10px] uppercase tracking-[0.3em] text-white/40">
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
        <div className="px-6 pt-16 lg:px-16 lg:pt-24">
          <div className="mx-auto max-w-[680px]">
            <h2 className="font-display text-2xl leading-tight text-white lg:text-3xl">
              {data.title}
            </h2>
            <div className="mt-4 h-px w-16 bg-gold/40" />
          </div>
        </div>
      )}

      {/* LEDE — huge display font intro (Joshua's style) */}
      {ledeBlock && (
        <div ref={ledeRef} className="px-6 pt-16 lg:px-16 lg:pt-24">
          <div className="mx-auto max-w-5xl">
            <PortableText
              value={[ledeBlock]}
              components={{
                block: {
                  normal: ({ children }) => (
                    <p className="font-display text-2xl leading-[1.3] text-white md:text-3xl lg:text-[2.75rem] lg:leading-[1.25] xl:text-[3.25rem]">
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
          <TextBlocks blocks={bodyBlocks} styledQuoteIndices={styledQuoteIndices} allBlocks={bodyBlocks} />
        </div>
      )}
    </section>
  )
}
