import type { Metadata } from 'next'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { PRIVACY_PAGE_QUERY } from '@/sanity/lib/queries'
import { metaRobots } from '@/lib/seo'
import {
  PRIVACY_TITLE,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
} from '@/lib/privacy-default'

/* eslint-disable @typescript-eslint/no-explicit-any */

const pageTitle = 'Personvern'
const pageDescription =
  'Slik behandler Rede personopplysninger. Vi måler trafikk og lesemønster med Google Analytics — kun hvis du samtykker, og aldri noe som identifiserer deg.'

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  robots: metaRobots(),
  alternates: { canonical: '/personvern' },
  openGraph: {
    type: 'website',
    title: pageTitle,
    description: pageDescription,
    url: '/personvern',
  },
  twitter: { card: 'summary_large_image', title: pageTitle, description: pageDescription },
}

interface PrivacyContent {
  title?: string
  intro?: string
  body?: any[]
  _updatedAt?: string
}

// Lett, statisk rendering — ingen animasjoner. Navy tekst på mint canvas, samme
// rolige uttrykk som /om.
const portableComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-5 text-lg leading-relaxed text-navy/75">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-14 font-display text-2xl text-navy lg:text-3xl">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-10 font-display text-xl font-bold text-navy">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-gold pl-6 font-quote text-xl text-navy/80">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-6 list-none space-y-2 pl-0">{children}</ul>,
    number: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 text-lg text-navy/75">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex items-baseline gap-3 text-lg leading-relaxed text-navy/75">
        <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-gold" />
        <span>{children}</span>
      </li>
    ),
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-navy">{children}</strong>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="font-semibold text-tobb-blue underline decoration-tobb-blue/40 underline-offset-2 transition-colors hover:decoration-tobb-blue"
      >
        {children}
      </a>
    ),
  },
}

function formatDate(iso?: string): string | null {
  if (!iso) return null
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

export default async function PrivacyPage() {
  const page = await sanityFetch<PrivacyContent | null>({ query: PRIVACY_PAGE_QUERY })

  const title = page?.title?.trim() || PRIVACY_TITLE
  const intro = page?.intro?.trim() || PRIVACY_INTRO
  const updated = formatDate(page?._updatedAt)
  const hasBody = Array.isArray(page?.body) && page.body.length > 0

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-[760px] px-6 pb-28 pt-28 lg:px-0 lg:pt-36">
        <header>
          {updated && (
            <span className="font-label text-[11px] uppercase tracking-[0.3em] text-navy/40">
              Sist oppdatert {updated}
            </span>
          )}
          <h1 className="mt-4 font-display text-[2.5rem] leading-[1.05] text-navy lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-navy/70">{intro}</p>
        </header>

        <div className="mt-12">
          {hasBody ? (
            // Redaktørens versjon fra Sanity
            <PortableText value={page!.body!} components={portableComponents} />
          ) : (
            // Standardtekst hvis Sanity-dokumentet ikke er seedet ennå
            PRIVACY_SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-4 mt-14 font-display text-2xl text-navy lg:text-3xl">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((p, i) => (
                  <p key={i} className="mb-5 text-lg leading-relaxed text-navy/75">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mb-6 list-none space-y-2 pl-0">
                    {section.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-baseline gap-3 text-lg leading-relaxed text-navy/75"
                      >
                        <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-gold" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
