import type { Metadata } from 'next'
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
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  )
}
