import { sanityFetch } from '@/sanity/lib/live'
import { FRONTPAGE_QUERY } from '@/sanity/lib/queries'
import { Forside, type FrontArticle } from '@/components/forside/Forside'
import type { SanityImageRef } from '@/sanity/lib/imageHelpers'

export default async function Home() {
  const data = await sanityFetch<{
    topIds?: string[]
    featureId?: string
    currentEdition: { _id: string; order?: string[] } | null
    articles: Array<FrontArticle & { expertPortrait?: SanityImageRef }>
    editorial: { _id: string; title: string; teaserText?: string } | null
    podcast: {
      _id: string; title: string; spotifyUrl?: string
      thumbnail?: SanityImageRef; duration?: number; episodeNumber?: number
    } | null
    video: {
      _id: string; title: string; slug: { current: string }
      description?: string; thumbnail?: SanityImageRef; duration?: number
    } | null
    tags: { _id: string; title: string; slug: { current: string } }[]
  }>({ query: FRONTPAGE_QUERY })

  // Mangler hovedbilde? Fall tilbake til ekspertportrettet som forsidebilde, slik
  // at saker med kun ekspertkilde (f.eks. portrett-oppsett) ikke får tomt kort.
  const articles = (data.articles || []).map((a) => ({
    ...a,
    heroImage: a.heroImage?.asset ? a.heroImage : a.expertPortrait,
  }))

  return (
    <Forside
      topIds={data.topIds ?? []}
      featureId={data.featureId}
      currentEdition={data.currentEdition}
      articles={articles}
      editorial={data.editorial}
      podcast={data.podcast}
      video={data.video}
      tags={data.tags || []}
    />
  )
}
