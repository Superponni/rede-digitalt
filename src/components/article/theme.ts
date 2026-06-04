/**
 * Fargeidentitet for standard-artikler.
 *
 * Trykksaken gir hver sak ÉN signaturfarge fra TOBB-paletten, brukt på enten
 * lys bakgrunn (farget tittel), full farget flate, eller en mørk flate (kåseri).
 * Denne hjelperen oversetter (accentColor, colorMode) → konkrete farger som
 * StandardArticle og PortableTextRenderer bruker.
 */

export type AccentColor =
  | 'navy'
  | 'teal'
  | 'purple'
  | 'magenta'
  | 'blue'
  | 'green'
  | 'gold'

export type ColorMode = 'light' | 'tinted' | 'filled' | 'dark'
export type HeroLayout = 'image-first' | 'heading-first' | 'side' | 'none' | 'portrait'

// base = TOBB-paletten (se globals.css). tint = lys pastell for tittel på mørk/farget
// flate. pale = svært lys toning av fargen brukt som bakgrunn i «tinted»-modus
// (som de fleste sakene i trykksaken: lys rosa/lilla/blå/grønn).
export const ACCENTS: Record<AccentColor, { base: string; tint: string; pale: string }> = {
  navy: { base: '#003865', tint: '#9DBBD6', pale: '#E2EAF1' },
  teal: { base: '#487A7B', tint: '#AECECE', pale: '#E4EDED' },
  purple: { base: '#6B3077', tint: '#D8C2E0', pale: '#EDE4F1' },
  magenta: { base: '#AA0061', tint: '#F0A9CC', pale: '#F7E2EE' },
  blue: { base: '#0047BB', tint: '#A9C2EE', pale: '#E1E8F7' },
  green: { base: '#74AA50', tint: '#C2DBAE', pale: '#EAF2E2' },
  gold: { base: '#F6BE00', tint: '#FCE38C', pale: '#FBF1CE' },
}

const MINT = '#F1F8F0'
const NAVY = '#003865'
const GOLD = '#F6BE00'

export interface ArticleTheme {
  isDark: boolean
  pageBg: string
  title: string // H1
  subtitle: string // undertittel (kursiv)
  standfirst: string // ingress (fet)
  heading: string // H2
  subhead: string // H3/H4 + sitat-strek
  bodyText: string
  muted: string // byline/meta
  link: string
  chipBg: string
  chipText: string
  factBg: string
  factTitle: string
  factText: string
  factRule: string
}

export function getArticleTheme(
  accentColor: AccentColor = 'navy',
  colorMode: ColorMode = 'light',
): ArticleTheme {
  const accent = ACCENTS[accentColor] ?? ACCENTS.navy

  if (colorMode === 'filled') {
    return {
      isDark: true,
      pageBg: accent.base,
      title: accent.tint,
      subtitle: accent.tint,
      standfirst: '#FFFFFF',
      heading: '#FFFFFF',
      subhead: accent.tint,
      bodyText: 'rgba(255,255,255,0.92)',
      muted: 'rgba(255,255,255,0.65)',
      link: accent.tint,
      chipBg: 'rgba(255,255,255,0.15)',
      chipText: 'rgba(255,255,255,0.85)',
      factBg: 'rgba(255,255,255,0.10)',
      factTitle: accent.tint,
      factText: 'rgba(255,255,255,0.92)',
      factRule: accent.tint,
    }
  }

  if (colorMode === 'dark') {
    return {
      isDark: true,
      pageBg: NAVY,
      title: MINT,
      subtitle: accent.tint,
      standfirst: MINT,
      heading: MINT,
      subhead: GOLD,
      bodyText: 'rgba(230,239,234,0.90)',
      muted: 'rgba(230,239,234,0.55)',
      link: GOLD,
      chipBg: 'rgba(255,255,255,0.12)',
      chipText: 'rgba(230,239,234,0.80)',
      factBg: 'rgba(255,255,255,0.06)',
      factTitle: GOLD,
      factText: 'rgba(230,239,234,0.90)',
      factRule: GOLD,
    }
  }

  // light (standard): lys mint-flate, farget tittel — som oppskrift A i print.
  // tinted: samme, men bakgrunnen er en lys toning av signaturfargen (oppskrift
  // som de fleste print-sakene bruker).
  const lightTheme: ArticleTheme = {
    isDark: false,
    pageBg: colorMode === 'tinted' ? accent.pale : MINT,
    title: accent.base,
    subtitle: accent.base,
    standfirst: accent.base,
    heading: accent.base,
    subhead: accent.base,
    bodyText: '#143049',
    muted: 'rgba(20,48,73,0.55)',
    link: '#0047BB',
    chipBg: 'rgba(0,56,101,0.10)',
    chipText: 'rgba(0,56,101,0.60)',
    factBg: accent.base,
    factTitle: '#FFFFFF',
    factText: 'rgba(255,255,255,0.90)',
    factRule: accent.tint,
  }
  return lightTheme
}
