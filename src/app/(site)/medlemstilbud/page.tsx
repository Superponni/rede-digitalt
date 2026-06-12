import type { Metadata } from 'next'
import { MedlemstilbudView } from '@/components/medlemstilbud/MedlemstilbudView'
import { sanityFetch } from '@/sanity/lib/live'
import { MEMBER_OFFERS_QUERY } from '@/sanity/lib/queries'
import { metaRobots } from '@/lib/seo'
import type { MemberOffer } from '@/lib/medlemstilbud'

const description =
  'Rabatter og fordeler for TOBB-medlemmer hos lokale og nasjonale samarbeidspartnere.'

export const metadata: Metadata = {
  title: 'Medlemstilbud',
  description,
  robots: metaRobots(),
  alternates: { canonical: '/medlemstilbud' },
  openGraph: {
    title: 'Medlemstilbud | Rede',
    description,
    url: '/medlemstilbud',
  },
  twitter: {
    title: 'Medlemstilbud | Rede',
    description,
  },
}

export default async function MedlemstilbudPage() {
  const offers = await sanityFetch<MemberOffer[]>({ query: MEMBER_OFFERS_QUERY })
  return <MedlemstilbudView offers={offers ?? []} />
}
