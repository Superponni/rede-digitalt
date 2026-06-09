// MIDLERTIDIG QA-RUTE — slettes før deploy. Lar redaktøren se utkastet lokalt.
// Henter utkastet direkte med lese-token (drafts-perspektiv) og rendrer det,
// slik at vi kan QA-e uten signert Presentation-URL.
import { client } from '@/sanity/lib/client'
import { token } from '@/sanity/env'
import { ARTICLE_BY_SLUG_QUERY } from '@/sanity/lib/queries'
import { ScrollytellingRenderer } from '@/components/scrollytelling/ScrollytellingRenderer'

export const dynamic = 'force-dynamic'

export default async function QaForkjopsrettPage() {
  const article = await client
    .withConfig({ token, useCdn: false, perspective: 'drafts' })
    .fetch(ARTICLE_BY_SLUG_QUERY, { slug: 'forkjopsrett' })

  if (!article) return <div style={{ padding: 40 }}>Fant ingen draft for «forkjopsrett».</div>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ScrollytellingRenderer article={article as any} shareUrl="/qa-forkjopsrett" />
}
