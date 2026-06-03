// Sentral kilde for «hvor bor siden» og «skal den finnes i Google».
// Brukes av metadata, sitemap, robots, JSON-LD og OG-bilder slik at det finnes
// ÉN sannhet — og lansering = å snu ett miljøflagg, ikke jakte på hardkodede
// URL-er rundt i koden.

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

function resolveSiteUrl(): string {
  // 1. Eksplisitt domene vinner alltid. Sett NEXT_PUBLIC_SITE_URL til det ekte
  //    domenet ved lansering (f.eks. https://rede.tobb.no).
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL)
  }
  // 2. Vercel sitt stabile produksjonsdomene (settes automatisk i prod).
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  // 3. Vercel preview-/branch-deploy (unik URL per deploy).
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // 4. Lokal utvikling.
  return 'http://localhost:3000'
}

export const siteUrl = resolveSiteUrl()

// Indekserings-bryteren. Demoen skal IKKE finnes i Google før vi lanserer på
// ekte domene — derfor er standarden «av». Sett NEXT_PUBLIC_SITE_INDEXABLE=true
// (i Vercel) når vi er klare, så åpner robots.txt, metadata og sitemap seg.
export const siteIsIndexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === 'true'

// Navn brukt i metadata, OG-bilder og strukturerte data.
export const siteName = 'Rede'
export const sitePublisher = 'TOBB'
export const siteDescription =
  'Rede er TOBBs medlemsmagasin med historier om bolig, nabolag og livet i Trøndelag.'

// Bygg en absolutt URL fra en relativ sti (til canonical, OG, sitemap, JSON-LD).
export function absoluteUrl(path = '/'): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
