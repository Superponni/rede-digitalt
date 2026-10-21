'use client'

import { Fragment, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from '@/lib/gsap-config'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { stegaClean } from 'next-sanity'
import { naturalSrc, imageDims } from '@/sanity/lib/imageHelpers'
import { HUES, MAGENTA, tint, type Hue } from '@/lib/palette'
import type { AccentColor } from './theme'
import { Reveal } from './Reveal'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Brødtekst for standardsaker, etter malen høsten 2026.
 *
 * Tolv kolonner på desktop: tekst i kolonne 1–7, høyrefelt i kolonne 9–12.
 * Faktabokser og stående bilder hører hjemme i høyrefeltet — det holder
 * tekstbredden jevn. Hver av dem «forankres» til teksten som følger etter i
 * Sanity, så de havner på riktig sted også på mobil og nettbrett, der de
 * vises i tekstflyten.
 *
 * Luft (malens rytme): avsnitt→avsnitt 16, tekst→mellomtittel 48,
 * mellomtittel→tekst 16, tekst→bilde/boks 48, tekst→sitat 64 (80 på desktop),
 * bilde→bildetekst 12.
 */

// Signaturfargen til saken → malens fargenavn (gull heter gul i malen).
const ACCENT_HUE: Record<AccentColor, Hue> = {
  navy: 'navy',
  teal: 'teal',
  purple: 'purple',
  magenta: 'magenta',
  blue: 'blue',
  green: 'green',
  gold: 'yellow',
}

const isRailBlock = (block: any): boolean => {
  if (block?._type === 'inlineFactBox') return Boolean(block.content)
  if (block?._type === 'image' && block.asset) {
    const { width, height } = imageDims(block)
    return height > width * 1.1 // stående bilde
  }
  return false
}

interface Segment {
  rail: any[]
  blocks: any[]
}

/** Del brødteksten i bolker: hvert høyrefelt-element + teksten det står ved siden av. */
function toSegments(value: any[]): Segment[] {
  const segments: Segment[] = []
  let current: Segment = { rail: [], blocks: [] }
  for (const block of value) {
    if (isRailBlock(block)) {
      if (current.blocks.length > 0) {
        segments.push(current)
        current = { rail: [], blocks: [] }
      }
      current.rail.push(block)
    } else {
      current.blocks.push(block)
    }
  }
  if (current.rail.length > 0 || current.blocks.length > 0) segments.push(current)
  return segments
}

function Caption({ value, className = '' }: { value: any; className?: string }) {
  if (!value.caption && !value.credit) return null
  return (
    <figcaption className={`mt-3 text-sm leading-[1.45] text-navy/80 ${className}`}>
      {value.caption}
      {value.credit && <span className={value.caption ? 'ml-1' : ''}>Foto: {value.credit}</span>}
    </figcaption>
  )
}

function FactBox({ value, bg }: { value: any; bg: string }) {
  return (
    <Reveal as="aside" y={24} duration={0.8} className="p-6 tab:p-8 desk:p-6" style={{ backgroundColor: bg }}>
      <h3 className="font-display text-[26px] leading-[1.15] text-navy">{value.title || 'Faktaboks'}</h3>
      <div className="mt-4">
        <PortableText
          value={value.content}
          components={{
            block: {
              normal: ({ children }) => (
                <p className="mb-3 text-base leading-[1.6] text-navy last:mb-0">{children}</p>
              ),
            },
            list: {
              bullet: ({ children }) => (
                <ul className="mb-3 list-none space-y-2 pl-0 last:mb-0">{children}</ul>
              ),
            },
            listItem: {
              bullet: ({ children }) => (
                <li className="flex items-baseline gap-3 text-base leading-[1.6] text-navy">
                  <span className="mt-[0.4em] h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                  <span>{children}</span>
                </li>
              ),
            },
            marks: {
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              link: ({ children, value: mark }) => (
                <a
                  href={mark?.href}
                  target={mark?.blank ? '_blank' : undefined}
                  rel={mark?.blank ? 'noopener noreferrer' : undefined}
                  className="underline underline-offset-[3px] hover:text-magenta"
                >
                  {children}
                </a>
              ),
            },
          }}
        />
      </div>
    </Reveal>
  )
}

function RailImage({ value }: { value: any }) {
  const dims = imageDims(value)
  return (
    <Reveal as="figure" y={24} duration={0.8} className="mx-auto max-w-[420px] desk:max-w-none">
      <Image
        src={naturalSrc(value, 1200)}
        alt={value.alt || ''}
        width={dims.width}
        height={dims.height}
        className="h-auto w-full"
        sizes="(min-width: 1200px) 363px, 420px"
      />
      <Caption value={value} />
    </Reveal>
  )
}

/**
 * Sitat: ordene stiger opp ett og ett, hvert bak sin egen usynlige kant, når
 * sitatet scrolles inn. Ordene lages av React (ikke delt opp i ettertid av et
 * skript) — ellers dupliseres teksten når siden oppdateres. Skjermlesere får
 * hele sitatet som én tekst. Ved «redusert bevegelse» står sitatet stille.
 */
function PullQuote({ text }: { text: string }) {
  const ref = useRef<HTMLQuoteElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(el.querySelectorAll('[data-word]'), {
        yPercent: 110,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    })
    return () => mm.revert()
  }, [text])

  // I forhåndsvisningen henger Sanity usynlige tegn på teksten (klikk-for-å-
  // redigere). De får bli igjen i skjermleserteksten, men fjernes fra ordene —
  // ellers deles de opp og Sanitys redigeringsverktøy klarer ikke å lese dem.
  const words = stegaClean(text).trim().split(/\s+/)
  return (
    <blockquote
      ref={ref}
      className="my-16 font-quote text-[30px] leading-[1.2] text-navy first:mt-0 desk:my-20 desk:text-[42px] desk:leading-[1.15]"
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <Fragment key={i}>
            {/* Litt luft over og under klippekanten, så aksenter og «g/j» ikke kuttes. */}
            <span className="-my-[0.15em] inline-block overflow-hidden py-[0.15em] align-top">
              <span data-word className="inline-block">
                {word}
              </span>
            </span>
            {i < words.length - 1 && ' '}
          </Fragment>
        ))}
      </span>
    </blockquote>
  )
}

