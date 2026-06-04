/**
 * Bevegelsesprofil for feature-artikler.
 *
 * Tidligere fantes tre stemnings-temaer (varm/dokumentarisk/leken) som BÅDE
 * styrte animasjon OG farge. Fargen er nå løftet ut: den kommer utelukkende fra
 * accentColor + colorMode (se ScrollyColorContext), nøyaktig som standard-
 * artikler følger trykksaken. Det som er igjen her er ren bevegelse — én rolig,
 * filmatisk profil som gjelder alle feature-saker.
 */

export interface ThemeAnimation {
  duration: number
  ease: string
  stagger: number
  heroTitleEase: string
  heroTitleY: number
  parallaxScrubEase: string
  /** Gallery item entrance */
  galleryEntrance: 'fade' | 'bounce'
}

export interface ThemeConfig {
  animation: ThemeAnimation
}

// Rolig & filmatisk: myke, lange innganger som lar bildene og teksten bære.
// Editorial og dempet — aldri «AI-leken».
const calm: ThemeConfig = {
  animation: {
    duration: 1.3,
    ease: 'power3.out',
    stagger: 0.07,
    heroTitleEase: 'power3.out',
    heroTitleY: 45,
    parallaxScrubEase: 'none',
    galleryEntrance: 'fade',
  },
}

export function getThemeConfig(): ThemeConfig {
  return calm
}
