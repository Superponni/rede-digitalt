import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/sanity/lib/client'
import { token } from '@/sanity/env'

// Kalles av Presentation-verktøyet i Studio. Validerer forespørselen mot
// Sanity, skrur på Next.js draftMode og redirecter inn i forhåndsvisningen.
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
})
