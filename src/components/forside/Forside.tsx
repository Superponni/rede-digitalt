import Image from 'next/image'
import Link from 'next/link'
import { coverSrc, type SanityImageRef } from '@/sanity/lib/imageHelpers'
import { ThemeBar } from '@/components/layout/ThemeBar'
import {
  ArticleCard,
  HairlineRow,
  PodcastCard,
  TagPill,
  cardLabel,
  type CardArticle,
  type HairlineItem,
} from '@/components/ui/Cards'
import { AutoplayVideo } from './AutoplayVideo'
import { noBreakNumbers, shortTeaser } from '@/lib/typography'
import { CARD_PALETTES, assignCardPalettes, weeklyShuffle, RULE, type CardPalette } from '@/lib/palette'

export interface FrontArticle extends CardArticle {
  publishedAt?: string
  frontpagePlacement?: 'top' | 'regular'
  editionId?: string
  credit?: string
  authorName?: string
}

interface ForsideProps {
  heroId?: string
  secondId?: string
  currentEdition: { _id: string; order?: string[] } | null
  articles: FrontArticle[]
  editorial: { _id: string; title: string; teaserText?: string } | null
  podcast: {
    _id: string
    title: string
    spotifyUrl?: string
    thumbnail?: SanityImageRef
    duration?: number
    episodeNumber?: number
  } | null
  tags: { _id: string; title: string; slug: { current: string } }[]
}

/** Stor sak: tekst i venstre fem kolonner, bilde i høyre seks. Hele blokka er én lenke. */
function BigStory({
  article,
  as: Heading = 'h2',
  priority = false,
  className = '',
}: {
  article: FrontArticle
  as?: 'h1' | 'h2'
  priority?: boolean
  className?: string
}) {
  const tag = cardLabel(article)
  const byline = [
    article.authorName && `Tekst: ${article.authorName}`,
    article.credit && `Foto: ${article.credit}`,
  ].filter(Boolean)
  const hasImage = Boolean(article.heroImage?.asset)
  return (
    <Link
      href={`/artikler/${article.slug.current}`}
      className={`group grid items-center gap-x-6 gap-y-8 desk:grid-cols-12 ${className}`}
    >
      <div className="flex flex-col gap-6 desk:col-span-5 desk:pl-6">
        {tag && <TagPill>{tag}</TagPill>}
        <Heading
          className="font-display text-[40px] leading-[1.08] tracking-[-0.01em] text-navy underline decoration-transparent decoration-2 underline-offset-[8px] transition-[text-decoration-color] duration-200 group-hover:decoration-current group-focus-visible:decoration-current desk:text-[64px] desk:leading-[1.05] desk:tracking-[-0.015em]"
          style={{ hyphens: 'auto', hyphenateLimitChars: '12 4 4' }}
        >
          {noBreakNumbers(article.title)}
        </Heading>
        {article.teaser && (
          <p className="line-clamp-4 font-serif text-[21px] font-medium leading-snug text-magenta desk:text-2xl">
            {shortTeaser(article.teaser, 160)}
          </p>
        )}
        {byline.length > 0 && (
          <p className="font-label text-[13px] font-medium tracking-[0.04em] text-magenta">
            {byline.join('  •  ')}
          </p>
        )}
      </div>
      {(hasImage || article.heroVideoUrl) && (
        <div className="relative -mx-5 aspect-[4/3] overflow-hidden tab:mx-0 desk:col-span-6 desk:col-start-7">
          {article.heroVideoUrl ? (
            <AutoplayVideo
              src={article.heroVideoUrl}
              poster={hasImage ? coverSrc(article.heroImage!, 4, 3, 2000) : undefined}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Image
              src={coverSrc(article.heroImage!, 4, 3, 2000)}
              alt={article.heroImage!.alt || ''}
              fill
              priority={priority}
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transform-none"
              sizes="(min-width: 1200px) 640px, 100vw"
            />
          )}
        </div>
      )}
    </Link>
  )
}

/** Rader med fargede kort, tre i bredden. Går ikke antallet opp, blir de siste bredere. */
function CardGrid({ articles, palettes }: { articles: FrontArticle[]; palettes: CardPalette[] }) {
  const n = articles.length
  const rest = n % 3
  // rest 2 → de to siste deler raden; rest 1 → de fire siste står to og to.
  const wideFrom = rest === 2 ? n - 2 : rest === 1 && n >= 4 ? n - 4 : n
  return (
    <div className="grid gap-6 tab:grid-cols-2 desk:grid-cols-12">
      {articles.map((article, i) => (
        <ArticleCard
          key={article._id}
          article={article}
          palette={palettes[i]}
          // Nettbrett har to kort i bredden: blir det ett til overs, fyller det raden.
          className={`${n % 2 === 1 && i === n - 1 ? 'tab:col-span-2' : ''} ${i >= wideFrom ? 'desk:col-span-6' : 'desk:col-span-4'}`}
          sizes={
            i >= wideFrom
              ? '(min-width: 1200px) 640px, (min-width: 720px) 50vw, 100vw'
              : '(min-width: 1200px) 420px, (min-width: 720px) 50vw, 100vw'
          }
        />
      ))}
    </div>
  )
}

/**
 * Forsiden, bygget etter malen og Elises plan (oktober 2026):
 *   1. Stor sak øverst — håndplukket (forside-dokumentet). Tomt felt ⇒ nyeste
 *      sak merket «toppraden», ellers nyeste sak.
 *   2. Hårstrek-rad: lederen + de to nyeste sakene.
 *   3. Fargede kort: resten av gjeldende utgave i trykkrekkefølge, med
 *      podkastkortet (nyeste episode) i første rad.
 *   4. Eldre saker — stokkes om én gang i uka.
 * En sak vises bare ett sted.
 */
