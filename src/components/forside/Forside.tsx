import Image from 'next/image'
import Link from 'next/link'
import { coverSrc, type SanityImageRef } from '@/sanity/lib/imageHelpers'
import { ThemeBar } from '@/components/layout/ThemeBar'
import {
  ArticleCard,
  EditorialCard,
  PodcastCard,
  VideoCard,
  TagPill,
  cardLabel,
  type CardArticle,
} from '@/components/ui/Cards'
import { AutoplayVideo } from './AutoplayVideo'
import { formatDuration, noBreakNumbers, shortTeaser } from '@/lib/typography'
import { assignCardPalettes, weeklyShuffle, RULE, type CardPalette } from '@/lib/palette'

export interface FrontArticle extends CardArticle {
  publishedAt?: string
  frontpagePlacement?: 'top' | 'regular'
  editionId?: string
  credit?: string
  authorName?: string
}

interface ForsideProps {
  topIds?: string[]
  featureId?: string
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
  video: {
    _id: string
    title: string
    slug: { current: string }
    description?: string
    thumbnail?: SanityImageRef
    duration?: number
  } | null
  tags: { _id: string; title: string; slug: { current: string } }[]
}

/**
 * Stor sak: tekst i fem kolonner, bilde i seks. Hele blokka er én lenke.
 * `flip` legger bildet til venstre (desktop), så to store saker på samme side
 * ikke blir like.
 */
