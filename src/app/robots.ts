import type { MetadataRoute } from 'next'
import { siteIsIndexable, absoluteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  // Demoen er stengt for søkemotorer. Når NEXT_PUBLIC_SITE_INDEXABLE=true
  // (settes i Vercel ved lansering) åpnes alt unntatt Studio og API.
  if (!siteIsIndexable) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}
