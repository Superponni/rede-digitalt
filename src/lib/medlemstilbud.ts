// Delt typedefinisjon + presentasjonslogikk for medlemstilbud.
// Dataene hentes fra Sanity (se MEMBER_OFFERS_QUERY); denne fila eier kun
// fargesystem, sortering og småhjelpere som både server og klient bruker.

export interface SanityImageRef {
  asset?: { _ref?: string } | null
  alt?: string | null
}

export interface MemberOffer {
  _id: string
  businessName: string
  category: string
  regions: string[] | null
  discountSummary: string | null
  shortDescription: string | null
  discountDetails: string | null
  howToRedeem: string | null
  website: string | null
  phone: string | null
  locations: string[] | null
  featured?: boolean | null
  logo?: SanityImageRef | null
  relatedArticleSlug?: string | null
}

/**
 * Hver kategori får én av TOBBs merkevarefarger. Dette gir kortene variasjon
 * (anti-AI) samtidig som vi holder full kontroll — annonsørens eneste «egne»
 * element blir logoen, alt annet settes i Redes uttrykk.
 */
export interface CategoryStyle {
  /** Hex-farge for kategorien */
  color: string
  /** Lesbar tekstfarge oppå fargeflaten */
  on: string
}

export const CATEGORY_ORDER = [
  'Bygg & hjem',
  'Tjenester & helse',
  'Sport & friluft',
  'Kultur & underholdning',
  'Bank & finans',
  'Hotell & reise',
  'Mat & drikke',
] as const

export const categoryStyles: Record<string, CategoryStyle> = {
  'Bygg & hjem': { color: '#487A7B', on: '#ffffff' }, // teal
  'Tjenester & helse': { color: '#0047BB', on: '#ffffff' }, // tobb-blue
  'Sport & friluft': { color: '#74AA50', on: '#ffffff' }, // tobb-green
  'Kultur & underholdning': { color: '#AA0061', on: '#ffffff' }, // magenta
  'Bank & finans': { color: '#003865', on: '#ffffff' }, // navy
  'Hotell & reise': { color: '#6B3077', on: '#ffffff' }, // purple
  'Mat & drikke': { color: '#F6BE00', on: '#003865' }, // gold m/ navy tekst
}

export function styleFor(category: string): CategoryStyle {
  return categoryStyles[category] ?? { color: '#003865', on: '#ffffff' }
}

/** Initialer som logo-plassholder når en bedrift mangler logofil. */
export function initialsFor(name: string): string {
  const clean = name.replace(/\(.*?\)/g, '').trim()
  const words = clean.split(/[\s/]+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/** Rekkefølge for regionsfilter — Trondheim/brede først, så lokale. */
export const REGION_ORDER = [
  'Trondheim',
  'Hele Trøndelag',
  'Nasjonalt/nett',
  'Innherred',
  'Stjørdal',
  'Steinkjer',
  'Verdal',
  'Namsos',
  'Rørvik',
  'Kolvereid',
]

export function sortedRegions(offers: MemberOffer[]): string[] {
  const found = new Set<string>()
  offers.forEach((o) => (o.regions ?? []).forEach((r) => found.add(r)))
  const ordered = REGION_ORDER.filter((r) => found.has(r))
  const extra = [...found].filter((r) => !REGION_ORDER.includes(r)).sort()
  return [...ordered, ...extra]
}

export function categoriesPresent(offers: MemberOffer[]): string[] {
  const found = new Set(offers.map((o) => o.category))
  const ordered = CATEGORY_ORDER.filter((c) => found.has(c))
  const extra = [...found].filter((c) => !CATEGORY_ORDER.includes(c as never)).sort()
  return [...ordered, ...extra]
}

export function countFor(offers: MemberOffer[], category: string): number {
  return offers.filter((o) => o.category === category).length
}
