import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { coverSrc, type SanityImageRef } from '@/sanity/lib/imageHelpers'
import { AutoplayVideo } from '@/components/forside/AutoplayVideo'
import { noBreakNumbers, shortTeaser } from '@/lib/typography'
import { HUES, MAGENTA, RULE, tint, type CardPalette } from '@/lib/palette'

/**
 * Kortene fra malen (høsten 2026). Hele kortet er én lenke, og hele kortet
 * svarer på hover: flaten blir ett trinn dypere, tittelen understrekes, pilen
 * glir og bildet zoomer svakt inne i en fast ramme. Ingen skygger, ingen løft,
 * firkantede hjørner. Ved «redusert bevegelse» beholdes farge og understrek.
 */

const EASE = 'ease-[cubic-bezier(0.22,0.61,0.36,1)]'

// Lange enkeltord («Forsvarsrunden») skal orddeles innenfor kortet i stedet
// for å renne ut over kanten; bare ord på 12+ tegn deles.
const TITLE_BREAK: CSSProperties = { hyphens: 'auto', hyphenateLimitChars: '12 4 4' }

// Linjebegrensningen (line-clamp) klipper alt utenfor boksen — også ringen på
// «Å» og aksenter over store bokstaver i Eczar. Litt luft på toppen (som tas
// igjen med negativ marg) holder dem synlige uten å flytte tittelen.
const TITLE_HOVER = `underline decoration-transparent decoration-2 underline-offset-[6px] transition-[text-decoration-color] duration-200 ${EASE} group-hover:decoration-current group-focus-visible:decoration-current`

