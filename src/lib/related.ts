// Delt form + flettelogikk for «Les også»-saker i bunnen av alle artikler.
// Tema-først: ekte tema-søsken (samme tag) prioriteres, og vi fyller på med
// nyeste saker når temaet er tynt — slik at blokka aldri står tom.

export interface RelatedArticle {
  _id: string
  title: string
  slug: { current: string }
  type?: string
  teaser?: string
  heroImage?: { asset: { _ref: string }; alt?: string }
  tags?: { _id: string; title: string; slug?: { current: string } }[]
}

// Flett tema-treff foran nyeste-fallback, fjern duplikater, klipp til `limit`.
export function mergeRelated(
  sameTheme: RelatedArticle[] = [],
  recent: RelatedArticle[] = [],
  limit = 3,
): RelatedArticle[] {
  const out: RelatedArticle[] = []
  const seen = new Set<string>()
  for (const a of [...(sameTheme ?? []), ...(recent ?? [])]) {
    if (out.length >= limit) break
    if (!a?._id || seen.has(a._id)) continue
    seen.add(a._id)
    out.push(a)
  }
  return out
}
