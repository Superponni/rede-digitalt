import { sanityFetch } from '@/sanity/lib/live'
import { FRONTPAGE_QUERY } from '@/sanity/lib/queries'
import { ForsideController } from '@/components/forside/ForsideController'

export default async function Home() {
  const data = await sanityFetch<{
    edition: { _id: string; title: string; number: number; year: number } | null
    articles: Array<{
      _id: string
      title: string
      slug: { current: string }
      type: string
      teaser?: string
      heroImage?: { asset: { _ref: string }; alt?: string }
      expertPortrait?: { asset: { _ref: string }; alt?: string }
      heroVideoUrl?: string
      tags?: { _id: string; title: string }[]
    }>
    editorial: {
      _id: string; title: string; slug: { current: string }; teaserText?: string
      heroImage?: { asset: { _ref: string }; alt?: string }
      accentColor?: string; colorMode?: string
    } | null
    podcast: {
      _id: string; title: string; description?: string; spotifyUrl?: string
      thumbnail?: { asset: { _ref: string } }; duration?: number; episodeNumber?: number
      tags?: { _id: string; title: string }[]
    } | null
  }>({ query: FRONTPAGE_QUERY })

  // Mangler hovedbilde? Fall tilbake til ekspertportrettet som forsidebilde, slik
  // at saker med kun ekspertkilde (f.eks. portrett-oppsett) ikke får tomt kort.
  const articles = (data.articles || []).map((a) => ({
    ...a,
    heroImage: a.heroImage?.asset ? a.heroImage : a.expertPortrait,
  }))

  return (
    <ForsideController
      articles={articles}
      editorial={data.editorial}
      podcast={data.podcast}
      edition={data.edition}
    />
  )
}
