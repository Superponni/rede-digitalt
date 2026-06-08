import Image from 'next/image'
import Link from 'next/link'
import { coverSrc } from '@/sanity/lib/imageHelpers'
import { getArticleTheme, type AccentColor, type ColorMode } from '@/components/article/theme'

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

interface DiscoverViewProps {
  articles: Article[]
  editorial: {
    _id: string
    title: string
    slug: { current: string }
    teaserText?: string
    heroImage?: { asset: { _ref: string }; alt?: string }
    accentColor?: string
    colorMode?: string
  } | null
  podcast: {
    _id: string
    title: string
    description?: string
    spotifyUrl?: string
    thumbnail?: { asset: { _ref: string }; alt?: string }
    duration?: number
    episodeNumber?: number
    tags?: { _id: string; title: string }[]
  } | null
  edition: { _id: string; title: string; number: number; year: number } | null
}

function DiscoverCard({
  href,
  imageRef,
  imageAlt,
  videoUrl,
  title,
  tag,
  aspect,
  featured = false,
  imageWidth = 600,
  imageHeight = 800,
  sizes = '33vw',
}: {
  href: string
  imageRef?: { asset: { _ref: string }; alt?: string }
  imageAlt?: string
  videoUrl?: string
  title: string
  tag?: string
  aspect: string
  featured?: boolean
  imageWidth?: number
  imageHeight?: number
  sizes?: string
}) {
  return (
    <Link href={href} className="group block">
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ aspectRatio: aspect }}
      >
        {videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={imageRef?.asset ? coverSrc(imageRef, imageWidth, imageHeight, 1400) : undefined}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-110"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : imageRef?.asset ? (
          <Image
            src={coverSrc(imageRef, imageWidth, imageHeight, 1400)}
            alt={imageAlt || title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-110"
            sizes={sizes}
          />
        ) : (
          <div className="h-full w-full bg-navy-light" />
        )}
        {featured ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-6 text-center lg:px-6 lg:pb-8">
              {tag && (
                <span className="mb-2 inline-block font-heading text-[10px] uppercase tracking-[0.4em] text-white/75 lg:text-[11px]">
                  {tag}
                </span>
              )}
              <h3 className="max-w-[90%] font-display text-lg leading-[1.1] text-white sm:text-2xl md:text-3xl lg:text-4xl">
                {title}
              </h3>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 lg:p-4">
              {tag && (
                <span className="mb-1 inline-block font-heading text-[9px] uppercase tracking-[0.3em] text-white/75 lg:text-[10px]">
                  {tag}
                </span>
              )}
              <h3 className="font-display text-sm leading-snug text-white lg:text-base">
                {title}
              </h3>
            </div>
          </>
        )}
      </div>
    </Link>
  )
}

