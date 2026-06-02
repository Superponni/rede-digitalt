export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
// Bumpet for Live Content API + `drafts`-perspektiv (forhåndsvisning)
export const apiVersion = '2025-02-19'

// Read-only token (Viewer-rolle) med tilgang til å lese utkast. Brukes som
// serverToken (server-side) OG browserToken. next-sanity sender browserToken til
// nettleseren KUN når draftMode er på (i preview/Presentation bak preview-secret)
// — aldri til offentlige besøkende. Derfor må det være Viewer-rolle (kun lesing).
export const token = process.env.SANITY_API_READ_TOKEN
