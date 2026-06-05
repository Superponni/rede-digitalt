import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { EDITORIAL_PAGE_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { StandardArticle } from '@/components/article/StandardArticle'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleLd, breadcrumbLd } from '@/lib/jsonld'
import { clampDescription, metaRobots, ogImagesFrom } from '@/lib/seo'
import type { SanityImageSource } from '@sanity/image-url'

interface EditorialData {
  _id: string
  title: string
  subtitle?: string
  slug: { current: string }
  teaserText?: string
  heroImage?: { asset: { _ref: string }; alt?: string }
  fullText?: unknown[]
  accentColor?: 'navy' | 'teal' | 'purple' | 'magenta' | 'blue' | 'green' | 'gold'
  colorMode?: 'light' | 'tinted' | 'filled' | 'dark'
  heroLayout?: 'image-first' | 'heading-first' | 'side' | 'none' | 'portrait'
  portraitName?: string
  portraitRole?: string
  expertPortrait?: { asset: { _ref: string }; alt?: string }
  publishedAt?: string
  _updatedAt?: string
  audioFileUrl?: string
  edition?: { _id: string; title: string; number: number; year: number }
  author?: { _id: string; name: string }
  seo?: {
    metaTitle?: string
    metaDescription?: string
    shareImage?: SanityImageSource & { alt?: string }
    noIndex?: boolean
  }
  legacyOgDescription?: string
}

async function getEditorial(): Promise<EditorialData | null> {
  return sanityFetch<EditorialData>({ query: EDITORIAL_PAGE_QUERY })
}

export async function generateMetadata(): Promise<Metadata> {
  const editorial = await getEditorial()
  if (!editorial) return {}

  const title = editorial.seo?.metaTitle || editorial.title
  const description = clampDescription(
    editorial.seo?.metaDescription || editorial.teaserText,
  )
  const images = ogImagesFrom(editorial.seo?.shareImage || editorial.heroImage, editorial.title)

  return {
    title,
    description,
    robots: metaRobots(editorial.seo?.noIndex),
    alternates: { canonical: '/leder' },
    openGraph: {
      type: 'article',
      title,
      description,
      url: '/leder',
      publishedTime: editorial.publishedAt,
      modifiedTime: editorial._updatedAt,
      images,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function LederPage() {
  const editorial = await getEditorial()

  if (!editorial) notFound()

  const shareSource = editorial.seo?.shareImage || editorial.heroImage
  const structuredData = [
    articleLd({
      title: editorial.title,
      description: clampDescription(editorial.seo?.metaDescription || editorial.teaserText),
      path: '/leder',
      imageUrl: shareSource
        ? urlFor(shareSource).width(1200).height(630).fit('crop').url()
        : undefined,
      authorName: editorial.author?.name,
      datePublished: editorial.publishedAt,
      dateModified: editorial._updatedAt,
      hasAudio: Boolean(editorial.audioFileUrl),
    }),
    breadcrumbLd([
      { name: 'Forsiden', path: '/' },
      { name: editorial.title, path: '/leder' },
    ]),
  ]

  // Leder behandles som en standard-artikkel: samme topp-oppsett, signaturfarge
  // og fargemodus. Felt-navnene mappes (fullText → body, teaserText → teaser),
  // og «Leder»-etiketten beholdes via eyebrow-propen.
  const article = {
    _id: editorial._id,
    title: editorial.title,
    subtitle: editorial.subtitle,
    teaser: editorial.teaserText,
    accentColor: editorial.accentColor,
    colorMode: editorial.colorMode,
    heroLayout: editorial.heroLayout,
    portraitName: editorial.portraitName,
    portraitRole: editorial.portraitRole,
    expertPortrait: editorial.expertPortrait,
    heroImage: editorial.heroImage,
    body: editorial.fullText,
    audioFileUrl: editorial.audioFileUrl,
    author: editorial.author,
    edition: editorial.edition,
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <StandardArticle article={article} eyebrow="Leder" />
    </>
  )
}
