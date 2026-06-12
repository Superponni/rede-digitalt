import { client } from '@/sanity/lib/client'
import { ARTICLES_QUERY } from '@/sanity/lib/queries'
import {
  absoluteUrl,
  siteIsIndexable,
  siteName,
  sitePublisher,
  siteDescription,
} from '@/lib/site'

// llms.txt: en åpen konvensjon som forteller AI-svarmotorer (ChatGPT,
// Perplexity, m.fl.) hva siden er og hvor hovedinnholdet ligger — på et format
// de leser lett. Entitetsklarhet (hva er Rede, hva er TOBB) + lenker til
// artiklene = bedre sjanse for å bli sitert korrekt.

export const dynamic = 'force-dynamic'

interface ArticleListItem {
  title: string
  slug: { current: string }
  teaser?: string
}

export async function GET() {
  // Holdes tilbake til lansering — samme bryter som robots/metadata.
  if (!siteIsIndexable) {
    const body = `# ${siteName}\n\n> ${siteDescription}\n\nSiden er under utvikling og ikke publisert ennå.\n`
    return new Response(body, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const [articles, tags] = await Promise.all([
    client.fetch<ArticleListItem[]>(ARTICLES_QUERY),
    client.fetch<{ title: string; slug: { current: string } }[]>(
      `*[_type == "tag" && defined(slug.current)] | order(title asc) { title, slug }`,
    ),
  ])

  const lines: string[] = [
    `# ${siteName}`,
    '',
    `> ${siteDescription} Utgitt av ${sitePublisher}.`,
    '',
    `${siteName} er det digitale medlemsmagasinet til ${sitePublisher} (Trondheim og Omegn Boligbyggelag). Innholdet handler om bolig, nabolag, økonomi og livet i Trøndelag, rettet mot TOBBs medlemmer.`,
    '',
    '## Artikler',
    '',
    ...articles.map((a) => {
      const url = absoluteUrl(`/artikler/${a.slug.current}`)
      return a.teaser ? `- [${a.title}](${url}): ${a.teaser}` : `- [${a.title}](${url})`
    }),
    '',
    '## Sider',
    '',
    `- [Leder](${absoluteUrl('/leder')}): Redaktørens leder for utgaven.`,
    `- [Medlemstilbud](${absoluteUrl('/medlemstilbud')}): Rabatter og fordeler for ${sitePublisher}-medlemmer hos lokale og nasjonale samarbeidspartnere.`,
    `- [Om Rede](${absoluteUrl('/om')}): Om magasinet og ${sitePublisher}.`,
    '',
  ]

  if (tags.length > 0) {
    lines.push(
      '## Temaer',
      '',
      ...tags.map(
        (t) => `- [${t.title}](${absoluteUrl(`/tema/${t.slug.current}`)})`,
      ),
      '',
    )
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
