import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { PortableTextRenderer } from './PortableTextRenderer'
import { AudioPlayer } from './AudioPlayer'
import { Reveal } from './Reveal'
import { ArticleHeroImage } from './ArticleHeroImage'
import { ExpertPortrait } from './ExpertPortrait'
import {
  getArticleTheme,
  type AccentColor,
  type ColorMode,
  type HeroLayout,
} from './theme'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StandardArticleProps {
  article: {
    _id: string
    title: string
    subtitle?: string
    teaser?: string
    accentColor?: AccentColor
    colorMode?: ColorMode
    heroLayout?: HeroLayout
    portraitName?: string
    portraitRole?: string
    expertPortrait?: { asset: { _ref: string }; alt?: string }
    heroImage?: { asset: { _ref: string }; alt?: string; credit?: string }
    body?: any[]
    audioFileUrl?: string
    tags?: { _id: string; title: string; slug: { current: string } }[]
    author?: { _id: string; name: string }
    edition?: { title: string; number: number; year: number }
  }
}

// Henter bildets egne pikseldimensjoner fra Sanity-asset-referansen
// (image-<hash>-<B>x<H>-<ext>) så vi kan beholde originalformatet.
function parseImageDims(ref?: string): { width: number; height: number } {
  const m = ref?.match(/-(\d+)x(\d+)-[a-z]+$/i)
  return m ? { width: Number(m[1]), height: Number(m[2]) } : { width: 1600, height: 1000 }
}

export function StandardArticle({ article }: StandardArticleProps) {
  const theme = getArticleTheme(article.accentColor, article.colorMode)
  const hasHero = Boolean(article.heroImage?.asset)
  const expert = article.expertPortrait?.asset ? article.expertPortrait : undefined
  // Portrett-modus kan kjøre på ekspertbildet alene (uten eget hovedbilde).
  const portraitImg = expert ?? article.heroImage
  const layout: HeroLayout =
    article.heroLayout === 'portrait'
      ? portraitImg?.asset
        ? 'portrait'
        : 'none'
      : hasHero
        ? article.heroLayout || 'image-first'
        : 'none'
  const heroSrc = article.heroImage?.asset ? urlFor(article.heroImage).width(1600).url() : ''
  const heroAlt = article.heroImage?.alt || article.title
  const heroDims = parseImageDims(article.heroImage?.asset?._ref)

  // Magasin-logikk: venstrestilt KUN når tittel og bilde står ved siden av
  // hverandre. Når teksten står alene eller over/under bilde ⇒ midtstilt.
  const centered = layout !== 'side'

  // Lite ekspert-badge vises oppå andre topp-oppsett (ikke i ren portrett-modus),
  // slik trykksaken gjør på saker med både illustrasjon og kilde-portrett.
  const showExpertBadge = layout !== 'portrait' && Boolean(expert)

  const header = (
    <Reveal
      as="header"
      immediate
      y={22}
      duration={0.9}
      className={`mx-auto max-w-prose px-6 lg:px-0 ${centered ? 'text-center' : ''}`}
    >
      {showExpertBadge && (
        <div className={`mb-5 ${centered ? 'mx-auto' : ''} w-[150px]`}>
          <ExpertPortrait
            image={expert!}
            alt={expert!.alt || article.portraitName || article.title}
            name={article.portraitName}
            role={article.portraitRole}
            color={theme.title}
            size="sm"
          />
        </div>
      )}

      {article.tags && article.tags.length > 0 && (
        <div className={`mb-4 flex flex-wrap gap-2 ${centered ? 'justify-center' : ''}`}>
          {article.tags.map((tag) => (
            <span
              key={tag._id}
              className="rounded-full px-3 py-1 font-heading text-[10px] uppercase tracking-[0.2em]"
              style={{ backgroundColor: theme.chipBg, color: theme.chipText }}
            >
              {tag.title}
            </span>
          ))}
        </div>
      )}

      <h1
        className="font-display text-4xl leading-[1.05] md:text-5xl lg:text-6xl"
        style={{ color: theme.title }}
      >
        {article.title}
      </h1>

      {article.subtitle && (
        <p
          className="mt-3 font-display text-2xl italic leading-tight md:text-3xl"
          style={{ color: theme.subtitle }}
        >
          {article.subtitle}
        </p>
      )}

      {article.teaser && (
        <p
          data-speakable
          className={`mt-5 font-heading text-lg font-bold leading-snug lg:text-xl ${
            centered ? 'mx-auto max-w-xl' : ''
          }`}
          style={{ color: theme.standfirst }}
        >
          {article.teaser}
        </p>
      )}

      <div
        className={`mt-6 flex items-center gap-4 border-t pt-4 text-sm ${
          centered ? 'justify-center' : ''
        }`}
        style={{ color: theme.muted, borderColor: theme.chipBg }}
      >
        {article.author && <span>Tekst: {article.author.name}</span>}
        {article.edition && (
          <span>
            Rede nr {article.edition.number} {article.edition.year}
          </span>
        )}
      </div>

      {article.audioFileUrl && (
        <div className="mt-6">
          <AudioPlayer src={article.audioFileUrl} theme={theme.isDark ? 'dark' : 'light'} />
        </div>
      )}
    </Reveal>
  )

  return (
    <article className="pb-20" style={{ backgroundColor: theme.pageBg }}>
      {/* Topp */}
      {layout === 'image-first' && (
        <>
          <div className="relative">
            <ArticleHeroImage
              src={heroSrc}
              alt={heroAlt}
              width={heroDims.width}
              height={heroDims.height}
              priority
              sizes="100vw"
              className="w-full"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to top, ${theme.pageBg}, transparent 55%)`,
              }}
            />
          </div>
          <div className="relative z-10 -mt-16">{header}</div>
        </>
      )}

      {layout === 'heading-first' && (
        <>
          <div className="pt-16 lg:pt-24">{header}</div>
          <ArticleHeroImage
            src={heroSrc}
            alt={heroAlt}
            width={heroDims.width}
            height={heroDims.height}
            sizes="(min-width: 1024px) 42rem, 100vw"
            className="mx-auto mt-10 w-full max-w-2xl lg:mt-12"
          />
        </>
      )}

      {layout === 'side' && (
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 pt-16 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pt-24">
          {header}
          <ArticleHeroImage
            src={heroSrc}
            alt={heroAlt}
            width={heroDims.width}
            height={heroDims.height}
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="w-full"
          />
        </div>
      )}

      {layout === 'portrait' && (
        <div className="pt-16 lg:pt-24">
          <Reveal immediate y={20} duration={0.9} className="mb-10 flex justify-center px-6">
            <ExpertPortrait
              image={portraitImg!}
              alt={portraitImg!.alt || article.portraitName || article.title}
              name={article.portraitName}
              role={article.portraitRole}
              color={theme.title}
            />
          </Reveal>
          {header}
        </div>
      )}

      {layout === 'none' && <div className="pt-16 lg:pt-28">{header}</div>}

      {/* Brødtekst */}
      {article.body && (
        <div className="mt-12">
          <PortableTextRenderer value={article.body} theme={theme} />
        </div>
      )}

      {/* Tilbake */}
      <div className="mx-auto mt-16 max-w-prose px-6 lg:px-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-heading text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
          style={{ color: theme.muted }}
        >
          <span>&larr;</span> Tilbake til forsiden
        </Link>
      </div>
    </article>
  )
}
