import { defineLive } from 'next-sanity/live'
import type { QueryParams } from 'next-sanity'
import { client } from './client'
import { token } from '../env'

// Felter som IKKE skal stega-kodes: verdiene brukes i logikk (oppslagsnøkler,
// hex-farger, URL-er) der usynlige stega-tegn bryter f.eks. farge-/modus-oppslag,
// fargematch eller embed-URL-er. Matches på feltnavn (siste tekst-segment i
// stien, så array-elementer som regions[0] matcher på 'regions').
// NB: matcher på basenavn, så et felt med samme navn i en annen type mister
// også klikk-til-redigering — bevisst avveining (disse navnene er logikk-felter).
const STEGA_SKIP_FIELDS = [
  'accentColor',
  'colorMode',
  'heroLayout',
  'spotifyUrl',
  'url',
  // medlemstilbud: category er oppslagsnøkkel (fargevalg) + dedup/filter-nøkkel,
  // regions er filter-nøkkel. Usynlige stega-tegn gjør hver verdi unik per
  // dokument, så Set-dedup/filtrering i Presentation lagde én fane per tilbud.
  'category',
  'regions',
]

// Live Content API: gir sanntidsoppdatering i forhåndsvisning (og på publisert
// innhold). `sanityFetch` bytter automatisk til `drafts`-perspektiv når Next.js
// `draftMode()` er på — da brukes `serverToken` til å lese utkast.
const { sanityFetch: liveFetch, SanityLive } = defineLive({
  // stega gjør tekst klikkbar-til-redigering i Presentation. Kodes kun inn når
  // draftMode er på. Tekst som splittes/animeres klient-side må renses med
  // stegaClean() der det skjer (se PullQuote, FullscreenParallax).
  client: client.withConfig({
    useCdn: false,
    stega: {
      studioUrl: '/studio',
      // Ikke kod inn verdier som brukes i logikk (oppslagsnøkler, hex-farger,
      // URL-er) — usynlige stega-tegn der bryter f.eks. farge-/modus-oppslag.
      filter: (props) => {
        // Siste tekst-segment i stien — hopper over tall-indekser, så
        // array-felter (f.eks. regions[0]) matcher på feltnavnet 'regions'.
        const segments = props.sourcePath.filter(
          (s): s is string => typeof s === 'string',
        )
        const key = segments[segments.length - 1]
        if (key && STEGA_SKIP_FIELDS.includes(key)) return false
        return props.filterDefault(props)
      },
    },
  }),
  serverToken: token,
  // Kreves for LIVE draft-oppdatering: `<SanityLive/>` lytter på
  // `client.live.events({ includeDrafts: !!token })` — uten token får
  // nettleseren kun published-events, så draft-edits i Presentation refresher
  // ikke (Comlink-stien håndterer bare perspektiv-bytte, ikke mutasjoner).
  // next-sanity sender dette tokenet til nettleseren KUN når draftMode er på
  // (bak preview-secret), aldri til offentlige besøkende. Må være Viewer-rolle.
  browserToken: token,
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
