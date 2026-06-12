/**
 * Fargeidentitet for standard-artikler.
 *
 * Trykksaken gir hver sak ÉN signaturfarge fra TOBB-paletten, brukt på enten
 * lys bakgrunn (farget tittel), full farget flate, eller en mørk flate (kåseri).
 * Denne hjelperen oversetter (accentColor, colorMode) → konkrete farger som
 * StandardArticle og PortableTextRenderer bruker.
 *
 * KONTRAST (WCAG 2.1 AA): gull og grønn er for lyse til å bære hvit tekst
 * eller stå som tekstfarge på lyse flater (gull på mint måler 1,8:1 — kravet
 * er 4,5:1). Derfor har hver aksent et eget `text`-felt (mørk nok variant for
 * tekst på lys flate), og «filled»-modus snur til mørk tekst når flaten er
 * gull/grønn. Endre ikke disse uten å regne kontrast på nytt.
 */

export type AccentColor =
  | 'navy'
  | 'teal'
  | 'purple'
  | 'magenta'
  | 'blue'
  | 'green'
  | 'gold'

export type ColorMode = 'light' | 'tinted' | 'filled' | 'dark' | 'canvas'
export type HeroLayout = 'image-first' | 'heading-first' | 'side' | 'none' | 'portrait'

// base = TOBB-paletten (se globals.css). tint = lys pastell for tittel på mørk/farget
// flate. pale = svært lys toning av fargen brukt som bakgrunn i «tinted»-modus
// (som de fleste sakene i trykksaken: lys rosa/lilla/blå/grønn).
// text = fargen brukt som TEKST på lyse flater — mørknet for gull/grønn/teal slik
// at den består 4,5:1 mot mint/pale (de øvrige er mørke nok som de er).
export const ACCENTS: Record<
  AccentColor,
  { base: string; tint: string; pale: string; text: string }
> = {
  navy: { base: '#003865', tint: '#9DBBD6', pale: '#E2EAF1', text: '#003865' },
  teal: { base: '#487A7B', tint: '#AECECE', pale: '#E4EDED', text: '#3D6A6B' },
  purple: { base: '#6B3077', tint: '#D8C2E0', pale: '#EDE4F1', text: '#6B3077' },
  magenta: { base: '#AA0061', tint: '#F0A9CC', pale: '#F7E2EE', text: '#AA0061' },
  blue: { base: '#0047BB', tint: '#A9C2EE', pale: '#E1E8F7', text: '#0047BB' },
  green: { base: '#74AA50', tint: '#C2DBAE', pale: '#EAF2E2', text: '#4E7530' },
  gold: { base: '#F6BE00', tint: '#FCE38C', pale: '#FBF1CE', text: '#826300' },
}

const MINT = '#F1F8F0'
const NAVY = '#003865'
const GOLD = '#F6BE00'
// Mørk brødtekstfarge på lyse/fargede flater — består 4,5:1 selv på grønn.
const INK = '#143049'
// Lys blå «canvas» — samme flate som forsiden (--color-canvas i globals.css).
const CANVAS = '#D3E4F5'

// Aksenter som er så lyse at flaten deres krever MØRK tekst (filled-modus).
const LIGHT_ACCENT_SURFACES: ReadonlySet<AccentColor> = new Set(['gold', 'green'])

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
  const lightSurface = LIGHT_ACCENT_SURFACES.has(accentColor)

  if (colorMode === 'filled') {
    // Gull/grønn flate: hvit tekst ville målt 1,7–2,8:1 — bruk mørk tekst i
    // stedet (navy på gull = 7,0:1, mørk brødtekst på grønn = 4,9:1).
    if (lightSurface) {
      return {
        isDark: false,
        pageBg: accent.base,
        title: NAVY,
        subtitle: NAVY,
        standfirst: NAVY,
        heading: NAVY,
        subhead: NAVY,
        bodyText: INK,
        muted: 'rgba(13,38,59,0.95)',
        link: '#0A2540',
        chipBg: 'rgba(0,56,101,0.12)',
        chipText: 'rgba(13,38,59,0.90)',
        factBg: 'rgba(255,255,255,0.50)',
        factTitle: NAVY,
        factText: INK,
        factRule: NAVY,
      }
    }
    return {
      isDark: true,
      pageBg: accent.base,
      title: accent.tint,
      subtitle: accent.tint,
      standfirst: '#FFFFFF',
      heading: '#FFFFFF',
      subhead: accent.tint,
      bodyText: 'rgba(255,255,255,0.92)',
      muted: 'rgba(255,255,255,0.85)',
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
      muted: 'rgba(230,239,234,0.72)',
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
  // canvas: lys blå flate som forsiden, ellers samme lyse oppsett som «light».
  // Faktaboksen fyller flaten med aksentens BASE — på gull/grønn må den derfor
  // ha mørk tekst (hvit på gull = 1,9:1).
  const lightTheme: ArticleTheme = {
    isDark: false,
    pageBg: colorMode === 'tinted' ? accent.pale : colorMode === 'canvas' ? CANVAS : MINT,
    title: accent.text,
    subtitle: accent.text,
    standfirst: accent.text,
    heading: accent.text,
    subhead: accent.text,
    bodyText: INK,
    muted: 'rgba(20,48,73,0.72)',
    link: '#0047BB',
    chipBg: 'rgba(0,56,101,0.10)',
    chipText: 'rgba(0,56,101,0.75)',
    factBg: accent.base,
    factTitle: lightSurface ? NAVY : '#FFFFFF',
    factText: lightSurface ? INK : 'rgba(255,255,255,0.90)',
    factRule: lightSurface ? NAVY : accent.tint,
  }
  return lightTheme
}