/** Kategoritagg — pilleform, gråblå som standard. */
export function TagPill({
  children,
  bg = 'var(--color-navy-30)',
  color = 'var(--color-navy)',
  className = '',
}: {
  children: ReactNode
  bg?: string
  color?: string
  className?: string
}) {
  return (
    <span
      className={`label inline-flex h-7 items-center self-start rounded-full px-3.5 ${className}`}
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-[18px] w-[18px]" aria-hidden>
      <path d="M3.5 10h13M11 4.5 16.5 10 11 15.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** «Les saken» + pilsirkel. Kun et visuelt signal — kortet er lenken. */
function CardCta({
  label,
  circle,
  glyph,
  text = 'Les saken',
}: {
  label: string
  circle: string
  glyph: string
  text?: string
}) {
  return (
    <span className="flex items-center gap-3" aria-hidden>
      <span className="label" style={{ color: label }}>
        {text}
      </span>
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-200 desk:h-10 desk:w-10 ${EASE} group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 motion-reduce:transform-none`}
        style={{ backgroundColor: circle, color: glyph }}
      >
        <Arrow />
      </span>
    </span>
  )
}

export interface CardArticle {
  _id: string
  title: string
  slug: { current: string }
  teaser?: string
  heroImage?: SanityImageRef
  heroVideoUrl?: string
  tags?: { _id: string; title: string }[]
  /** Håndvalgt kortpalett fra Studio (tom = trekkes automatisk). */
  cardColor?: string
}

/** Teksten i pillen på et kort: første tema, om ikke annet er oppgitt. */
export function cardLabel(article: Pick<CardArticle, 'tags'>, override?: string) {
  return override ?? article.tags?.[0]?.title
}

/**
 * Farget sakskort. Har saken bilde, blir det et bildekort (bildet går helt ut
 * i kortets kanter, «Les saken» ligger på bildet). Uten bilde blir det et
 * tekstkort med ingress. Paletten bestemmer alle farger.
 */
export function ArticleCard({
  article,
  palette,
  tag,
  showTeaser = false,
  large = false,
  sizes = '(min-width: 1200px) 33vw, (min-width: 720px) 50vw, 100vw',
  className = '',
}: {
  article: CardArticle
  palette: CardPalette
  /** Overstyr taggen (temasiden viser det aktive temaet). */
  tag?: string
  showTeaser?: boolean
  /** Større variant til toppsakene på forsiden: bildet øverst, så større tittel
   *  og ingress på den fargede flaten under. */
  large?: boolean
  sizes?: string
  className?: string
}) {
  const label = cardLabel(article, tag)
  const hasImage = Boolean(article.heroImage?.asset)
  const hasMedia = hasImage || Boolean(article.heroVideoUrl)
  const teaser = (showTeaser || !hasMedia) && article.teaser

  return (
    <Link
      href={`/artikler/${article.slug.current}`}
      className={`group flex min-h-[280px] flex-col bg-[var(--card-bg)] transition-colors duration-200 ${EASE} hover:bg-[var(--card-hover)] focus-visible:bg-[var(--card-hover)] active:scale-[0.98] motion-reduce:active:scale-100 ${className}`}
      style={{ '--card-bg': palette.bg, '--card-hover': palette.bgHover } as CSSProperties}
    >
      <div className={`flex flex-col gap-4 ${large ? 'order-2 flex-1 p-6 desk:p-7' : 'p-6'}`}>
        {label && (
          <TagPill bg={palette.tagBg} color={palette.tagText}>
            {label}
          </TagPill>
        )}
        <h3
          className={`-mt-[0.2em] line-clamp-3 pt-[0.2em] font-display ${large ? 'text-[30px] leading-[1.1] desk:text-[40px]' : 'text-[26px] leading-[1.15] desk:text-[32px]'} ${TITLE_HOVER}`}
          style={{ color: palette.title, ...TITLE_BREAK }}
        >
          {noBreakNumbers(article.title)}
        </h3>
        {teaser && (
          <p
            className={`${large ? 'text-[17px] desk:text-[19px]' : 'text-[17px]'} leading-normal ${hasMedia ? 'line-clamp-3' : 'line-clamp-4'}`}
            style={{ color: palette.text, textWrap: 'balance' }}
          >
            {shortTeaser(teaser, 110)}
          </p>
        )}
        {large && hasMedia && (
          <div className="mt-auto flex justify-end pt-2">
            <CardCta label={palette.ctaLabel} circle={palette.cta} glyph={palette.ctaGlyph} />
          </div>
        )}
      </div>

      {hasMedia ? (
        <div className={`relative overflow-hidden ${large ? 'order-1 aspect-[4/3] desk:aspect-[4/5]' : 'mt-auto aspect-[4/3]'}`}>
          {article.heroVideoUrl ? (
            <AutoplayVideo
              src={article.heroVideoUrl}
              poster={hasImage ? coverSrc(article.heroImage!, 4, 3, 1200) : undefined}
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 ${EASE} group-hover:scale-[1.04] motion-reduce:transform-none`}
            />
          ) : (
            <Image
              src={coverSrc(article.heroImage!, 4, 3, 1200)}
              alt={article.heroImage!.alt || ''}
              fill
              className={`object-cover transition-transform duration-300 ${EASE} group-hover:scale-[1.04] motion-reduce:transform-none`}
              sizes={sizes}
            />
          )}
          {/* På bildet ligger «Les saken» i en hvit pille — hvit tekst rett på
              bildet (som i malen) forsvinner på lyse foto og illustrasjoner.
              Store kort har knappen på fargeflaten i stedet. */}
          {!large && (
            <span
              className={`label pointer-events-none absolute bottom-4 right-4 flex h-11 items-center gap-2.5 rounded-full bg-white pl-4 pr-3 transition-transform duration-200 desk:h-10 ${EASE} group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 motion-reduce:transform-none`}
              style={{ color: palette.ink }}
              aria-hidden
            >
              Les saken
              <Arrow />
            </span>
          )}
        </div>
      ) : (
        <div className="mt-auto flex justify-end p-6 pt-0">
          <CardCta label={palette.ctaLabel} circle={palette.cta} glyph={palette.ctaGlyph} />
        </div>
      )}
    </Link>
  )
}

