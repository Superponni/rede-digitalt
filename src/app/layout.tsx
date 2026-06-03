import type { Metadata } from 'next'
import { bodyFont, headingFont } from './fonts'
import { siteUrl, siteName, siteDescription } from '@/lib/site'
import { metaRobots } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationLd, webSiteLd } from '@/lib/jsonld'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Rede – Et magasin for TOBB-medlemmer',
    template: '%s | Rede',
  },
  description: siteDescription,
  // Styres av NEXT_PUBLIC_SITE_INDEXABLE — av på demoen, på ved lansering.
  robots: metaRobots(),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName,
    locale: 'nb_NO',
    url: siteUrl,
    title: 'Rede – Et magasin for TOBB-medlemmer',
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
        <JsonLd data={[organizationLd(), webSiteLd()]} />
        {children}
      </body>
    </html>
  )
}
