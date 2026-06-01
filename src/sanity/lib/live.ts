import { defineLive } from 'next-sanity/live'
import type { QueryParams } from 'next-sanity'
import { client } from './client'
import { token } from '../env'

// Live Content API: gir sanntidsoppdatering i forhåndsvisning (og på publisert
// innhold). `sanityFetch` bytter automatisk til `drafts`-perspektiv når Next.js
// `draftMode()` er på — da brukes `serverToken` til å lese utkast.
const { sanityFetch: liveFetch, SanityLive } = defineLive({
  client: client.withConfig({ useCdn: false }),
  serverToken: token,
})

export { SanityLive }

// Tynn wrapper som bevarer den eksisterende signaturen i kall-stedene
// (`sanityFetch<T>({ query, params }): Promise<T>`), slik at sidene er urørt.
export async function sanityFetch<T>({
  query,
  params = {},
}: {
  query: string
  params?: QueryParams
}): Promise<T> {
  const { data } = await liveFetch({ query, params })
  return data as T
}