/* ── Hårstrek-kort («Les også» og raden under forsidesaken) ─────────────────
   Ingen flate, ingen bilde. Tre i bredden, delt av hårstreker. */

export interface HairlineItem {
  key: string
  href: string
  tag?: string
  title: string
  teaser?: string
}

export function HairlineRow({ items }: { items: HairlineItem[] }) {
  if (items.length === 0) return null
  const cols = items.length >= 3 ? 'tab:grid-cols-3' : items.length === 2 ? 'tab:grid-cols-2' : ''
  return (
    <div
      className={`grid divide-y border-y tab:divide-x tab:divide-y-0 ${cols}`}
      style={{ borderColor: RULE, '--tw-divide-opacity': 1 } as CSSProperties}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`group flex flex-col gap-4 px-0 py-8 transition-colors duration-200 tab:px-6 ${EASE} hover:bg-navy-10 focus-visible:bg-navy-10`}
          style={{ borderColor: RULE }}
        >
          {item.tag && <TagPill>{item.tag}</TagPill>}
          <h3
            className={`font-display text-2xl leading-[1.2] text-navy desk:text-[28px] ${TITLE_HOVER}`}
            style={TITLE_BREAK}
          >
            {noBreakNumbers(item.title)}
          </h3>
          {item.teaser && (
            <p
              className="line-clamp-5 font-serif text-base font-medium leading-normal"
              style={{ color: MAGENTA, textWrap: 'balance' }}
            >
              {shortTeaser(item.teaser, 110)}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}

/* ── Lederkort ──────────────────────────────────────────────────────────────
   Hel marineblå flate uten bilde. Står ved siden av podkastkortet. */

export function EditorialCard({
  title,
  teaser,
  className = '',
}: {
  title: string
  teaser?: string
  className?: string
}) {
  return (
    <Link
      href="/leder"
      className={`group flex min-h-[280px] flex-col gap-4 bg-navy p-6 transition-colors duration-200 ${EASE} hover:bg-[#0A4473] focus-visible:bg-[#0A4473] ${className}`}
    >
      <TagPill bg="rgba(255,255,255,0.22)" color="#FFFFFF">
        Leder
      </TagPill>
      <h3
        className={`-mt-[0.2em] pt-[0.2em] font-display text-[26px] leading-[1.15] desk:text-[32px] ${TITLE_HOVER}`}
        style={{ color: tint(HUES.lightblue, 20), ...TITLE_BREAK }}
      >
        {noBreakNumbers(title)}
      </h3>
      {teaser && (
        <p
          className="line-clamp-4 font-serif text-[17px] font-medium leading-snug text-white/85 desk:text-[19px]"
          style={{ textWrap: 'pretty' }}
        >
          {shortTeaser(teaser, 180)}
        </p>
      )}
      <div className="mt-auto flex justify-end pt-2">
        <CardCta label="#FFFFFF" circle="#FFFFFF" glyph={HUES.navy} text="Les lederen" />
      </div>
    </Link>
  )
}

/* ── Videokort ──────────────────────────────────────────────────────────────
   Full bredde, hel grønnblå flate (#028C7B) med hvit tekst. Stillbilde 16:9 med avspillingsknapp til
   venstre, tittel og beskrivelse til høyre. Lenker til videosiden — videoen
   spilles ikke av på forsiden. */

export function VideoCard({
  title,
  href,
  cover,
  teaser,
  meta,
  className = '',
}: {
  title: string
  href: string
  cover?: SanityImageRef
  teaser?: string
  meta: string[]
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`group grid gap-6 bg-[#028C7B] p-6 transition-colors duration-200 tab:gap-8 desk:grid-cols-[7fr_5fr] desk:items-center ${EASE} hover:bg-[#027A6B] focus-visible:bg-[#027A6B] ${className}`}
    >
      <div className="relative -mx-6 -mt-6 aspect-video overflow-hidden bg-[#026358] desk:m-0">
        {cover?.asset && (
          <Image
            src={coverSrc(cover, 16, 9, 1600)}
            alt={cover.alt || ''}
            fill
            className={`object-cover transition-transform duration-300 ${EASE} group-hover:scale-[1.04] motion-reduce:transform-none`}
            sizes="(min-width: 1200px) 760px, 100vw"
          />
        )}
        <span
          className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white transition-transform duration-200 tab:h-20 tab:w-20 ${EASE} group-hover:scale-[1.07] motion-reduce:transform-none`}
          style={{ color: '#028C7B' }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7 tab:h-8 tab:w-8">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <div className="flex flex-col gap-4 desk:pr-4">
        <TagPill bg="rgba(255,255,255,0.22)" color="#FFFFFF">
          Video
        </TagPill>
        <h3
          className={`-mt-[0.2em] pt-[0.2em] font-display text-[32px] leading-[1.05] desk:text-[44px] ${TITLE_HOVER}`}
          style={{ color: '#FFFFFF', ...TITLE_BREAK }}
        >
          {noBreakNumbers(title)}
        </h3>
        {teaser && (
          <p className="line-clamp-4 text-[17px] leading-normal text-white" style={{ textWrap: 'pretty' }}>
            {shortTeaser(teaser, 180)}
          </p>
        )}
        <span className="mt-2 flex items-center gap-3">
          <span className="label text-white">Se videoen</span>
          {meta.length > 0 && (
            <span className="font-label text-[13px] font-medium tracking-[0.04em] text-white/90">
              {meta.join('  •  ')}
            </span>
          )}
        </span>
      </div>
    </Link>
  )
}

/* ── Podkastkort ────────────────────────────────────────────────────────────
   Dobbel bredde, hel lilla flate. Omslag 1:1 til venstre, tittel til høyre. */

export function PodcastCard({
  title,
  href,
  cover,
  meta,
  className = '',
}: {
  title: string
  href?: string
  cover?: SanityImageRef
  meta: string[]
  className?: string
}) {
  const inner = (
    <>
      <div className="flex flex-col gap-6">
        <TagPill bg="rgba(255,255,255,0.22)" color="#FFFFFF">
          Podkast
        </TagPill>
        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: '#7B4189' }}>
          {cover?.asset && (
            <Image
              src={coverSrc(cover, 1, 1, 900)}
              alt=""
              fill
              className={`object-cover transition-transform duration-300 ${EASE} group-hover:scale-[1.04] motion-reduce:transform-none`}
              sizes="(min-width: 1200px) 25vw, (min-width: 720px) 40vw, 100vw"
            />
          )}
        </div>
      </div>
      <div className="flex flex-col justify-center gap-4">
        <h3
          className={`font-display text-[32px] leading-[1.05] desk:text-[44px] ${TITLE_HOVER}`}
          style={{ color: tint(HUES.lightblue, 20), ...TITLE_BREAK }}
        >
          {noBreakNumbers(title)}
        </h3>
        {meta.length > 0 && (
          <p
            className="font-label text-[13px] font-medium tracking-[0.04em]"
            style={{ color: tint(HUES.purple, 20) }}
          >
            {meta.join('  •  ')}
          </p>
        )}
        <span className="mt-2 flex items-center gap-3.5">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 ${EASE} group-hover:scale-[1.07] motion-reduce:transform-none`}
            style={{ backgroundColor: tint(HUES.magenta, 30), color: HUES.purple }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-base text-white">Hør episoden</span>
        </span>
      </div>
    </>
  )
  const cls = `group grid min-h-[280px] gap-6 bg-purple p-6 transition-colors duration-200 tab:grid-cols-[5fr_7fr] tab:gap-8 ${EASE} hover:bg-[#763E84] focus-visible:bg-[#763E84] ${className}`
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  )
}
