'use client'

import { DiscoverView } from './DiscoverView'
import { MagasinView } from './MagasinView'

// Magasin-visningen er midlertidig skjult for bruker — Discover er eneste visning.
// MagasinView beholdes for senere bruk (toggle kan gjeninnføres ved behov).
type Mode = 'discover' | 'magasin'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  type: string
  teaser?: string
  heroImage?: { asset: { _ref: string }; alt?: string }
  heroVideoUrl?: string
  tags?: { _id: string; title: string }[]
}

interface ForsideControllerProps {
  articles: Article[]
  editorial: {
    _id: string
    title: string
    slug: { current: string }
    teaserText?: string
    heroImage?: { asset: { _ref: string }; alt?: string }
  } | null
  podcast: {
    _id: string
    title: string
    description?: string
    spotifyUrl?: string
    thumbnail?: { asset: { _ref: string } }
    duration?: number
    episodeNumber?: number
    tags?: { _id: string; title: string }[]
  } | null
  edition: { _id: string; title: string; number: number; year: number } | null
}

export function ForsideController({
  articles,
  editorial,
  podcast,
  edition,
}: ForsideControllerProps) {
  const mode: Mode = 'discover'

  // Categorize articles for MagasinView
  const scrollytelling = articles.filter((a) => a.type === 'scrollytelling')
  const standard = articles.filter((a) => a.type === 'standard')
  const featured = scrollytelling.slice(0, 3)
  const curated = standard.slice(0, 5)
  const remaining = standard.slice(5)

  return (
    <>
      {mode === 'discover' ? (
        <DiscoverView
          articles={articles}
          editorial={editorial}
          podcast={podcast}
          edition={edition}
        />
      ) : (
        <MagasinView
          featured={featured}
          curated={curated}
          remaining={remaining}
          editorial={editorial}
          podcast={podcast}
          edition={edition}
        />
      )}
    </>
  )
}
