import type { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'
import { SITEMAP_QUERY } from '@/sanity/lib/queries'
import { absoluteUrl } from '@/lib/site'

interface SitemapData {
  articles: { slug: string; _updatedAt: string; publishedAt?: string }[]
  tags: { slug: string; _updatedAt: string }[]
  editorial: { _updatedAt: string } | null
  memberOffersUpdated: string | null
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await client.fetch<SitemapData>(SITEMAP_QUERY)

  const now = new Date()
  // Forsiden «sist endret» = nyeste publiserte artikkel, ikke `now` — ellers
  // signaliserer sitemapen falsk endring hver gang Google leser den.
  const newestArticle = (data.articles || [])[0]
  const frontpageModified = newestArticle ? new Date(newestArticle._updatedAt) : now

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: frontpageModified, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/om'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  if (data.memberOffersUpdated) {
    staticPages.push({
      url: absoluteUrl('/medlemstilbud'),
      lastModified: new Date(data.memberOffersUpdated),
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  if (data.editorial) {
    staticPages.push({
      url: absoluteUrl('/leder'),
      lastModified: new Date(data.editorial._updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  const articlePages: MetadataRoute.Sitemap = (data.articles || []).map((a) => ({
    url: absoluteUrl(`/artikler/${a.slug}`),
    lastModified: new Date(a._updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const tagPages: MetadataRoute.Sitemap = (data.tags || []).map((t) => ({
    url: absoluteUrl(`/tema/${t.slug}`),
    lastModified: new Date(t._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.4,
  }))

  return [...staticPages, ...articlePages, ...tagPages]
}
