'use client'

import { createContext, useContext } from 'react'
import {
  getArticleTheme,
  ACCENTS,
  type AccentColor,
  type ColorMode,
} from '@/components/article/theme'

/**
 * Fargelaget for scrollytelling — bygger på NØYAKTIG samme system som
 * standard-artikler (accentColor + colorMode → getArticleTheme), slik at en
 * scrolly-sak kan være lys/tinted/filled/mørk på lik linje med trykksaken.
 *
 * I tillegg eksponeres signaturfargen som hex + rgb, fordi scrolly har
 * dekor-elementer (nummer-sirkler, framdriftslinje, sitatstreker) som trenger
 * rgba-toninger ut over det getArticleTheme gir.
 */
export interface ScrollyColors {
  isDark: boolean
  bg: string
  /** Store titler (hero/H1) */
  title: string
  /** Seksjonsoverskrifter (H2/H3) */
  heading: string
  body: string
  muted: string
  subtitle: string
  /** Signaturfarge — sirkler, streker, tall, framdrift */
  accent: string
  accentRgb: string
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

export function resolveScrollyColors(
  accentColor: AccentColor = 'navy',
  colorMode: ColorMode = 'light',
): ScrollyColors {
  const at = getArticleTheme(accentColor, colorMode)
  // Signaturfargen: på lys/tinted er det den fulle fargen, på mørk/filled en
  // lysere tone som leses mot mørk flate. at.subhead følger akkurat den logikken.
  const accent = at.subhead
  // På lyse flater må «dempet» tekst (bildetekst, byline, attribusjon) fortsatt
  // være tydelig lesbar — 55 % blir for grått på pale bakgrunn.
  const muted = at.isDark ? at.muted : 'rgba(20, 48, 73, 0.72)'
  return {
    isDark: at.isDark,
    bg: at.pageBg,
    title: at.title,
    heading: at.heading,
    body: at.bodyText,
    muted,
    subtitle: at.subtitle,
    accent,
    accentRgb: hexToRgb(accent.startsWith('#') ? accent : ACCENTS[accentColor].base),
  }
}

const ScrollyColorContext = createContext<ScrollyColors>(resolveScrollyColors('navy', 'dark'))

export function ScrollyColorProvider({
  accentColor,
  colorMode,
  children,
}: {
  accentColor?: AccentColor
  colorMode?: ColorMode
  children: React.ReactNode
}) {
  return (
    <ScrollyColorContext.Provider value={resolveScrollyColors(accentColor, colorMode)}>
      {children}
    </ScrollyColorContext.Provider>
  )
}

export function useScrollyColors() {
  return useContext(ScrollyColorContext)
}