export function DiscoverView({
  articles,
  editorial,
  podcast,
  edition,
}: DiscoverViewProps) {
  const scrollytelling = articles.filter((a) => a.type === 'scrollytelling')
  const standard = articles.filter((a) => a.type === 'standard')

  // Row 1: Top 3 features (scrollytelling)
  const features = scrollytelling.slice(0, 3)

  // Row 3: "I denne utgaven" — first 4 standard articles
  const curated = standard.slice(0, 4)

  // Row 4+: Remaining articles
  const remaining = standard.slice(4)

  return (
    <div className="px-4 pb-12 pt-20 sm:px-6 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1400px] space-y-3">
        {/* Row 1 — 3 feature cards (tall, portrait) */}
        {features.length > 0 && (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3">
            {features.map((article, i) => {
              const isLastOdd = features.length % 2 === 1 && i === features.length - 1
              return (
                <div key={article._id} className={isLastOdd ? 'col-span-2 lg:col-span-1' : ''}>
                  <DiscoverCard
                    href={`/artikler/${article.slug.current}`}
                    imageRef={article.heroImage}
                    imageAlt={article.heroImage?.alt}
                    videoUrl={article.heroVideoUrl}
                    title={article.title}
                    tag={article.tags?.[0]?.title}
                    aspect="3/4"
                    featured
                    imageWidth={isLastOdd ? 800 : 500}
                    imageHeight={isLastOdd ? 1067 : 667}
                    sizes={isLastOdd ? '(max-width: 1024px) 100vw, 33vw' : '(max-width: 1024px) 50vw, 33vw'}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Row 2 — Leder + Podcast (stacked on mobile, side by side on desktop) */}
        {(editorial || podcast) && (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
            {/* Leder — delt kort: farget tekstpanel + lederens hovedbilde, farge fra saken */}
            {editorial && (() => {
              const accentKey = (editorial.accentColor ?? 'navy') as AccentColor
              const theme = getArticleTheme(accentKey, (editorial.colorMode ?? 'light') as ColorMode)
              const hasImage = Boolean(editorial.heroImage?.asset)
              return (
                <Link href="/leder" className="group block h-full">
                  <div
                    className="relative flex h-full min-h-[220px] overflow-hidden rounded-lg"
                    style={{ backgroundColor: theme.pageBg }}
                  >
                    {/* Venstre: tekst */}
                    <div className="flex flex-1 flex-col justify-between p-5 lg:p-7">
                      <div>
                        <span
                          className="font-heading text-[10px] uppercase tracking-[0.3em] lg:text-[11px]"
                          style={{ color: theme.muted }}
                        >
                          Leder
                        </span>
                        <h3
                          className="mt-2 font-display text-lg leading-[1.12] transition-opacity duration-300 group-hover:opacity-80 lg:text-2xl xl:text-3xl"
                          style={{ color: theme.title }}
                        >
                          {editorial.title}
                        </h3>
                        {editorial.teaserText && (
                          <p
                            className="mt-3 line-clamp-3 text-sm leading-relaxed lg:text-base"
                            style={{ color: theme.bodyText }}
                          >
                            {editorial.teaserText}
                          </p>
                        )}
                      </div>
                      <span
                        className="mt-5 inline-flex items-center gap-1.5 font-heading text-xs uppercase tracking-[0.18em] lg:text-[13px]"
                        style={{ color: theme.link }}
                      >
                        Les lederen
                        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </div>

                    {/* Høyre: hovedbilde */}
                    {hasImage && (
                      <div className="relative w-[38%] shrink-0 self-stretch sm:w-[42%]">
                        <Image
                          src={coverSrc(editorial.heroImage!, 3, 4, 800)}
                          alt={editorial.heroImage!.alt || editorial.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 1024px) 42vw, 22vw"
                        />
                      </div>
                    )}
                  </div>
                </Link>
              )
            })()}

            {/* Podcast — full Spotify embed, stretched to match leder height */}
            {podcast?.spotifyUrl && (
              <div className="h-full overflow-hidden rounded-lg">
                <iframe
                  src={podcast.spotifyUrl.replace('open.spotify.com/', 'open.spotify.com/embed/')}
                  width="100%"
                  height="100%"
                  style={{ minHeight: 352 }}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="block border-0"
                  title={podcast.title}
                />
              </div>
            )}
          </div>
        )}

        {/* Row 3 — "I denne utgaven" (4 portrait cards) */}
        {curated.length > 0 && (
          <div>
            <p className="mb-2 px-1 font-heading text-[10px] uppercase tracking-[0.3em] text-navy/40">
              I denne utgaven
            </p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
              {curated.map((article) => (
                <DiscoverCard
                  key={article._id}
                  href={`/artikler/${article.slug.current}`}
                  imageRef={article.heroImage}
                  imageAlt={article.heroImage?.alt}
                  videoUrl={article.heroVideoUrl}
                  title={article.title}
                  tag={article.tags?.[0]?.title}
                  aspect="3/4"
                  imageWidth={400}
                  imageHeight={533}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              ))}
            </div>
          </div>
        )}

        {/* Row 4+ — Remaining articles (2-col landscape grid) */}
        {remaining.length > 0 && (
          <div>
            <p className="mb-2 px-1 font-heading text-[10px] uppercase tracking-[0.3em] text-navy/40">
              Flere saker
            </p>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {remaining.map((article) => (
                <DiscoverCard
                  key={article._id}
                  href={`/artikler/${article.slug.current}`}
                  imageRef={article.heroImage}
                  imageAlt={article.heroImage?.alt}
                  videoUrl={article.heroVideoUrl}
                  title={article.title}
                  tag={article.tags?.[0]?.title}
                  aspect="4/3"
                  imageWidth={600}
                  imageHeight={450}
                  sizes="50vw"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
