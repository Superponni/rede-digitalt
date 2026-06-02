import Image from 'next/image'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import { ABOUT_PAGE_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export const metadata = {
  title: 'Om Rede',
  description:
    'Rede er TOBBs medlemsmagasin — historier om bolig, nabolag og folk i Trøndelag, nå som en digital leseopplevelse.',
}

interface Edition {
  _id: string
  title?: string
  number: number
  year: number
  coverImage?: { asset: { _ref: string }; alt?: string }
}

interface Tag {
  _id: string
  title: string
  slug: { current: string }
}

interface AboutContent {
  label?: string
  title?: string
  intro?: string
  featureLabel?: string
  featureHeading?: string
  featureBody?: string
  topicsLabel?: string
  publisherLine?: string
  editionsHeading?: string
}

// Standardtekster brukes hvis Om-dokumentet ikke finnes ennå i Sanity.
const FALLBACK: Required<AboutContent> = {
  label: 'Om Rede',
  title: 'Et magasin om bolig, nabolag og folk i Trøndelag.',
  intro:
    'Rede er TOBBs medlemsmagasin. I 80 år har TOBB bygget hjem og nabolag i Trøndelag — Rede forteller historiene som bor der. Nå tar vi magasinet fra papir til skjerm.',
  featureLabel: 'Fra papir til skjerm',
  featureHeading: 'Ikke en PDF — en opplevelse.',
  featureBody:
    'Her kan du scrolle deg gjennom reportasjer som beveger seg, høre stemmene bak historiene og se video — ikke bare lese. Rede er bygget for skjermen, fra første bokstav til siste bilde.',
  topicsLabel: 'Hva du finner',
  publisherLine: 'Rede gis ut av TOBB',
  editionsHeading: 'Utgaver',
}

// Temaene settes i TOBB-farger og veksler, så «Hva du finner» får liv uten å
// bli en regnbue. Gull er bevisst utelatt — for svak kontrast på mint.
const TAG_COLORS = [
  'text-magenta',
  'text-teal',
  'text-purple',
  'text-tobb-blue',
  'text-tobb-green',
  'text-navy',
]

export default async function AboutPage() {
  const { page, editions, tags } = await sanityFetch<{
    page: AboutContent | null
    editions: Edition[]
    tags: Tag[]
  }>({ query: ABOUT_PAGE_QUERY })

  // Felt-for-felt fallback: et tomt felt i Sanity faller tilbake til standard.
  const c = { ...FALLBACK }
  if (page) {
    for (const key of Object.keys(FALLBACK) as (keyof AboutContent)[]) {
      const value = page[key]
      if (typeof value === 'string' && value.trim()) c[key] = value
    }
  }

  return (
    <div className="bg-mint">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        {/* ① Tittelblokk — forskjøvet */}
        <header className="grid grid-cols-12 gap-x-6 pt-24 lg:pt-36">
          <span className="col-span-12 mb-6 font-heading text-[11px] uppercase tracking-[0.4em] text-navy/40 lg:col-span-2">
            {c.label}
          </span>
          <h1 className="col-span-12 font-display text-[2.75rem] leading-[1.05] text-navy sm:text-6xl lg:col-span-9 lg:col-start-3 lg:text-7xl">
            {c.title}
          </h1>
        </header>

        {/* ② Ingress */}
        <div className="grid grid-cols-12 gap-x-6 pb-24 pt-12 lg:pb-36 lg:pt-20">
          <p className="col-span-12 max-w-2xl text-xl leading-relaxed text-navy/70 sm:text-2xl lg:col-span-8 lg:col-start-3">
            {c.intro}
          </p>
        </div>
      </div>

      {/* ③ Fra papir til skjerm — gull fargeblokk + tekst */}
      <section className="border-y border-navy/10">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-stretch lg:grid-cols-2">
          <div className="flex min-h-[280px] flex-col justify-end bg-gold p-10 lg:min-h-[420px] lg:p-16">
            <span className="font-heading text-[11px] uppercase tracking-[0.4em] text-navy/60">
              {c.featureLabel}
            </span>
            <p className="mt-4 font-display text-3xl leading-tight text-navy lg:text-5xl">
              {c.featureHeading}
            </p>
          </div>
          <div className="flex flex-col justify-center px-6 py-12 lg:px-16">
            <p className="max-w-md text-lg leading-relaxed text-navy/70 lg:text-xl">
              {c.featureBody}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        {/* ④ Hva du finner — temaer som fargeord */}
        {tags.length > 0 && (
          <section className="grid grid-cols-12 gap-x-6 py-24 lg:py-36">
            <span className="col-span-12 mb-8 font-heading text-[11px] uppercase tracking-[0.4em] text-navy/40 lg:col-span-3">
              {c.topicsLabel}
            </span>
            <div className="col-span-12 flex flex-wrap items-baseline gap-x-6 gap-y-2 lg:col-span-9">
              {tags.map((tag, i) => (
                <Link
                  key={tag._id}
                  href={`/tema/${tag.slug.current}`}
                  className={`font-display text-4xl capitalize transition-opacity hover:opacity-60 sm:text-5xl lg:text-6xl ${
                    TAG_COLORS[i % TAG_COLORS.length]
                  }`}
                >
                  {tag.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ⑤ Avsender */}
        <p className="border-t border-navy/10 pt-10 font-heading text-sm uppercase tracking-[0.2em] text-navy/50">
          {c.publisherLine}
        </p>

        {/* ⑥ Utgaver */}
        {editions.length > 0 && (
          <section className="py-20 lg:py-28">
            <h2 className="mb-10 font-display text-3xl text-navy lg:text-4xl">
              {c.editionsHeading}
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {editions.map((edition) => (
                <Link key={edition._id} href="/" className="group block">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-navy/5">
                    {edition.coverImage?.asset ? (
                      <Image
                        src={urlFor(edition.coverImage)
                          .width(600)
                          .height(800)
                          .fit('crop')
                          .url()}
                        alt={edition.coverImage.alt || `Rede nr ${edition.number} ${edition.year}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center">
                        <span className="font-display text-xl text-navy/40">
                          Rede {edition.number}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 font-heading text-[11px] uppercase tracking-[0.2em] text-navy/50 transition-colors group-hover:text-navy">
                    Nr {edition.number} · {edition.year}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
