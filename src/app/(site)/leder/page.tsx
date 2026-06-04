import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import { EDITORIAL_PAGE_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { PortableTextRenderer } from '@/components/article/PortableTextRenderer'
import { AudioPlayer } from '@/components/article/AudioPlayer'
import { JsonLd } from '@/components/seo/JsonLd'
import { SetHeaderSurface } from '@/components/layout/HeaderTheme'
import { articleLd, breadcrumbLd } from '@/lib/jsonld'
import { clampDescription, metaRobots, ogImagesFrom } from '@/lib/seo'
import type { SanityImageSource } from '@sanity/image-url'

interface EditorialData {
  _id: string
  title: string
  slug: { current: string }
  teaserText?: string
  heroImage?: { asset: { _ref: string }; alt?: string }
  fullText?: unknown[]
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

  return (
    <article className="bg-mint pb-20">
      {/* Toppbilde ⇒ hvit logo over hero, ellers marineblå på mint. */}
      <SetHeaderSurface surface={editorial.heroImage?.asset ? 'dark' : 'light'} />
      <JsonLd data={structuredData} />
      {/* Hero image */}
      {editorial.heroImage?.asset && (
        <div className="relative h-[50vh] w-full lg:h-[60vh]">
          <Image
            src={urlFor(editorial.heroImage).width(1920).height(1080).url()}
            alt={editorial.heroImage.alt || editorial.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mint via-transparent to-transparent" />
        </div>
      )}

      {/* Header */}
      <header className="mx-auto max-w-prose px-6 lg:px-0">
        <div className="-mt-16 relative z-10">
          <span className="mb-4 inline-block rounded-full bg-navy/10 px-3 py-1 font-heading text-[10px] uppercase tracking-[0.2em] text-navy/60">
            Leder
          </span>

          <h1 className="font-display text-4xl leading-[1.1] text-navy md:text-5xl lg:text-6xl">
            {editorial.title}
          </h1>

          {editorial.teaserText && (
            <p data-speakable className="mt-4 text-lg leading-relaxed text-navy/60 lg:text-xl">
              {editorial.teaserText}
            </p>
          )}

          {/* Meta */}
          <div className="mt-6 flex items-center gap-4 border-t border-navy/10 pt-4 text-sm text-navy/40">
            {editorial.edition && (
              <span>Rede nr {editorial.edition.number} {editorial.edition.year}</span>
            )}
          </div>

          {/* Audio player */}
          {editorial.audioFileUrl && (
            <div className="mt-6">
              <AudioPlayer src={editorial.audioFileUrl} theme="light" />
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      {editorial.fullText && (
        <div className="mt-12">
          <PortableTextRenderer value={editorial.fullText} />
        </div>
      )}

      {/* Back link */}
      <div className="mx-auto mt-16 max-w-prose px-6 lg:px-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-heading text-sm uppercase tracking-[0.2em] text-navy/50 transition-colors hover:text-navy"
        >
          <span>&larr;</span> Tilbake til forsiden
        </Link>
      </div>
    </article>
  )
}
