import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { getArticleTheme, type AccentColor, type ColorMode } from './theme'
import type { RelatedArticle } from '@/lib/related'

/**
 * «Veien videre» — én delt avslutning for ALLE artikkeltyper (feature, standard,
 * leder). Tidligere hadde feature og standard ulike (og ulikt utseende på)
 * bunner; dette gjør dem konsistente:
 *   1. «Les også» — opptil 3 kuraterte saker (tema-først, se mergeRelated)
 *   2. «Se alle saker om [tema] →» til tema-siden (når saken har en tag)
 *   3. Dele-knapper
 *   4. «Tilbake til magasinet»
 *
 * Fargene utledes av accentColor + colorMode via getArticleTheme — NØYAKTIG
 * samme kilde som både StandardArticle og scrolly (resolveScrollyColors.bg ==
 * getArticleTheme.pageBg), så flaten flyter sømløst videre fra artikkelen.
 */

interface ArticleOutroProps {
  accentColor?: AccentColor
  colorMode?: ColorMode
  related?: RelatedArticle[]
  // Saken sin primære tag — gir «Se alle saker om …»-lenke til tema-siden.
  primaryTag?: { title: string; slug?: { current: string } }
  shareUrl: string
  shareTitle: string
}

export function ArticleOutro({
  accentColor,
  colorMode,
  related = [],
  primaryTag,
  shareUrl,
  shareTitle,
}: ArticleOutroProps) {
  const theme = getArticleTheme(accentColor, colorMode)
  const hasThemeLink = Boolean(primaryTag?.slug?.current)

  return (
    <footer className="relative" style={{ backgroundColor: theme.pageBg }}>
      {related.length > 0 && (
        <div className="px-6 pt-16 lg:px-16 lg:pt-24">
          <div className="mx-auto max-w-[1400px]">
            <h2
              className="mb-10 text-center font-heading text-[11px] uppercase tracking-[0.3em]"
              style={{ color: theme.muted }}
            >
              Les også
            </h2>
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:items-stretch">
              {related.map((a) => (
                <Link
                  key={a._id}
                  href={`/artikler/${a.slug.current}`}
                  className="group block w-full max-w-[360px]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                    {a.heroImage?.asset ? (
                      <Image
                        src={urlFor(a.heroImage).width(400).height(530).fit('crop').url()}
                        alt={a.heroImage.alt || a.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 90vw, 28vw"
                      />
                    ) : (
                      <div className="h-full w-full" style={{ backgroundColor: theme.chipBg }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      {a.tags?.[0] && (
                        <span className="mb-2 inline-block font-heading text-[10px] uppercase tracking-[0.3em] text-white/90">
                          {a.tags[0].title}
                        </span>
                      )}
                      <h3 className="font-display text-lg leading-snug text-white">{a.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Veien videre: tema-lenke, deling, tilbake til magasinet */}
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-7 px-6 py-16 lg:py-20">
        {hasThemeLink && (
          <Link
            href={`/tema/${primaryTag!.slug!.current}`}
            className="inline-flex items-center gap-2 font-heading text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
            style={{ color: theme.subhead }}
          >
            Se alle saker om {primaryTag!.title}
            <span aria-hidden>→</span>
          </Link>
        )}

        <ShareButtons url={shareUrl} title={shareTitle} tone={theme.isDark ? 'dark' : 'light'} />

        <Link
          href="/"
          className="inline-flex items-center gap-3 font-heading text-[11px] uppercase tracking-[0.3em] transition-opacity hover:opacity-70"
          style={{ color: theme.muted }}
        >
          <span className="h-px w-8 bg-current" />
          Tilbake til magasinet
          <span className="h-px w-8 bg-current" />
        </Link>
      </div>
    </footer>
  )
}
