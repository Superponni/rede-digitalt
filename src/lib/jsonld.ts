import { absoluteUrl, siteName, sitePublisher, siteDescription, siteUrl } from './site'

// Byggere for schema.org / JSON-LD. Strukturerte data er grunnmuren for BÅDE
// Googles rik-resultater OG at AI-svarmotorer (ChatGPT, Perplexity, Google AI
// Overviews) trygt kan sitere innholdet. Vi holder oss til godt etablerte typer
// og fyller kun felter vi faktisk har data for — tomme/gjettede felter skader
// mer enn de hjelper.

const ORG_ID = `${siteUrl}/#organization`
const WEBSITE_ID = `${siteUrl}/#website`

// Rede er magasinet, utgitt av TOBB. Modelleres som én Organization med TOBB
// som moderorganisasjon — det gir entitetsklarhet for AEO.
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    parentOrganization: {
      '@type': 'Organization',
      name: sitePublisher,
    },
  }
}

export function webSiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: 'nb-NO',
    publisher: { '@id': ORG_ID },
  }
}

interface ArticleLdInput {
  title: string
  description?: string
  path: string
  imageUrl?: string
  authorName?: string
  datePublished?: string
  dateModified?: string
  sections?: string[]
  hasAudio?: boolean
}

export function articleLd(input: ArticleLdInput) {
  const url = absoluteUrl(input.path)
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${url}#article`,
    headline: input.title,
    inLanguage: 'nb-NO',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
  }
  if (input.description) ld.description = input.description
  if (input.imageUrl) ld.image = [input.imageUrl]
  if (input.datePublished) ld.datePublished = input.datePublished
  if (input.dateModified) ld.dateModified = input.dateModified
  if (input.authorName) {
    ld.author = { '@type': 'Person', name: input.authorName }
  }
  if (input.sections && input.sections.length > 0) {
    ld.articleSection = input.sections
  }
  // Speakable: forteller stemme-assistenter / AI hvilke deler som egner seg å
  // lese høyt. Vi peker på tittel og ingress (selektorene finnes i markupen).
  if (input.hasAudio) {
    ld.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    }
  }
  return ld
}

interface Crumb {
  name: string
  path: string
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}
