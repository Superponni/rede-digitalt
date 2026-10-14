import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { client } from '@/sanity/lib/client'
import { TAG_PAGE_QUERY } from '@/sanity/lib/queries'
import { ThemeBar } from '@/components/layout/ThemeBar'
import { ArticleCard, type CardArticle } from '@/components/ui/Cards'
import { assignCardPalettes } from '@/lib/palette'
import { metaRobots } from '@/lib/seo'

type Article = CardArticle

interface TagData {
  tags: { _id: string; title: string; slug: { current: string } }[]
  tag: { _id: string; title: string; slug: { current: string } } | null
  articles: Article[]
}

/**
 * Slug-en fra URL-en kommer prosentkodet for tema med norske tegn
 * («/tema/økonomi» → «%C3%B8konomi»). GROQ slår opp mot den lagrede,
 * ukodede slug-en, så den må dekodes først. Rene ASCII-slugger er upåvirket.
 */
function dekod(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

async function getTagData(slug: string): Promise<TagData> {
  return sanityFetch<TagData>({ query: TAG_PAGE_QUERY, params: { slug } })
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(
    `*[_type == "tag" && defined(slug.current)].slug.current`,
  )
  // Kodet, slik at ruten matcher forespørselen for «økonomi» og «bærekraft».
  return slugs.map((slug) => ({ slug: encodeURIComponent(slug) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getTagData(dekod(slug))
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
  const data = await getTagData(dekod(slug))

  if (!data.tag) notFound()

  const articles = data.articles || []
  const palettes = assignCardPalettes(articles)
  const count = `${articles.length} ${articles.length === 1 ? 'sak' : 'saker'}`

  return (
    <div className="wrap pb-14 pt-[69px] tab:pb-24 tab:pt-[109px]">
      <ThemeBar tags={data.tags || []} active={data.tag.slug.current} />

      <header className="flex items-baseline justify-between gap-6 pt-10 tab:pt-16">
        <h1 className="font-display text-[40px] leading-[1.08] tracking-[-0.01em] text-navy first-letter:uppercase desk:text-[64px] desk:leading-[1.05] desk:tracking-[-0.015em]">
          {data.tag.title}
        </h1>
        <span className="shrink-0 font-label text-[13px] font-medium tracking-[0.04em] text-magenta">
          {count}
        </span>
      </header>

      {articles.length === 0 ? (
        <p className="mt-12 border-y border-navy/30 py-16 text-xl leading-relaxed text-navy">
          Ingen saker her ennå.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 tab:grid-cols-2 desk:grid-cols-3">
          {articles.map((article, i) => (
            <ArticleCard
              key={article._id}
              article={article}
              palette={palettes[i]}
              tag={data.tag!.title}
              showTeaser
              className={articles.length % 2 === 1 && i === articles.length - 1 ? 'tab:col-span-2 desk:col-span-1' : ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}
