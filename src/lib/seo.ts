import type { Metadata } from 'next'
import type { SanityImageSource } from '@sanity/image-url'
import { urlFor } from '@/sanity/lib/image'
import { siteIsIndexable } from './site'

// Hjelpere som gjør generateMetadata på hver side kort og ensartet. All
// fallback-logikk (tittel → beskrivelse → delebilde) bor her, ett sted.

export interface SeoFields {
  metaTitle?: string
  metaDescription?: string
  shareImage?: SanityImageSource & { alt?: string }
  noIndex?: boolean
}

// Klipp en beskrivelse til en fornuftig lengde for søk/deling uten å kutte
// midt i et ord.
export function clampDescription(text: string | undefined, max = 160): string | undefined {
  if (!text) return undefined
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= max) return trimmed
  const cut = trimmed.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max).trim()}…`
}

// robots-direktiver styres av ÉN global bryter (siteIsIndexable) OG per-side
// «Skjul fra Google» (seo.noIndex). Begge må være grønne for at siden indekseres.
export function metaRobots(noIndex?: boolean): Metadata['robots'] {
  const index = siteIsIndexable && !noIndex
  return {
    index,
    follow: index,
    googleBot: { index, follow: index },
  }
}

export interface OgImage {
  url: string
  width: number
  height: number
  alt: string
}

// Bygg openGraph/twitter-bilde fra en Sanity-bildekilde (hovedbilde eller
// redaktørens valgte delebilde). Returnerer undefined hvis ingen kilde — da
// arver siden det merkede standard-OG-bildet (app/opengraph-image.tsx).
export function ogImagesFrom(
  source: (SanityImageSource & { alt?: string }) | undefined,
  fallbackAlt: string,
): OgImage[] | undefined {
  if (!source) return undefined
  return [
    {
      url: urlFor(source).width(1200).height(630).fit('crop').url(),
      width: 1200,
      height: 630,
      alt: source.alt || fallbackAlt,
    },
  ]
}
