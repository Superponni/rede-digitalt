import Link from 'next/link'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { ArticleCard, HairlineRow, cardLabel } from '@/components/ui/Cards'
import { assignCardPalettes } from '@/lib/palette'
import type { RelatedArticle } from '@/lib/related'

/**
 * «Veien videre» — én delt avslutning for ALLE artikkeltyper (feature, standard,
 * leder), i malens faste rekkefølge:
 *   1. Dele-knapper
 *   2. «Se alle saker om [tema] →» til tema-siden (når saken har en tag)
 *   3. Tre fargede kort (tema-først, se mergeRelated)
 *   4. «Les også» — hårstrek-rad med de tre neste
 *
 * Står alltid på krem, også etter en feature-sak med egen farget flate.
 */

interface ArticleOutroProps {
  /** Opptil seks saker: de tre første blir kort, de tre neste «Les også». */
  related?: RelatedArticle[]
  // Saken sin primære tag — gir «Se alle saker om …»-lenke til tema-siden.
  primaryTag?: { title: string; slug?: { current: string } }
  shareUrl: string
  shareTitle: string
}

export function ArticleOutro({ related = [], primaryTag, shareUrl, shareTitle }: ArticleOutroProps) {
  const hasThemeLink = Boolean(primaryTag?.slug?.current)
  const cards = related.slice(0, 3)
  const more = related.slice(3, 6)
  const palettes = assignCardPalettes(cards)

  return (
    <footer className="bg-cream text-navy">
      <div className="wrap flex flex-col gap-6 pb-14 pt-4 tab:pb-24">
        <ShareButtons url={shareUrl} title={shareTitle} tone="light" className="border-t border-navy/30 pt-8" />

        {hasThemeLink && (
          <Link
            href={`/tema/${primaryTag!.slug!.current}`}
            className="group mt-10 inline-flex items-center gap-2.5 self-start border-b border-navy/35 pb-1 text-[17px] text-navy tab:mt-16"
          >
            Se alle saker om {primaryTag!.title.toLowerCase()}
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        )}

        {cards.length > 0 && (
          <div className={`grid gap-6 tab:grid-cols-2 desk:grid-cols-3 ${hasThemeLink ? '' : 'mt-10 tab:mt-16'}`}>
            {cards.map((a, i) => (
              <ArticleCard
                key={a._id}
                article={a}
                palette={palettes[i]}
                className={cards.length % 2 === 1 && i === cards.length - 1 ? 'tab:col-span-2 desk:col-span-1' : ''}
              />
            ))}
          </div>
        )}

        {more.length > 0 && (
          <section className="mt-4 flex flex-col gap-4 tab:mt-10" aria-labelledby="les-ogsa">
            <h2 id="les-ogsa" className="text-[17px] text-navy">
              Les også
            </h2>
            <HairlineRow
              items={more.map((a) => ({
                key: a._id,
                href: `/artikler/${a.slug.current}`,
                tag: cardLabel(a),
                title: a.title,
                teaser: a.teaser,
              }))}
            />
          </section>
        )}
      </div>
    </footer>
  )
}
