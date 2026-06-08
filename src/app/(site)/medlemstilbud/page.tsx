import type { Metadata } from 'next'
import { MedlemstilbudView } from '@/components/medlemstilbud/MedlemstilbudView'
import { sanityFetch } from '@/sanity/lib/live'
import { MEMBER_OFFERS_QUERY } from '@/sanity/lib/queries'
import { metaRobots } from '@/lib/seo'
import type { MemberOffer } from '@/lib/medlemstilbud'

export const metadata: Metadata = {
  title: 'Medlemstilbud',
  description:
    'Rabatter og fordeler for TOBB-medlemmer hos lokale og nasjonale samarbeidspartnere.',
  robots: metaRobots(),
  alternates: { canonical: '/medlemstilbud' },
}

export default async function MedlemstilbudPage() {
  const offers = await sanityFetch<MemberOffer[]>({ query: MEMBER_OFFERS_QUERY })
  return <MedlemstilbudView offers={offers ?? []} />
}
