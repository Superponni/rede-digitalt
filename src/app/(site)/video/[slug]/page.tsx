import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { client } from '@/sanity/lib/client'
import { RELATED_ARTICLES_QUERY, VIDEO_BY_SLUG_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { coverSrc, type SanityImageRef } from '@/sanity/lib/imageHelpers'
import { ArticleOutro } from '@/components/article/ArticleOutro'
import { SetHeaderSurface } from '@/components/layout/HeaderTheme'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbLd } from '@/lib/jsonld'
import { clampDescription, ogImagesFrom } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'
import { mergeRelated, type RelatedArticle } from '@/lib/related'
import { formatDuration, noBreakNumbers } from '@/lib/typography'
import { getVimeoEmbed } from '@/lib/vimeo'

interface PageProps {
  params: Promise<{ slug: string }>
}

interface VideoData {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  thumbnail?: SanityImageRef
  duration?: number
  publishedAt?: string
  _createdAt: string
  _updatedAt: string
  vimeoUrl?: string
  videoUrl?: string
  mimeType?: string
  tags?: { _id: string; title: string; slug: { current: string } }[]
}

async function getVideo(slug: string): Promise<VideoData | null> {
  return sanityFetch<VideoData>({ query: VIDEO_BY_SLUG_QUERY, params: { slug } })
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(
    `*[_type == "videoPost" && defined(slug.current) && (defined(vimeoUrl) || defined(video.asset))].slug.current`,
  )
  return slugs.map((slug) => ({ slug }))
}

const PILL = 'label inline-flex h-7 items-center rounded-full bg-navy-30 px-3.5 text-navy transition-colors'

// Beskrivelsen er ren tekst fra Studio: tomme linjer skiller avsnitt.
function paragraphs(text?: string): string[] {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined
  return new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const video = await getVideo(slug)
  if (!video) return {}

  const description = clampDescription(paragraphs(video.description)[0])
  const path = `/video/${video.slug.current}`
  return {
    title: video.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'video.other',
      title: video.title,
      description,
      url: path,
      images: ogImagesFrom(video.thumbnail, video.title),
      ...(video.videoUrl && !video.vimeoUrl
        ? { videos: [{ url: video.videoUrl, type: video.mimeType || 'video/mp4' }] }
        : {}),
    },
    twitter: { card: 'summary_large_image', title: video.title, description },
  }
}

/**
 * Videoside. Samme krem-flate og typografi som standardsakene: etiketter,
 * tittel og ingress øverst, så spilleren i full bredde (16:9, med lyd og
 * kontroller), og til slutt den delte «veien videre».
 */
export default async function VideoPage({ params }: PageProps) {
  const { slug } = await params
  const video = await getVideo(slug)
  if (!video) notFound()

  const [lead, ...rest] = paragraphs(video.description)
  const published = video.publishedAt || video._createdAt
  const path = `/video/${video.slug.current}`
  const poster = video.thumbnail?.asset ? coverSrc(video.thumbnail, 16, 9, 1920) : undefined
  const vimeo = await getVimeoEmbed(video.vimeoUrl)
  if (!vimeo && !video.videoUrl) notFound()
  const upright = vimeo ? vimeo.height > vimeo.width : false
  // Varigheten hentes fra Vimeo når feltet i Studio står tomt.
  const duration = video.duration || vimeo?.duration
  const meta = [formatDuration(duration), formatDate(published)].filter(Boolean)

  const relatedData = await sanityFetch<{ sameTheme: RelatedArticle[]; recent: RelatedArticle[] }>({
    query: RELATED_ARTICLES_QUERY,
    params: { id: video._id, tagIds: (video.tags ?? []).map((t) => t._id) },
  })
  const related = mergeRelated(relatedData?.sameTheme, relatedData?.recent, 6)

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: video.title,
      description: clampDescription(lead) || video.title,
      thumbnailUrl: video.thumbnail?.asset
        ? urlFor(video.thumbnail).width(1280).height(720).fit('crop').url()
        : undefined,
      uploadDate: published,
      ...(vimeo ? { embedUrl: vimeo.src } : { contentUrl: video.videoUrl }),
      ...(duration ? { duration: `PT${Math.round(duration)}S` } : {}),
      inLanguage: 'nb-NO',
    },
    breadcrumbLd([
      { name: 'Forsiden', path: '/' },
      { name: video.title, path },
    ]),
  ]

  return (
    <article className="bg-cream text-navy">
      <JsonLd data={structuredData} />
      <SetHeaderSurface surface="light" />
      <div className="wrap pb-14 pt-[69px] tab:pb-24 tab:pt-[109px]">
        <header className="flex flex-col items-start gap-6 pt-10 tab:pt-16 desk:mx-auto desk:w-2/3 desk:items-center desk:text-center">
          <div className="flex flex-wrap gap-2 desk:justify-center">
            <span className={PILL}>Video</span>
            {video.tags?.map((tag) => (
              <Link key={tag._id} href={`/tema/${tag.slug.current}`} className={`${PILL} hover:bg-[#9FB3C3]`}>
                {tag.title}
              </Link>
            ))}
          </div>
          <h1
            className="font-display text-[40px] leading-[1.08] tracking-[-0.01em] text-navy desk:text-[64px] desk:leading-[1.05] desk:tracking-[-0.015em]"
            style={{ textWrap: 'balance' }}
          >
            {noBreakNumbers(video.title)}
          </h1>
          {lead && (
            <p
              className="font-serif text-[21px] font-medium leading-snug text-magenta desk:text-2xl"
              style={{ textWrap: 'pretty' }}
            >
              {lead}
            </p>
          )}
          {meta.length > 0 && (
            <p className="font-label text-[13px] font-medium leading-snug tracking-[0.04em] text-magenta">
              {meta.join('  •  ')}
            </p>
          )}
        </header>

        {vimeo ? (
          upright ? (
            // Stående video: smal spiller midt på, aldri høyere enn ca. 80 % av skjermen.
            <div
              className="mx-auto mt-10 tab:mt-16"
              style={{
                aspectRatio: `${vimeo.width} / ${vimeo.height}`,
                width: `min(100%, calc(80vh * ${vimeo.width / vimeo.height}))`,
              }}
            >
              <iframe
                src={vimeo.src}
                title={video.title}
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
                className="block h-full w-full bg-navy"
              />
            </div>
          ) : (
            <div
              className="-mx-5 mt-10 bg-navy tab:mx-0 tab:mt-16"
              style={{ aspectRatio: `${vimeo.width} / ${vimeo.height}` }}
            >
              <iframe
                src={vimeo.src}
                title={video.title}
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
                className="block h-full w-full"
              />
            </div>
          )
        ) : (
        <div className="-mx-5 mt-10 bg-navy tab:mx-0 tab:mt-16">
          <video
            controls
            playsInline
            preload="metadata"
            poster={poster}
            className="block aspect-video w-full"
          >
            <source src={video.videoUrl} type={video.mimeType || 'video/mp4'} />
            Nettleseren din kan ikke spille av denne videoen.
          </video>
        </div>
        )}

        {rest.length > 0 && (
          <div
            className="mx-auto mt-10 flex max-w-[680px] flex-col gap-5 font-serif text-[21px] font-medium leading-snug text-navy tab:mt-16 desk:text-center desk:text-2xl"
            style={{ textWrap: 'pretty' }}
          >
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </div>

      <ArticleOutro
        related={related}
        primaryTag={video.tags?.[0]}
        shareUrl={absoluteUrl(path)}
        shareTitle={video.title}
      />
    </article>
  )
}
