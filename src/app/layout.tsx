import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { SanityLive } from '@/sanity/lib/live'
import { bodyFont, headingFont } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Rede – Et magasin for TOBB-medlemmer',
    template: '%s | Rede',
  },
  description:
    'Rede er TOBBs medlemsmagasin med historier om bolig, nabolag og livet i Trondheim.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <html
      lang="no"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <head>
        {/* Adobe Fonts — Gastromond (display font) */}
        <link rel="stylesheet" href="https://use.typekit.net/ybg3phx.css" />
      </head>
      <body className="min-h-full flex flex-col font-body">
        {children}
        <SanityLive />
        {isDraftMode && (
          <>
            <VisualEditing />
            <a
              href="/api/draft-mode/disable"
              className="fixed bottom-4 right-4 z-50 rounded-full bg-navy px-4 py-2 text-sm font-medium text-white shadow-lg"
            >
              Avslutt forhåndsvisning
            </a>
          </>
        )}
      </body>
    </html>
  )
}
