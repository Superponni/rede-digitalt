import Image from 'next/image'
import Link from 'next/link'
import { coverSrc } from '@/sanity/lib/imageHelpers'
import { getArticleTheme, type AccentColor, type ColorMode } from '@/components/article/theme'
import { AutoplayVideo } from './AutoplayVideo'
import { spotifyEmbedUrl } from '@/lib/spotify'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  type: string
  frontpagePlacement?: 'top' | 'regular'
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
  priority = false,
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
  priority?: boolean
}) {
  return (
    <Link href={href} className="group block">
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ aspectRatio: aspect }}
      >
        {videoUrl ? (
          <AutoplayVideo
            src={videoUrl}
            poster={imageRef?.asset ? coverSrc(imageRef, imageWidth, imageHeight, 1400) : undefined}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-110"
          />
        ) : imageRef?.asset ? (
          <Image
            src={coverSrc(imageRef, imageWidth, imageHeight, 1400)}
            alt={imageAlt || title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-110"
            sizes={sizes}
            priority={priority}
          />
        ) : (
          <div className="h-full w-full bg-navy-light" />
        )}
        {featured ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-6 text-center lg:px-6 lg:pb-8">
              {tag && (
                <span className="mb-2 inline-block font-label text-[13px] uppercase tracking-[0.25em] text-white/80 lg:text-sm">
                  {tag}
                </span>
              )}
              {/* hyphens + break-words: lange enkeltord («Forsvarsrunden») skal
                  orddeles innenfor kortet, ikke renne ut over kanten på mobil.
                  hyphenateLimitChars: bare ord på 12+ tegn deles, så vanlige ord
                  («mel-lom», «Trond-heim») flyttes hele til neste linje i stedet.
                  textWrap balance jevner ut linjene. */}
              <h3
                className="w-full max-w-full break-words font-display text-lg leading-[1.1] text-white sm:text-2xl md:text-3xl lg:text-4xl"
                style={{ hyphens: 'auto', hyphenateLimitChars: '12 4 4', textWrap: 'balance' }}
              >
                {title}
              </h3>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 lg:p-4">
              {tag && (
                <span className="mb-1 inline-block font-label text-[11px] uppercase tracking-[0.2em] text-white/80 lg:text-[13px]">
                  {tag}
                </span>
              )}
              <h3 className="font-display text-lg leading-[1.15] text-white lg:text-[22px]">
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
  // Plassering styres av redaktørens eget forsidevalg, ikke av artikkeltypen.
  // Row 1: de tre nyeste sakene satt til toppraden. Er flere satt dit, går de
  // eldste ned i de vanlige radene under — ingen sak faller ut av forsiden.
  const features = articles.filter((a) => a.frontpagePlacement === 'top').slice(0, 3)
  const featureIds = new Set(features.map((a) => a._id))
  const rest = articles.filter((a) => !featureIds.has(a._id))

  // Row 3: de fire nyeste av resten (rekkefølgen er publiseringsdato synkende —
  // se FRONTPAGE_QUERY). Uten overskrift, siden forsiden blander magasinsaker
  // og rene nettsaker.
  const curated = rest.slice(0, 4)

  // Row 4+: Remaining articles
  const remaining = rest.slice(4)

  return (
    <div className="px-4 pb-12 pt-20 sm:px-6 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1400px] space-y-3">
        {/* Row 1 — toppraden: 3 store stående kort */}
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
                    // Toppraden er LCP — last den ivrig i stedet for lazy.
                    priority={i < 3}
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
                          className="font-label text-[13px] uppercase tracking-[0.2em] lg:text-sm"
                          style={{ color: theme.muted }}
                        >
                          Leder
                        </span>
                        <h3
                          className="mt-3 font-display text-xl leading-[1.15] transition-opacity duration-300 group-hover:opacity-80 lg:text-2xl xl:text-[28px]"
                          style={{ color: theme.title }}
                        >
                          {editorial.title}
                        </h3>
                        {editorial.teaserText && (
                          <p
                            className="mt-4 line-clamp-3 font-serif text-[15px] leading-relaxed lg:text-base"
                            style={{ color: theme.bodyText }}
                          >
                            {editorial.teaserText}
                          </p>
                        )}
                      </div>
                      <span
                        className="mt-5 inline-flex items-center gap-1.5 font-label text-xs uppercase tracking-[0.18em] lg:text-[13px]"
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
            {(() => {
              const embed = spotifyEmbedUrl(podcast?.spotifyUrl)
              if (!embed || !podcast) return null
              return (
                <div className="h-full overflow-hidden rounded-lg">
                  <iframe
                    src={embed}
                    width="100%"
                    height="100%"
                    style={{ minHeight: 352 }}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="block border-0"
                    title={podcast.title}
                  />
                </div>
              )
            })()}
          </div>
        )}

        {/* Row 3 — de fire nyeste standard-sakene, uten overskrift. Tidligere sto
            det «I denne utgaven» her, men forsiden viser nå også nettsaker som
            ikke stammer fra en trykt utgave — da ble overskriften direkte feil. */}
        {curated.length > 0 && (
          <div>
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

        {/* Row 4+ — resten av sakene, nyeste først. Samme stående format og grid
            som raden over, så forsiden holder ett kortspråk hele veien ned. */}
        {remaining.length > 0 && (
          <div>
            <p className="mb-2 px-1 font-label text-[13px] uppercase tracking-[0.2em] text-navy/50 lg:text-sm">
              Flere saker
            </p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
              {remaining.map((article) => (
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
      </div>
    </div>
  )
}