export function Forside({
  heroId,
  secondId,
  currentEdition,
  articles,
  editorial,
  podcast,
  tags,
}: ForsideProps) {
  const byId = new Map(articles.map((a) => [a._id, a]))
  const order = currentEdition?.order ?? []
  // Plass i trykkrekkefølgen; saker utenfor lista havner bakerst.
  const printPos = (a: FrontArticle) => {
    const i = order.indexOf(a._id)
    return i === -1 ? Number.MAX_SAFE_INTEGER : i
  }

  // 1. Forsidesaken
  const hero =
    (heroId && byId.get(heroId)) ||
    articles.find((a) => a.frontpagePlacement === 'top') ||
    articles[0]
  const second = secondId && secondId !== hero?._id ? byId.get(secondId) : undefined
  const used = new Set([hero?._id, second?._id].filter(Boolean) as string[])

  // 2. De to nyeste. `articles` er alt sortert nyeste først; en hel utgave
  // har samme dato, så ved likhet avgjør trykkrekkefølgen.
  const newest = articles
    .filter((a) => !used.has(a._id))
    .sort(
      (a, b) =>
        (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') || printPos(a) - printPos(b),
    )
    .slice(0, 2)
  newest.forEach((a) => used.add(a._id))

  const hairline: HairlineItem[] = [
    ...(editorial
      ? [{ key: editorial._id, href: '/leder', tag: 'Leder', title: editorial.title, teaser: editorial.teaserText }]
      : []),
    ...newest.map((a) => ({
      key: a._id,
      href: `/artikler/${a.slug.current}`,
      tag: cardLabel(a),
      title: a.title,
      teaser: a.teaser,
    })),
  ]

  // 3. Resten av gjeldende utgave, i trykkrekkefølge
  const editionCards = articles
    .filter((a) => !used.has(a._id) && currentEdition && a.editionId === currentEdition._id)
    .sort((a, b) => printPos(a) - printPos(b))
  editionCards.forEach((a) => used.add(a._id))

  // Podkastkortet deler første rad med ett sakskort. Det kortet skal ikke
  // være lilla (podkastkortet er lilla).
  const beside = podcast ? editionCards[0] : undefined
  const gridCards = beside ? editionCards.slice(1) : editionCards
  let besidePalette = beside ? assignCardPalettes([beside])[0] : undefined
  if (besidePalette?.key === 'purple' && !beside?.cardColor) besidePalette = CARD_PALETTES.find((p) => p.key === 'navy')
  const gridPalettes = assignCardPalettes(gridCards)
  // Stor sak nr. 2 legges etter første hele rad med kort.
  const splitAt = second ? Math.min(3, gridCards.length) : gridCards.length

  // 4. Eldre saker, ny rekkefølge hver uke
  const older = weeklyShuffle(articles.filter((a) => !used.has(a._id))).slice(0, 9)
  const olderPalettes = assignCardPalettes(older)

  const podcastMeta = podcast
    ? [
        podcast.episodeNumber ? `Ep. ${podcast.episodeNumber}` : '',
        podcast.duration ? `${podcast.duration} min` : '',
      ].filter(Boolean)
    : []

  return (
    <div className="wrap pb-14 pt-[69px] tab:pb-24 tab:pt-[109px]">
      <ThemeBar tags={tags} />

      {hero && <BigStory article={hero} as="h1" priority className="pt-10 tab:pt-16" />}

      {hairline.length > 0 && (
        <section className="mt-10 tab:mt-16" aria-label="Siste saker">
          <HairlineRow items={hairline} />
        </section>
      )}

      {(beside || podcast || gridCards.length > 0) && (
        <section className="mt-12 flex flex-col gap-6" aria-label="I denne utgaven">
          {(beside || podcast) && (
            <div className="grid gap-6 desk:grid-cols-12">
              {beside && besidePalette && (
                <ArticleCard
                  article={beside}
                  palette={besidePalette}
                  showTeaser
                  className="desk:col-span-4"
                />
              )}
              {podcast && (
                <PodcastCard
                  title={podcast.title}
                  href={podcast.spotifyUrl}
                  cover={podcast.thumbnail}
                  meta={podcastMeta}
                  className={beside ? 'desk:col-span-8' : 'desk:col-span-12'}
                />
              )}
            </div>
          )}
          {splitAt > 0 && (
            <CardGrid articles={gridCards.slice(0, splitAt)} palettes={gridPalettes.slice(0, splitAt)} />
          )}
        </section>
      )}

      {second && (
        <section
          className="mt-10 border-y py-10 tab:mt-16 tab:py-16"
          style={{ borderColor: RULE }}
        >
          <BigStory article={second} />
        </section>
      )}

      {gridCards.length > splitAt && (
        <section className="mt-12">
          <CardGrid articles={gridCards.slice(splitAt)} palettes={gridPalettes.slice(splitAt)} />
        </section>
      )}

      {older.length > 0 && (
        <section className="mt-14 tab:mt-24" aria-labelledby="flere-saker">
          <h2 id="flere-saker" className="label mb-6 border-t pt-5 tracking-[0.1em] text-navy/70" style={{ borderColor: RULE }}>
            Flere saker
          </h2>
          <CardGrid articles={older} palettes={olderPalettes} />
        </section>
      )}
    </div>
  )
}
