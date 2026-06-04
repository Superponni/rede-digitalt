import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { ARTICLE_BY_SLUG_QUERY, RELATED_ARTICLES_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { ScrollytellingRenderer } from '@/components/scrollytelling/ScrollytellingRenderer'
import { StandardArticle } from '@/components/article/StandardArticle'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleLd, breadcrumbLd } from '@/lib/jsonld'
import { clampDescription, metaRobots, ogImagesFrom } from '@/lib/seo'
import type { SanityImageSource } from '@sanity/image-url'

interface PageProps {
  params: Promise<{ slug: string }>
}

interface ArticleData {
  _id: string
  title: string
  subtitle?: string
  slug: { current: string }
  type: 'scrollytelling' | 'standard'
  accentColor?: 'navy' | 'teal' | 'purple' | 'magenta' | 'blue' | 'green' | 'gold'
  colorMode?: 'light' | 'tinted' | 'filled' | 'dark'
  heroLayout?: 'image-first' | 'heading-first' | 'side' | 'none' | 'portrait'
  portraitName?: string
  portraitRole?: string
  expertPortrait?: { asset: { _ref: string }; alt?: string }
  teaser?: string
  heroImage?: { asset: { _ref: string }; alt?: string; credit?: string }
  body?: unknown[]
  sections?: unknown[]
  publishedAt?: string
  _updatedAt?: string
  estimatedReadTime?: number
  audioFileUrl?: string
  tags?: { _id: string; title: string; slug: { current: string } }[]
  edition?: { _id: string; title: string; number: number; year: number }
  author?: { _id: string; name: string; slug?: { current: string }; bio?: string; portrait?: { asset: { _ref: string } } }
  seo?: {
    metaTitle?: string
    metaDescription?: string
    shareImage?: SanityImageSource & { alt?: string }
    noIndex?: boolean
  }
  legacyOgDescription?: string
}

async function getArticle(slug: string): Promise<ArticleData | null> {
  return sanityFetch<ArticleData>({ query: ARTICLE_BY_SLUG_QUERY, params: { slug } })
}

// Fallback-kjede for søkebeskrivelsen: redaktørens søkebeskrivelse → gammel
// importert OG-beskrivelse → teaser.
function resolveDescription(article: ArticleData): string | undefined {
  return clampDescription(
    article.seo?.metaDescription || article.legacyOgDescription || article.teaser,
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}

  const title = article.seo?.metaTitle || article.title
  const description = resolveDescription(article)
  const path = `/artikler/${article.slug.current}`
  // Ekte foto (redaktørens delebilde, ellers hovedbilde) er best ved deling.
  // Mangler begge, arver siden det merkede standard-OG-bildet.
  const images = ogImagesFrom(article.seo?.shareImage || article.heroImage, article.title)

  return {
    title,
    description,
    robots: metaRobots(article.seo?.noIndex),
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      title,
      description,
      url: path,
      publishedTime: article.publishedAt,
      modifiedTime: article._updatedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params

  const article = await getArticle(slug)

  if (!article) notFound()

  const relatedArticles = await sanityFetch<{
    _id: string
    title: string
    slug: { current: string }
    type: string
    teaser?: string
    heroImage?: { asset: { _ref: string }; alt?: string }
    tags?: { _id: string; title: string }[]
  }[]>({ query: RELATED_ARTICLES_QUERY, params: { id: article._id } })

  const shareSource = article.seo?.shareImage || article.heroImage
  const structuredData = [
    articleLd({
      title: article.title,
      description: resolveDescription(article),
      path: `/artikler/${article.slug.current}`,
      imageUrl: shareSource
        ? urlFor(shareSource).width(1200).height(630).fit('crop').url()
        : undefined,
      authorName: article.author?.name,
      datePublished: article.publishedAt,
      dateModified: article._updatedAt,
      sections: article.tags?.map((t) => t.title),
      hasAudio: Boolean(article.audioFileUrl),
    }),
    breadcrumbLd([
      { name: 'Forsiden', path: '/' },
      { name: article.title, path: `/artikler/${article.slug.current}` },
    ]),
  ]

  return (
    <>
      <JsonLd data={structuredData} />
      {article.type === 'scrollytelling' ? (
        <ScrollytellingRenderer article={article} relatedArticles={relatedArticles || []} />
      ) : (
        <StandardArticle article={article} />
      )}
    </>
  )
}
