/**
 * Fargepaletten for redesignet høsten 2026 (malen «Rede.no website design system»).
 *
 * Ni farger. Verdiene er TOBBs profilfarger (ikke malens avrundede varianter),
 * pluss lyseblå og mørk fiolett som er nye fra malen. Hver farge har tre lyse
 * toner — fargen lagt over hvitt i 10, 20 og 30 % — som brukes til flater.
 */

export type Hue =
  | 'magenta'
  | 'navy'
  | 'yellow'
  | 'purple'
  | 'lightblue'
  | 'teal'
  | 'blue'
  | 'violet'
  | 'green'

export const HUES: Record<Hue, string> = {
  magenta: '#AA0061',
  navy: '#003865',
  yellow: '#F6BE00',
  purple: '#6B3077',
  lightblue: '#49C5FA',
  teal: '#487A7B',
  blue: '#0047BB',
  violet: '#3E2A57',
  green: '#74AA50',
}

export const CREAM = '#FEFAE8'
export const NAVY = HUES.navy
export const MAGENTA = HUES.magenta

/** Fargen lagt over hvitt i `pct` prosent (10 = svært lys, 30 = tydelig tonet). */
export function tint(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(255 - (255 - c) * (pct / 100))
  const r = mix((n >> 16) & 255)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`
}

/** Hårstreker og dempet tekst — marineblå med gjennomsiktighet, som i malen. */
export const RULE = 'rgba(0,56,101,0.5)'
export const RULE_SOFT = 'rgba(0,56,101,0.3)'

/* ── Kortpaletter ───────────────────────────────────────────────────────────
   Faste kombinasjoner av bakgrunn, tittelfarge og pilknapp — nøyaktig de som
   vises i malen. Kortene trekkes til en palett, men kombinasjonene blandes
   aldri på tvers. */

export interface CardPalette {
  key: 'purple' | 'lightblue' | 'teal' | 'yellow' | 'navy'
  /** Mørkt kort (full farge) — lys tekst, og maks ett per rad. */
  solid: boolean
  bg: string
  bgHover: string
  title: string
  text: string
  tagBg: string
  tagText: string
  /** Pilknapp på tekstkort (uten bilde). På bildekort er sirkelen alltid hvit. */
  cta: string
  ctaGlyph: string
  ctaLabel: string
  /** Pilens farge i den hvite sirkelen på bildekort. */
  ink: string
}

const TAG_ON_TINT = 'rgba(0,56,101,0.15)'

export const CARD_PALETTES: CardPalette[] = [
  {
    key: 'purple',
    solid: false,
    bg: tint(HUES.purple, 30),
    bgHover: tint(HUES.purple, 40),
    title: HUES.violet,
    text: 'rgba(62,42,87,0.85)',
    tagBg: 'rgba(62,42,87,0.18)',
    tagText: HUES.violet,
    cta: HUES.violet,
    ctaGlyph: '#FFFFFF',
    ctaLabel: HUES.violet,
    ink: HUES.violet,
  },
  {
    key: 'lightblue',
    solid: false,
    bg: tint(HUES.lightblue, 30),
    bgHover: tint(HUES.lightblue, 40),
    title: NAVY,
    text: 'rgba(0,56,101,0.85)',
    tagBg: TAG_ON_TINT,
    tagText: NAVY,
    cta: HUES.blue,
    ctaGlyph: '#FFFFFF',
    ctaLabel: HUES.blue,
    ink: NAVY,
  },
  {
    key: 'teal',
    solid: false,
    bg: tint(HUES.teal, 20),
    bgHover: tint(HUES.teal, 30),
    title: HUES.blue,
    text: 'rgba(0,56,101,0.85)',
    tagBg: TAG_ON_TINT,
    tagText: NAVY,
    cta: HUES.blue,
    ctaGlyph: '#FFFFFF',
    ctaLabel: HUES.blue,
    ink: NAVY,
  },
  {
    key: 'yellow',
    solid: false,
    bg: tint(HUES.yellow, 30),
    bgHover: tint(HUES.yellow, 40),
    title: MAGENTA,
    text: 'rgba(0,56,101,0.85)',
    tagBg: TAG_ON_TINT,
    tagText: NAVY,
    cta: HUES.violet,
    ctaGlyph: '#FFFFFF',
    ctaLabel: HUES.violet,
    ink: NAVY,
  },
  {
    key: 'navy',
    solid: true,
    bg: NAVY,
    bgHover: '#144A73',
    title: '#FFFFFF',
    text: tint(NAVY, 30),
    tagBg: 'rgba(255,255,255,0.22)',
    tagText: '#FFFFFF',
    cta: HUES.lightblue,
    ctaGlyph: NAVY,
    ctaLabel: '#FFFFFF',
    ink: NAVY,
  },
]

/** Stabil hash av en streng (FNV-1a) — samme sak gir alltid samme tall. */
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Trekker en kortpalett til hver sak. Trekningen er «tilfeldig, men fast»: den
 * regnes ut fra sakens id, så en sak får samme farge hver gang siden lastes.
 *
 * To regler rydder opp etter trekningen (kortene står `perRow` i bredden):
 *   1. Ingen like naboer — heller ikke rett over hverandre.
 *   2. Maks ett mørkt kort per rad.
 * Kolliderer trekningen, får kortet neste palett i lista.
 *
 * Har saken en håndvalgt kortfarge (feltet «Kortfarge» i Studio), brukes den
 * uansett — da er det nabokortene som viker.
 */
export function assignCardPalettes(
  items: { _id: string; cardColor?: string }[],
  perRow = 3,
): CardPalette[] {
  const n = CARD_PALETTES.length
  const out: CardPalette[] = []
  items.forEach(({ _id, cardColor }, i) => {
    const chosen = CARD_PALETTES.find((p) => p.key === cardColor)
    if (chosen) {
      out.push(chosen)
      return
    }
    const row = out.slice(i - (i % perRow), i)
    // Naboer på alle skjermbredder: kortet rett før (mobil: over, ellers til
    // venstre), to før (nettbrett: over) og `perRow` før (desktop: over).
    const near = [out[i - 1], out[i - 2], out[i - perRow]].filter(Boolean).map((c) => c.key)
    // Håndvalgt farge på neste kort: unngå den også.
    const next = items[i + 1]?.cardColor
    const start = hash(_id.replace(/^drafts\./, '')) % n
    const order = CARD_PALETTES.map((_, k) => CARD_PALETTES[(start + k) % n])
    const pick =
      // Strengt: ingen like naboer, maks ett mørkt kort per rad.
      order.find(
        (c) =>
          !near.includes(c.key) &&
          c.key !== next &&
          !(c.solid && (row.some((r) => r.solid) || next === 'navy')),
      ) ??
      // Går ikke det opp: i det minste ikke lik kortet rett før.
      order.find((c) => c.key !== out[i - 1]?.key) ??
      order[0]
    out.push(pick)
  })
  return out
}

/* ── Ukentlig stokking ──────────────────────────────────────────────────────
   Eldre saker nederst på forsiden bytter plass én gang i uka. Rekkefølgen
   regnes ut fra ukenummeret, så alle ser det samme gjennom en uke. */

function weekSeed(date: Date): number {
  // Hele uker siden mandag 5. januar 1970 — skifter natt til mandag (UTC).
  return Math.floor((date.getTime() / 86400000 - 4) / 7)
}

export function weeklyShuffle<T extends { _id: string }>(items: T[], date = new Date()): T[] {
  const seed = weekSeed(date)
  return [...items].sort(
    (a, b) => hash(`${seed}:${a._id}`) - hash(`${seed}:${b._id}`) || a._id.localeCompare(b._id),
  )
}
