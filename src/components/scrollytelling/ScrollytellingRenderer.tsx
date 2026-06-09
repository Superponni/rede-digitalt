'use client'

import { useEffect } from 'react'
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
import { KoeLapp } from './sections/KoeLapp'
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
import { ArticleOutro } from '@/components/article/ArticleOutro'
import type { RelatedArticle } from '@/lib/related'

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  related?: RelatedArticle[]
  primaryTag?: { title: string; slug?: { current: string } }
  shareUrl: string
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
  koeSlider: KoeLapp,
  stickyVei: StickyVei,
  veideling: Veideling,
  storbyKart: StorbyKart,
  ansiennitetSjekk: AnsiennitetSjekk,
  gifKort: GifKort,
  interactiveQuiz: InteractiveQuiz,
}

export function ScrollytellingRenderer({ article, related = [], primaryTag, shareUrl }: ScrollytellingRendererProps) {
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
    </ScrollyColorProvider>
    </ScrollyThemeProvider>
  )
}
