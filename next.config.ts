import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      {
        // Send alt fra det gamle demo-domenet til det ekte domenet, med samme
        // sti — så man aldri lander på «feil» Studio/forhåndsvisning igjen.
        // Treffer kun produksjons-aliaset rededemo.vercel.app (preview-deploys
        // har egne URL-er og påvirkes ikke).
        source: '/:path*',
        has: [{ type: 'host', value: 'rededemo.vercel.app' }],
        destination: 'https://rede.no/:path*',
        // Midlertidig (307) inntil videre. Bytt til permanent: true ved
        // lansering når rede.no er endelig — 308 caches hardt i nettleseren, så
        // vent til alt er verifisert før du gjør den permanent.
        permanent: false,
      },
    ]
  },
}

export default nextConfig
