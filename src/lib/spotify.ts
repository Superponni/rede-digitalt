/**
 * Bygger en Spotify-embed-URL fra en delt lenke. Håndterer variantene
 * redaktører faktisk limer inn — særlig locale-segmentet `/intl-no/` som den
 * gamle naive `.replace()` gjorde til en ødelagt embed.
 *
 * Støtter episode/show/track/playlist/album. Korte `spotify.link`-URL-er (som
 * krever en HTTP-redirect for å løses) støttes ikke — da returneres null, og
 * kallstedet lar være å vise en ødelagt iframe. Bruk full open.spotify.com-URL.
 */
export function spotifyEmbedUrl(url?: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (!u.hostname.endsWith('spotify.com')) return null
    // Fjern locale-prefiks som /intl-no/ — Spotify embed forstår det ikke.
    const path = u.pathname.replace(/^\/intl-[a-z]{2}\//i, '/')
    const match = path.match(/\/(episode|show|track|playlist|album)\/([a-zA-Z0-9]+)/)
    if (!match) return null
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`
  } catch {
    return null
  }
}
