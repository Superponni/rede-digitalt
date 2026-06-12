import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { Header } from '@/components/forside/Header'
import { Footer } from '@/components/forside/Footer'
import { HeaderSurfaceProvider } from '@/components/layout/HeaderTheme'
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
      <HeaderSurfaceProvider>
        <div className="flex min-h-screen flex-col bg-canvas">
          {/* Skip-lenke: synlig kun ved tastaturfokus, hopper forbi header/meny
              rett til hovedinnholdet. */}
          <a
            href="#main"
            className="sr-only z-[60] rounded-br-lg bg-navy px-5 py-3 font-heading text-[11px] uppercase tracking-[0.2em] text-mint focus:not-sr-only focus:absolute focus:left-0 focus:top-0"
          >
            Hopp til innhold
          </a>
          <Header tags={menuData.tags} featured={menuData.featured} />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </div>
      </HeaderSurfaceProvider>
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