function BigStory({ article, flip = false }: { article: FrontArticle; flip?: boolean }) {
  const tag = cardLabel(article)
  const byline = [
    article.authorName && `Tekst: ${article.authorName}`,
    article.credit && `Foto: ${article.credit}`,
  ].filter(Boolean)
  const hasImage = Boolean(article.heroImage?.asset)
  return (
    <Link
      href={`/artikler/${article.slug.current}`}
      className="group grid items-center gap-x-6 gap-y-8 desk:grid-cols-12"
    >
      <div
        className={`flex flex-col gap-6 desk:col-span-5 ${flip ? 'desk:col-start-8 desk:row-start-1 desk:pr-6' : 'desk:pl-6'}`}
      >
        {tag && <TagPill>{tag}</TagPill>}
        <h2
          className="font-display text-[40px] leading-[1.08] tracking-[-0.01em] text-navy underline decoration-transparent decoration-2 underline-offset-[8px] transition-[text-decoration-color] duration-200 group-hover:decoration-current group-focus-visible:decoration-current desk:text-[64px] desk:leading-[1.05] desk:tracking-[-0.015em]"
          style={{ hyphens: 'auto', hyphenateLimitChars: '12 4 4' }}
        >
          {noBreakNumbers(article.title)}
        </h2>
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
        <div
          className={`relative -mx-5 aspect-[4/3] overflow-hidden tab:mx-0 desk:col-span-6 ${flip ? 'desk:col-start-1 desk:row-start-1' : 'desk:col-start-7'}`}
        >
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
 * Forsiden (justert etter tilbakemelding oktober 2026 — «for få bilder øverst»):
 *   1. Tre toppsaker som store fargede kort. Håndplukket på forside-
 *      dokumentet; tomme plasser fylles med saker merket «toppraden», så de
 *      nyeste i trykkrekkefølge.
 *   2. Lederen (marineblått kort uten bilde) og podkasten side om side.
 *   3. Videokort (nyeste video) i full bredde.
 *   4. Fargede kort: først resten av gjeldende utgave i trykkrekkefølge, så
 *      eldre saker (stokkes om én gang i uka). Etter første rad står én stor
 *      sak mellom to linjer — håndplukket, ellers neste sak i rekka. Etter to
 *      rader til kommer stor sak nr. 2 (speilvendt), så de siste kortene.
 * En sak vises bare ett sted.
 */
export function Forside({
  topIds = [],
  featureId,
  currentEdition,
  articles,
  editorial,
  podcast,
  video,
  tags,
}: ForsideProps) {
  const byId = new Map(articles.map((a) => [a._id, a]))
  const order = currentEdition?.order ?? []
  // Plass i trykkrekkefølgen; saker utenfor lista havner bakerst.
  const printPos = (a: FrontArticle) => {
    const i = order.indexOf(a._id)
    return i === -1 ? Number.MAX_SAFE_INTEGER : i
  }
  // Nyeste først; en hel utgave har samme dato, så ved likhet avgjør trykkrekkefølgen.
  const newestFirst = [...articles].sort(
    (a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') || printPos(a) - printPos(b),
  )

  // 1. Toppsakene
  const top: FrontArticle[] = []
  const used = new Set<string>()
  const take = (a: FrontArticle | undefined) => {
    if (a && !used.has(a._id) && top.length < 3) {
      top.push(a)
      used.add(a._id)
    }
  }
  topIds.forEach((id) => take(byId.get(id)))
  newestFirst.filter((a) => a.frontpagePlacement === 'top').forEach(take)
  newestFirst.forEach(take)

  // Første rad grenser til lederkortet (marineblått) under.
  const topPalettes = assignCardPalettes(top, 3, { avoidEdge: ['navy'] })

  // 4. Resten av gjeldende utgave i trykkrekkefølge, så eldre saker med ny
  // rekkefølge hver uke — alt i ett rutenett, så fargereglene gjelder på tvers.
  const editionRest = articles
    .filter((a) => !used.has(a._id) && currentEdition && a.editionId === currentEdition._id)
    .sort((a, b) => printPos(a) - printPos(b))
  const picked = featureId && !used.has(featureId) ? byId.get(featureId) : undefined
  if (picked) used.add(picked._id)
  editionRest.filter((a) => a._id !== picked?._id).forEach((a) => used.add(a._id))
  const older = weeklyShuffle(articles.filter((a) => !used.has(a._id))).slice(0, 14)
  const queue = [...editionRest.filter((a) => a._id !== picked?._id), ...older]
  // Ikke håndplukket: den store saken er den første etter første rad.
  const feature = picked ?? queue[3]
  const afterFeature = queue.filter((a) => a._id !== feature?._id)
  // Stor sak nr. 2 kommer etter to rader til — alltid automatisk.
  const feature2 = afterFeature[9]
  const cards = afterFeature.filter((a) => a._id !== feature2?._id).slice(0, 12)
  const firstRow = cards.slice(0, 3)
  const middleCards = cards.slice(3, 9)
  const lastCards = cards.slice(9)
  // Raden under videokortet skal ikke få videokortets farge.
  const firstRowPalettes = assignCardPalettes(firstRow, 3, { avoidEdge: video ? ['deepteal'] : [] })
  const middlePalettes = assignCardPalettes(middleCards)
  const lastPalettes = assignCardPalettes(lastCards)

  const podcastMeta = podcast
    ? [
        podcast.episodeNumber ? `Ep. ${podcast.episodeNumber}` : '',
        podcast.duration ? `${podcast.duration} min` : '',
      ].filter(Boolean)
    : []

  return (
    <div className="wrap pb-14 pt-[69px] tab:pb-24 tab:pt-[109px]">
      <ThemeBar tags={tags} />

      {top.length > 0 && (
        <section className="pt-10 tab:pt-16" aria-label="Toppsaker">
          <h1 className="sr-only">Rede – et magasin for TOBB-medlemmer</h1>
          <div className="grid gap-6 tab:grid-cols-2 desk:grid-cols-3">
            {top.map((a, i) => (
              <ArticleCard
                key={a._id}
                article={a}
                palette={topPalettes[i]}
                large
                showTeaser
                // Nettbrett: første sak over hele bredden, de to neste side om side.
                className={i === 0 && top.length !== 2 ? 'tab:col-span-2 desk:col-span-1' : ''}
                sizes="(min-width: 1200px) 420px, (min-width: 720px) 50vw, 100vw"
              />
            ))}
          </div>
        </section>
      )}

      {(editorial || podcast) && (
        <section className="mt-6 grid gap-6 desk:grid-cols-12" aria-label="Leder og podkast">
          {editorial && (
            <EditorialCard
              title={editorial.title}
              teaser={editorial.teaserText}
              className={podcast ? 'desk:col-span-5' : 'desk:col-span-12'}
            />
          )}
          {podcast && (
            <PodcastCard
              title={podcast.title}
              href={podcast.spotifyUrl}
              cover={podcast.thumbnail}
              meta={podcastMeta}
              className={editorial ? 'desk:col-span-7' : 'desk:col-span-12'}
            />
          )}
        </section>
      )}

      {video && (
        <section className="mt-6" aria-label="Video">
          <VideoCard
            title={video.title}
            href={`/video/${video.slug.current}`}
            cover={video.thumbnail}
            teaser={video.description?.split(/\n\s*\n/)[0]}
            meta={[formatDuration(video.duration)].filter(Boolean) as string[]}
          />
        </section>
      )}

      {firstRow.length > 0 && (
        <section className="mt-6" aria-label="Flere saker">
          <CardGrid articles={firstRow} palettes={firstRowPalettes} />
        </section>
      )}

      {feature && (
        <section className="mt-10 border-y py-10 tab:mt-16 tab:py-16" style={{ borderColor: RULE }}>
          <BigStory article={feature} />
        </section>
      )}

      {middleCards.length > 0 && (
        <section className="mt-10 tab:mt-16" aria-label="Enda flere saker">
          <CardGrid articles={middleCards} palettes={middlePalettes} />
        </section>
      )}

      {feature2 && (
        <section className="mt-10 border-y py-10 tab:mt-16 tab:py-16" style={{ borderColor: RULE }}>
          <BigStory article={feature2} flip />
        </section>
      )}

      {lastCards.length > 0 && (
        <section className="mt-10 tab:mt-16" aria-label="Eldre saker">
          <CardGrid articles={lastCards} palettes={lastPalettes} />
        </section>
      )}
    </div>
  )
}
