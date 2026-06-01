import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { Header } from '@/components/forside/Header'
import { Footer } from '@/components/forside/Footer'
import { SmoothScroll } from '@/components/SmoothScroll'
import { SanityLive } from '@/sanity/lib/live'
import { DisableDraftMode } from '@/components/DisableDraftMode'
import { sanityFetch } from '@/sanity/lib/live'
import { MENU_QUERY } from '@/sanity/lib/queries'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled: isDraftMode } = await draftMode()

  const menuData = await sanityFetch<{
    tags: { _id: string; title: string; slug: { current: string } }[]
    featured: {
      _id: string; title: string; slug: { current: string }
      heroImage?: { asset: { _ref: string }; alt?: string }
      tags?: { _id: string; title: string }[]
    } | null
  }>({ query: MENU_QUERY })

  return (
    <SmoothScroll>
      <div className="flex min-h-screen flex-col bg-navy">
        <Header tags={menuData.tags} featured={menuData.featured} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <SanityLive />
      {isDraftMode && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </SmoothScroll>
  )
}
