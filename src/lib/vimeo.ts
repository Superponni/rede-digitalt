// Vimeo-videoer på videosiden. Redaktøren limer inn lenken fra Vimeo i Studio;
// her slår vi den opp via Vimeos oEmbed og får tilbake spilleradressen (med
// den hemmelige `h`-nøkkelen for skjulte videoer) og videoens format, slik at
// stående videoer får en stående spiller.

export interface VimeoEmbed {
  src: string
  width: number
  height: number
  /** Lengde i sekunder, fra Vimeo. */
  duration?: number
}

export async function getVimeoEmbed(url: string | undefined): Promise<VimeoEmbed | null> {
  if (!url) return null
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const data: { html?: string; width?: number; height?: number; duration?: number } = await res.json()
    const iframeSrc = data.html?.match(/src="([^"]+)"/)?.[1]
    if (!iframeSrc || !data.width || !data.height) return null

    const src = new URL(iframeSrc.replace(/&amp;/g, '&'))
    src.searchParams.delete('app_id')
    // «Ikke spor» (ingen informasjonskapsler for statistikk) og en ren spiller
    // uten Vimeos tittel, byline og profilbilde oppå videoen.
    src.searchParams.set('dnt', '1')
    src.searchParams.set('title', '0')
    src.searchParams.set('byline', '0')
    src.searchParams.set('portrait', '0')
    src.searchParams.set('color', 'AA0061')
    return { src: src.toString(), width: data.width, height: data.height, duration: data.duration }
  } catch {
    return null
  }
}
