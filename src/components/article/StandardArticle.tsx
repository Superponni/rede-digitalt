import { naturalSrc, coverSrc, imageDims, focalPosition } from '@/sanity/lib/imageHelpers'
import { PortableTextRenderer } from './PortableTextRenderer'
import { AudioPlayer } from './AudioPlayer'
import { Reveal } from './Reveal'
import { ArticleHeroImage } from './ArticleHeroImage'
import { ExpertRow, type ExpertItem } from './ExpertRow'
import { ArticleOutro } from './ArticleOutro'
import { SetHeaderSurface } from '@/components/layout/HeaderTheme'
import type { RelatedArticle } from '@/lib/related'
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
    experts?: ExpertItem[]
    heroImage?: { asset: { _ref: string }; alt?: string; credit?: string }
    body?: any[]
    audioFileUrl?: string
    tags?: { _id: string; title: string; slug: { current: string } }[]
    author?: { _id: string; name: string }
    edition?: { title: string; number: number; year: number }
  }
  // Liten etikett over tittelen (f.eks. «Leder») når saken ikke har emnetagger.
  eyebrow?: string
  related?: RelatedArticle[]
  primaryTag?: { title: string; slug?: { current: string } }
  shareUrl: string
}

export function StandardArticle({ article, eyebrow, related = [], primaryTag, shareUrl }: StandardArticleProps) {
  const theme = getArticleTheme(article.accentColor, article.colorMode)
  const hasHero = Boolean(article.heroImage?.asset)
  // Én eller flere ekspertkilder med portrett. Portrett-modus krever minst én.
  const experts = (article.experts ?? []).filter((e) => e.portrait?.asset)
  const hasExperts = experts.length > 0
  const layout: HeroLayout =
    article.heroLayout === 'portrait'
      ? hasExperts
        ? 'portrait'
        : 'none'
      : hasHero
        ? article.heroLayout || 'image-first'
        : 'none'
  // Toppbilde i full oppløsning og originalformat — next/image lager skarpe
  // varianter per skjermstørrelse. Fikser kornete heldekkende toppbilder.
  const heroSrc = article.heroImage?.asset ? naturalSrc(article.heroImage) : ''
  // Side-oppsettet bruker en fast stående 3/4-ramme, fokus-bevisst beskjært.
  const heroSideSrc = article.heroImage?.asset ? coverSrc(article.heroImage, 3, 4) : ''
  const heroAlt = article.heroImage?.alt || article.title
  const heroDims = imageDims(article.heroImage)
  const heroFocal = focalPosition(article.heroImage)

  // Magasin-logikk: venstrestilt KUN når tittel og bilde står ved siden av
  // hverandre. Når teksten står alene eller over/under bilde ⇒ midtstilt.
  const centered = layout !== 'side'

  // Ekspert-badge(r) vises oppå andre topp-oppsett (ikke i ren portrett-modus),
  // slik trykksaken gjør på saker med både illustrasjon og kilde-portrett.
  const showExpertBadge = layout !== 'portrait' && hasExperts

  const header = (
    <Reveal
      as="header"
      immediate
      y={22}
      duration={0.9}
      className={`mx-auto max-w-prose px-6 lg:px-0 ${centered ? 'text-center' : ''}`}
    >
      {showExpertBadge && (
        <div className="mb-5">
          <ExpertRow experts={experts} color={theme.title} fallbackAlt={article.title} />
        </div>
      )}

      {eyebrow && (
        <div className={`mb-4 ${centered ? 'flex justify-center' : ''}`}>
          <span
            className="inline-block rounded-sm px-3 py-1 font-heading text-[10px] uppercase tracking-[0.2em]"
            style={{ backgroundColor: theme.chipBg, color: theme.chipText }}
          >
            {eyebrow}
          </span>
        </div>
      )}

      {article.tags && article.tags.length > 0 && (
        <div className={`mb-4 flex flex-wrap gap-2 ${centered ? 'justify-center' : ''}`}>
          {article.tags.map((tag) => (
            <span
              key={tag._id}
              className="rounded-sm px-3 py-1 font-heading text-[10px] uppercase tracking-[0.2em]"
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

  // Menyfarge ut fra hva som faktisk ligger øverst: et heldekkende toppbilde
  // (image-first) gir mørk flate ⇒ hvit logo. Ellers følger den artikkelens
  // egen flate (mørk filled/dark ⇒ hvit, lys mint/tinted ⇒ marineblå logo).
  const headerSurface = layout === 'image-first' ? 'dark' : theme.isDark ? 'dark' : 'light'

  return (
    <article style={{ backgroundColor: theme.pageBg }}>
      <SetHeaderSurface surface={headerSurface} />
      {/* Topp */}
      {layout === 'image-first' && (
        <>
          {/* Heldekkende toppbilde, men høydebegrenset så tittelen alltid er
              synlig over folden. Fokuspunktet holder motivet i ramme. */}
          <div className="relative h-[58vh] w-full min-h-[380px] max-h-[820px] sm:h-[66vh] lg:h-[74vh]">
            <ArticleHeroImage
              src={heroSrc}
              alt={heroAlt}
              width={heroDims.width}
              height={heroDims.height}
              cover
              focal={heroFocal}
              priority
              sizes="100vw"
              className="h-full w-full"
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
            src={heroSideSrc}
            alt={heroAlt}
            width={heroDims.width}
            height={heroDims.height}
            priority
            aspect="3 / 4"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="mx-auto w-full max-w-md"
          />
        </div>
      )}

      {layout === 'portrait' && (
        <div className="pt-16 lg:pt-24">
          <Reveal immediate y={20} duration={0.9} className="mb-10 px-6">
            <ExpertRow experts={experts} color={theme.title} fallbackAlt={article.title} />
          </Reveal>
          {header}
        </div>
      )}

      {layout === 'none' && <div className="pt-16 lg:pt-28">{header}</div>}

      {/* Brødtekst */}
      {article.body && (
        <div className="mb-16 mt-12 lg:mb-24">
          <PortableTextRenderer value={article.body} theme={theme} />
        </div>
      )}

      {/* Veien videre — delt på tvers av alle artikkeltyper */}
      <ArticleOutro
        accentColor={article.accentColor}
        colorMode={article.colorMode}
        related={related}
        primaryTag={primaryTag}
        shareUrl={shareUrl}
        shareTitle={article.title}
      />
    </article>
  )
}
