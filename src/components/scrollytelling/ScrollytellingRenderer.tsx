'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { ScrollTrigger } from '@/lib/gsap-config'
import { HeroSection } from './sections/HeroSection'
import { TextWithImage } from './sections/TextWithImage'
import { FullscreenParallax } from './sections/FullscreenParallax'
import { PullQuote } from './sections/PullQuote'
import { VideoSection } from './sections/VideoSection'
import { AudioSection } from './sections/AudioSection'
import { FactBox } from './sections/FactBox'
import { Gallery } from './sections/Gallery'
import { Collage } from './sections/Collage'
import { StatementPanel } from './sections/StatementPanel'
import { StickyPortrait } from './sections/StickyPortrait'
import { RecipeCard } from './sections/RecipeCard'
import { CountUpFact } from './sections/CountUpFact'
import { NumberedStop } from './sections/NumberedStop'
import { IllustratedCover } from './sections/IllustratedCover'
import { IllustratedScene } from './sections/IllustratedScene'
import { AnsiennitetSlider } from './sections/AnsiennitetSlider'
import { KoeSlider } from './sections/KoeSlider'
import { StickyVei } from './sections/StickyVei'
import { Veideling } from './sections/Veideling'
import { StorbyKart } from './sections/StorbyKart'
import { AnsiennitetSjekk } from './sections/AnsiennitetSjekk'
import { GifKort } from './sections/GifKort'
import { InteractiveQuiz } from './sections/InteractiveQuiz'
import { ProgressBar } from './ProgressBar'
import { ScrollyThemeProvider } from './ScrollyThemeContext'
import { ScrollyColorProvider, resolveScrollyColors } from './ScrollyColorContext'
import { type AccentColor, type ColorMode } from '@/components/article/theme'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface RelatedArticle {
  _id: string
  title: string
  slug: { current: string }
  type: string
  teaser?: string
  heroImage?: { asset: { _ref: string }; alt?: string }
  tags?: { _id: string; title: string }[]
}

interface ScrollytellingRendererProps {
  article: {
    _id: string
    title: string
    accentColor?: AccentColor
    colorMode?: ColorMode
    sections?: any[]
    audioFileUrl?: string
    tags?: { _id: string; title: string }[]
    author?: { _id: string; name: string; bio?: string }
    edition?: { _id: string; title: string; number: number; year: number }
  }
  relatedArticles?: RelatedArticle[]
}

const SECTION_MAP: Record<string, React.ComponentType<{ data: any; index: number }>> = {
  heroSection: HeroSection,
  textWithImage: TextWithImage,
  fullscreenParallax: FullscreenParallax,
  pullQuote: PullQuote,
  videoSection: VideoSection,
  audioSection: AudioSection,
  factBox: FactBox,
  gallery: Gallery,
  collage: Collage,
  statementPanel: StatementPanel,
  stickyPortrait: StickyPortrait,
  recipeCard: RecipeCard,
  countUpFact: CountUpFact,
  numberedStop: NumberedStop,
  illustratedCover: IllustratedCover,
  illustratedScene: IllustratedScene,
  ansiennitetSlider: AnsiennitetSlider,
  koeSlider: KoeSlider,
  stickyVei: StickyVei,
  veideling: Veideling,
  storbyKart: StorbyKart,
  ansiennitetSjekk: AnsiennitetSjekk,
  gifKort: GifKort,
  interactiveQuiz: InteractiveQuiz,
}

export function ScrollytellingRenderer({ article, relatedArticles = [] }: ScrollytellingRendererProps) {
  const sections = article.sections || []
  // Fargene følger NØYAKTIG samme system som standard-artikler: flaten og all
  // tekst utledes av accentColor + colorMode (trykksaken). Ingen scrolly-egne
  // fargevalg lenger.
  const colors = resolveScrollyColors(article.accentColor, article.colorMode)
  const bg = colors.bg

  // Animasjonenes triggere regnes ut ved mount, men sidehøyden vokser etterpå
  // (lazy-bilder lastes, hero pinnes, fonter byttes inn). Da blir posisjonene
  // utdaterte og seksjonene fyrer for sent. Vi tvinger en omberegning når bilder
  // og fonter faktisk er ferdige — det fikser «innhold laster etter at jeg har
  // forlatt vinduet» for ALLE seksjoner, ikke bare én.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const refresh = () => ScrollTrigger.refresh()
    const debounced = () => {
      clearTimeout(t)
      t = setTimeout(refresh, 120)
    }
    const imgs = Array.from(document.querySelectorAll('article img')) as HTMLImageElement[]
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', debounced)
    })
    window.addEventListener('load', refresh)
    document.fonts?.ready?.then(refresh)
    const t1 = setTimeout(refresh, 400)
    const t2 = setTimeout(refresh, 1500)
    return () => {
      imgs.forEach((img) => img.removeEventListener('load', debounced))
      window.removeEventListener('load', refresh)
      clearTimeout(t)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <ScrollyThemeProvider>
    <ScrollyColorProvider accentColor={article.accentColor} colorMode={article.colorMode}>
    <article className="relative">
      <ProgressBar />

      {/* Sections */}
      {sections.map((section, index) => {
        const Component = SECTION_MAP[section._type]
        if (!Component) return null
        const sectionData = section._type === 'heroSection'
          ? { ...section, backgroundColor: bg, audioFileUrl: article.audioFileUrl, author: article.author?.name, photographer: section.image?.credit }
          : { ...section, backgroundColor: bg }
        return (
          <Component
            key={section._key || index}
            data={sectionData}
            index={index}
          />
        )
      })}

      {/* Related articles + footer */}
      <footer className="relative">
        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="px-6 py-16 lg:px-16 lg:py-24" style={{ backgroundColor: bg }}>
            <div className="mx-auto max-w-[1400px]">
              <h2 className="mb-10 font-heading text-[11px] uppercase tracking-[0.3em]" style={{ color: colors.muted }}>
                Les også
              </h2>
              <div className="flex justify-center gap-5">
                {relatedArticles.map((a) => (
                  <Link
                    key={a._id}
                    href={`/artikler/${a.slug.current}`}
                    className="group w-full max-w-[360px]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                      {a.heroImage?.asset ? (
                        <Image
                          src={urlFor(a.heroImage).width(400).height(530).fit('crop').url()}
                          alt={a.heroImage.alt || a.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 70vw, 28vw"
                        />
                      ) : (
                        <div className="h-full w-full" style={{ backgroundColor: bg }} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        {a.tags?.[0] && (
                          <span className="mb-2 inline-block font-heading text-[10px] uppercase tracking-[0.3em] text-white/90">
                            {a.tags[0].title}
                          </span>
                        )}
                        <h3 className="font-display text-lg leading-snug text-white">
                          {a.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Back to magazine */}
        <div className="pb-16 pt-4 text-center" style={{ backgroundColor: bg }}>
          <Link
            href="/"
            className="inline-flex items-center gap-3 font-heading text-[11px] uppercase tracking-[0.3em] transition-opacity hover:opacity-100"
            style={{ color: colors.muted }}
          >
            <span className="h-px w-8 bg-current" />
            Tilbake til magasinet
            <span className="h-px w-8 bg-current" />
          </Link>
        </div>
      </footer>
    </article>
    </ScrollyColorProvider>
    </ScrollyThemeProvider>
  )
}
