import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import { TAG_PAGE_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { metaRobots } from '@/lib/seo'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  type: string
  teaser?: string
  heroImage?: { asset: { _ref: string }; alt?: string }
  tags?: { _id: string; title: string; slug: { current: string } }[]
}

interface TagData {
  tag: { _id: string; title: string; slug: { current: string } } | null
  articles: Article[]
}

async function getTagData(slug: string): Promise<TagData> {
  return sanityFetch<TagData>({ query: TAG_PAGE_QUERY, params: { slug } })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getTagData(slug)
  if (!data.tag) return {}

  const title = `${data.tag.title} – tema`
  const description = `Artikler fra Rede om ${data.tag.title.toLowerCase()}.`
  const path = `/tema/${data.tag.slug.current}`

  return {
    title,
    description,
    robots: metaRobots(),
    alternates: { canonical: path },
    openGraph: { type: 'website', title, description, url: path },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function TemaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getTagData(slug)

  if (!data.tag) notFound()

  const articles = data.articles || []

  // Use first article with hero image as background
  const heroArticle = articles.find((a) => a.heroImage?.asset)

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[70vh] items-end justify-center overflow-hidden pb-16">
        {heroArticle?.heroImage?.asset && (
          <Image
            src={urlFor(heroArticle.heroImage).width(1920).height(1080).fit('crop').url()}
            alt={heroArticle.heroImage.alt || data.tag.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center">
          <p className="mb-3 font-heading text-[11px] uppercase tracking-[0.5em] text-white/50">
            Tema
          </p>
          <h1 className="font-display text-5xl capitalize text-white md:text-6xl lg:text-7xl">
            {data.tag.title}
          </h1>
        </div>
      </section>

      {/* Articles grid */}
      <section className="bg-navy px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article._id}
                href={`/artikler/${article.slug.current}`}
                className="group block overflow-hidden rounded-lg bg-white/[0.04]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {article.heroImage?.asset ? (
                    <Image
                      src={urlFor(article.heroImage).width(600).height(450).fit('crop').url()}
                      alt={article.heroImage.alt || article.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-navy-light" />
                  )}
                </div>
                <div className="p-5 lg:p-6">
                  {article.tags?.[0] && (
                    <span className="mb-2 inline-block font-heading text-[10px] uppercase tracking-[0.3em] text-gold">
                      {article.tags[0].title}
                    </span>
                  )}
                  <h2 className="font-display text-lg leading-snug text-white transition-colors duration-300 group-hover:text-gold lg:text-xl">
                    {article.title}
                  </h2>
                  {article.teaser && (
                    <p className="mt-3 text-sm leading-relaxed text-white/50 line-clamp-3">
                      {article.teaser}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {articles.length === 0 && (
            <p className="text-center text-white/40">
              Ingen artikler med dette temaet ennå.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