const LINK = 'underline underline-offset-[3px] transition-colors hover:text-navy'

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <Reveal
        as="h2"
        y={18}
        duration={0.7}
        className="mb-4 mt-12 font-display text-[26px] font-bold leading-tight text-navy first:mt-0 desk:text-[32px]"
      >
        {children}
      </Reveal>
    ),
    h3: ({ children }) => (
      <Reveal
        as="h3"
        y={16}
        duration={0.65}
        className="mb-4 mt-12 font-display text-[22px] font-bold leading-tight text-navy first:mt-0 desk:text-[26px]"
      >
        {children}
      </Reveal>
    ),
    h4: ({ children }) => (
      <Reveal as="h4" y={12} duration={0.6} className="mb-3 mt-8 font-display text-xl font-bold text-navy first:mt-0">
        {children}
      </Reveal>
    ),
    blockquote: ({ value }) => (
      <PullQuote text={(value.children ?? []).map((c: any) => c.text ?? '').join('')} />
    ),
    normal: ({ children }) => (
      <Reveal as="p" y={10} duration={0.55} className="mb-4 text-lg leading-[1.6] text-navy desk:text-xl desk:leading-[1.65]">
        {children}
      </Reveal>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <Reveal as="ul" y={10} duration={0.55} className="mb-4 list-none space-y-2 pl-0">
        {children}
      </Reveal>
    ),
    number: ({ children }) => (
      <Reveal as="ol" y={10} duration={0.55} className="mb-4 list-decimal space-y-2 pl-6 text-lg leading-[1.6] text-navy desk:text-xl">
        {children}
      </Reveal>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex items-baseline gap-3 text-lg leading-[1.6] text-navy desk:text-xl">
        <span className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className={LINK}
        style={{ color: MAGENTA }}
      >
        {children}
      </a>
    ),
    internalLink: ({ children, value }) => (
      <Link href={`/artikler/${value?.slug?.current || ''}`} className={LINK} style={{ color: MAGENTA }}>
        {children}
      </Link>
    ),
  },
  types: {
    // Liggende og kvadratiske bilder: full tekstbredde, i originalformat.
    // (Stående bilder og faktabokser plukkes ut til høyrefeltet før de når hit.)
    image: ({ value }) => {
      if (!value?.asset) return null
      const dims = imageDims(value)
      return (
        <Reveal as="figure" y={24} duration={0.9} className="my-12 first:mt-0">
          <div className="-mx-5 tab:mx-0">
            <Image
              src={naturalSrc(value, 1600)}
              alt={value.alt || ''}
              width={dims.width}
              height={dims.height}
              className="h-auto w-full"
              sizes="(min-width: 1200px) 730px, 100vw"
            />
          </div>
          <Caption value={value} />
        </Reveal>
      )
    },
  },
}

interface PortableTextRendererProps {
  value: any[]
  accentColor?: AccentColor
}

export function PortableTextRenderer({ value, accentColor = 'navy' }: PortableTextRendererProps) {
  const boxBg = tint(HUES[ACCENT_HUE[accentColor] ?? 'navy'], 20)
  const renderRail = (block: any) =>
    block._type === 'inlineFactBox' ? (
      <FactBox key={block._key} value={block} bg={boxBg} />
    ) : (
      <RailImage key={block._key} value={block} />
    )

  return (
    <div className="flex flex-col gap-12">
      {toSegments(value).map((segment, i) => {
        // Høyrefelt-element uten tekst etter seg (sist i saken): vis det i tekstkolonnen.
        const alone = segment.blocks.length === 0
        return (
          <div key={i} className="grid gap-x-6 gap-y-12 desk:grid-cols-12 desk:items-start">
            {segment.rail.length > 0 && (
              <div
                className={`flex flex-col gap-6 ${
                  alone ? 'desk:col-span-7' : 'desk:col-span-4 desk:col-start-9 desk:row-start-1'
                }`}
              >
                {segment.rail.map(renderRail)}
              </div>
            )}
            {!alone && (
              <div className="min-w-0 desk:col-span-7 desk:col-start-1 desk:row-start-1 [&>*:last-child]:mb-0">
                <PortableText value={segment.blocks} components={components} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
