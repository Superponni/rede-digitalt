import { Roboto, Eczar, Bitter, Instrument_Serif } from 'next/font/google'

// Gastromond (kun logoen) lastes via Adobe Fonts i layout.tsx
// font-family: "gastromond", serif

// Brødtekst og etiketter — Roboto (reserve for Depot New, som ikke er lagt inn)
// Etiketter settes i versaler med font-label.
export const bodyFont = Roboto({
  subsets: ['latin'],
  variable: '--font-face-body',
  display: 'swap',
  weight: ['300', '400', '700'],
})

// Titler og mellomtitler — Eczar (Regular for titler, Bold for mellomtitler)
export const displayFont = Eczar({
  subsets: ['latin'],
  variable: '--font-face-display',
  display: 'swap',
})

// Ingress, undertittel, teasere og bildetekster — Bitter
export const serifFont = Bitter({
  subsets: ['latin'],
  variable: '--font-face-serif',
  display: 'swap',
  style: ['normal', 'italic'],
})

// Sitater og aksenter — Instrument Serif
export const quoteFont = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-face-quote',
  display: 'swap',
  weight: '400',
  style: ['normal', 'italic'],
})
