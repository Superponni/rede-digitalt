import Link from 'next/link'
import { naturalSrc, imageDims, focalPosition } from '@/sanity/lib/imageHelpers'
import { PortableTextRenderer } from './PortableTextRenderer'
import { AudioPlayer } from './AudioPlayer'
import { Reveal } from './Reveal'
import { ArticleHeroImage } from './ArticleHeroImage'
import { ExpertRow, type ExpertItem } from './ExpertRow'
import { ArticleOutro } from './ArticleOutro'
import { SetHeaderSurface } from '@/components/layout/HeaderTheme'
import type { RelatedArticle } from '@/lib/related'
import { noBreakNumbers } from '@/lib/typography'
import { NAVY } from '@/lib/palette'
import type { AccentColor, ColorMode, HeroLayout } from './theme'

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

// Aldri ett ord alene på siste linje: bind de to siste ordene sammen med et
// hardt mellomrom. Virker i alle nettlesere, også der `text-wrap: balance`
// ikke slår inn (lange ingresser på mobil).
function noOrphan(text: string): string {
  const i = text.trimEnd().lastIndexOf(' ')
  return i > 0 ? text.slice(0, i) + '\u00A0' + text.slice(i + 1) : text
}

const PILL =
  'label inline-flex h-7 items-center rounded-full bg-navy-30 px-3.5 text-navy transition-colors'

/**
 * Standardsak etter malen høsten 2026. Alle saker står på krem med marineblå
 * tekst og magenta ingress/byline — fargen skifter ikke fra sak til sak (det
 * er feature-sakene som har den friheten). Signaturfargen brukes bare på
 * faktaboksene i høyrefeltet.
 *
 * To topper:
 *   - «side»  (layout 1): tekst i kolonne 1–5, bilde i kolonne 7–12.
 *   - «full»  (layout 2): bilde i full bredde først, så midtstilt tekst.
 * Bildet vises i originalformat. Stående bilder får alltid «side», siden et
 * stående bilde i full bredde blir flere skjermhøyder.
 * I tillegg finnes «none» (ingen bilde) og «portrait» (rundt kildeportrett)
 * fra før — de har ingen plass i malen ennå og beholder midtstilt topp.
 */
