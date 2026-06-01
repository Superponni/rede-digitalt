export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
// Bumpet for Live Content API + `drafts`-perspektiv (forhåndsvisning)
export const apiVersion = '2025-02-19'

// Read-only token (Viewer-rolle) med tilgang til å lese utkast.
// Brukes kun server-side av forhåndsvisningen — deles aldri med nettleseren.
export const token = process.env.SANITY_API_READ_TOKEN
