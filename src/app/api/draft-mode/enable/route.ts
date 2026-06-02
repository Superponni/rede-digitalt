import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import type { NextRequest } from 'next/server'
import { client } from '@/sanity/lib/client'
import { token } from '@/sanity/env'

// Kalles av Presentation-verktøyet i Studio. Validerer forespørselen mot
// Sanity, skrur på Next.js draftMode og redirecter inn i forhåndsvisningen.
const { GET: enableDraftMode } = defineEnableDraftMode({
  client: client.withConfig({ token }),
})

export async function GET(request: NextRequest): Promise<Response> {
  // Uten token kan ikke utkast leses → forhåndsvisning er umulig. Gi en synlig
  // feil i stedet for å feile stille (token mangler typisk i Vercel før første
  // oppsett — se .env.example).
  if (!token) {
    return new Response(
      'SANITY_API_READ_TOKEN mangler — forhåndsvisning av utkast er deaktivert. ' +
        'Sett tokenet (Viewer-rolle) i .env.local lokalt og i Vercel for prod.',
      { status: 500 },
    )
  }
  return enableDraftMode(request)
}