export function StandardArticle({ article, eyebrow, related = [], primaryTag, shareUrl }: StandardArticleProps) {
  const hasHero = Boolean(article.heroImage?.asset)
  // Én eller flere ekspertkilder med portrett. Portrett-modus krever minst én.
  const experts = (article.experts ?? []).filter((e) => e.portrait?.asset)
  const hasExperts = experts.length > 0
  const heroDims = imageDims(article.heroImage)
  const heroIsUpright = heroDims.height > heroDims.width * 1.05

  const layout: 'side' | 'full' | 'none' | 'portrait' =
    article.heroLayout === 'portrait'
      ? hasExperts
        ? 'portrait'
        : 'none'
      : !hasHero || article.heroLayout === 'none'
        ? 'none'
        : article.heroLayout === 'image-first' && !heroIsUpright
          ? 'full'
          : 'side'

  // Toppbilde i full oppløsning og originalformat — next/image lager skarpe
  // varianter per skjermstørrelse.
  const heroSrc = hasHero ? naturalSrc(article.heroImage!) : ''
  const heroAlt = article.heroImage?.alt || article.title
  const heroFocal = focalPosition(article.heroImage)

  // Venstrestilt KUN når tittel og bilde står ved siden av hverandre.
  const centered = layout !== 'side'

  // Ekspert-badge(r) vises oppå andre topp-oppsett (ikke i ren portrett-modus),
  // slik trykksaken gjør på saker med både illustrasjon og kilde-portrett.
  const showExpertBadge = layout !== 'portrait' && hasExperts

  const byline = [
    article.author && `Tekst: ${article.author.name}`,
    article.heroImage?.credit && `Foto: ${article.heroImage.credit}`,
    article.edition && `Rede nr ${article.edition.number} ${article.edition.year}`,
  ].filter(Boolean)

  // På mobil og nettbrett er toppen venstrestilt (som i malen); midtstillingen
  // gjelder desktop. Rundt kildeportrett er midtstilt på alle størrelser.
  const ALIGN = {
    side: 'items-start',
    full: 'items-start desk:items-center desk:text-center',
    none: 'items-start desk:items-center desk:text-center',
    portrait: 'items-center text-center',
  } as const

  const header = (
    <Reveal
      as="header"
      immediate
      y={22}
      duration={0.9}
      className={`flex flex-col gap-6 ${ALIGN[layout]}`}
    >
      {showExpertBadge && <ExpertRow experts={experts} color={NAVY} fallbackAlt={article.title} />}

      {(eyebrow || (article.tags && article.tags.length > 0)) && (
        <div className={`flex flex-wrap gap-2 ${layout === 'portrait' ? 'justify-center' : centered ? 'desk:justify-center' : ''}`}>
          {eyebrow && <span className={PILL}>{eyebrow}</span>}
          {article.tags?.map((tag) => (
            <Link key={tag._id} href={`/tema/${tag.slug.current}`} className={`${PILL} hover:bg-[#9FB3C3]`}>
              {tag.title}
            </Link>
          ))}
        </div>
      )}

      <h1
        className="font-display text-[40px] leading-[1.08] tracking-[-0.01em] text-navy desk:text-[64px] desk:leading-[1.05] desk:tracking-[-0.015em]"
        style={{ textWrap: 'balance' }}
      >
        {noBreakNumbers(article.title)}
      </h1>

      {article.subtitle && (
        <p className="font-serif text-2xl italic leading-tight text-navy md:text-3xl" style={{ textWrap: 'balance' }}>
          {article.subtitle}
        </p>
      )}

      {article.teaser && (
        <p
          data-speakable
          className="font-serif text-[21px] font-medium leading-snug text-magenta desk:text-2xl"
          style={{ textWrap: 'pretty' }}
        >
          {noOrphan(article.teaser)}
        </p>
      )}

      {byline.length > 0 && (
        <p className="font-label text-[13px] font-medium leading-snug tracking-[0.04em] text-magenta">
          {byline.join('  •  ')}
        </p>
      )}

      {article.audioFileUrl && (
        <div className="w-full max-w-sm">
          <AudioPlayer src={article.audioFileUrl} theme="light" />
        </div>
      )}
    </Reveal>
  )

  return (
    <article className="bg-cream text-navy">
      <SetHeaderSurface surface="light" />
      <div className="wrap pb-14 pt-[69px] tab:pb-24 tab:pt-[109px]">
        {/* Topp */}
        {layout === 'side' && (
          <div className="grid items-center gap-x-6 gap-y-10 pt-10 tab:pt-16 desk:grid-cols-12">
            <div className="desk:col-span-5">{header}</div>
            <ArticleHeroImage
              src={heroSrc}
              alt={heroAlt}
              width={heroDims.width}
              height={heroDims.height}
              priority
              sizes="(min-width: 1200px) 640px, 100vw"
              className={`-mx-5 tab:mx-0 desk:col-span-6 desk:col-start-7 ${
                heroIsUpright ? 'tab:mx-auto tab:w-full tab:max-w-[520px] desk:max-w-none' : ''
              }`}
            />
          </div>
        )}

        {layout === 'full' && (
          <div className="flex flex-col gap-10 pt-10 tab:gap-16 tab:pt-16">
            {/* Bildet først på desktop, etter teksten på mobil. Originalformat,
                men aldri høyere enn ca. 70 % av skjermen — da beskjæres det rundt
                fokuspunktet, så tittelen ikke skyves langt under folden. */}
            <div
              className="relative order-2 -mx-5 max-h-[70vh] overflow-hidden tab:mx-0 tab:w-full desk:order-1"
              style={{ aspectRatio: `${heroDims.width} / ${heroDims.height}` }}
            >
              <ArticleHeroImage
                src={heroSrc}
                alt={heroAlt}
                width={heroDims.width}
                height={heroDims.height}
                cover
                focal={heroFocal}
                priority
                sizes="(min-width: 1440px) 1280px, 100vw"
                className="h-full w-full"
              />
            </div>
            <div className="order-1 desk:order-2 desk:mx-auto desk:w-2/3">{header}</div>
          </div>
        )}

        {layout === 'portrait' && (
          <div className="pt-10 tab:pt-16 desk:mx-auto desk:w-2/3">
            <Reveal immediate y={20} duration={0.9} className="mb-10">
              <ExpertRow experts={experts} color={NAVY} fallbackAlt={article.title} />
            </Reveal>
            {header}
          </div>
        )}

        {layout === 'none' && <div className="pt-10 tab:pt-16 desk:mx-auto desk:w-2/3">{header}</div>}

        {/* Brødtekst */}
        {article.body && (
          <div className="mt-14 tab:mt-24">
            <PortableTextRenderer value={article.body} accentColor={article.accentColor} />
          </div>
        )}
      </div>

      {/* Veien videre — delt på tvers av alle artikkeltyper */}
      <ArticleOutro
        related={related}
        primaryTag={primaryTag}
        shareUrl={shareUrl}
        shareTitle={article.title}
      />
    </article>
  )
}
