export type ScrollyThemeName = 'warm' | 'documentary' | 'playful'

export interface ThemeAnimation {
  duration: number
  ease: string
  stagger: number
  heroTitleEase: string
  heroTitleY: number
  parallaxScrubEase: string
  /** Gallery item entrance — playful bounces in from sides with rotation */
  galleryEntrance: 'fade' | 'bounce'
}

export interface ThemeColors {
  accent: string
  accentRgb: string // for rgba usage
  progressBar: string
}

export interface ThemeConfig {
  name: ScrollyThemeName
  animation: ThemeAnimation
  colors: ThemeColors
}

const warm: ThemeConfig = {
  name: 'warm',
  animation: {
    duration: 1.4,
    ease: 'power3.out',
    stagger: 0.08,
    heroTitleEase: 'power3.out',
    heroTitleY: 50,
    parallaxScrubEase: 'none',
    galleryEntrance: 'fade',
  },
  colors: {
    accent: '#F6BE00',
    accentRgb: '246, 190, 0',
    progressBar: '#F6BE00',
  },
}

const documentary: ThemeConfig = {
  name: 'documentary',
  animation: {
    duration: 1.0,
    ease: 'power2.out',
    stagger: 0.05,
    heroTitleEase: 'power2.out',
    heroTitleY: 35,
    parallaxScrubEase: 'none',
    galleryEntrance: 'fade',
  },
  colors: {
    accent: '#487A7B',
    accentRgb: '72, 122, 123',
    progressBar: '#487A7B',
  },
}

const playful: ThemeConfig = {
  name: 'playful',
  animation: {
    duration: 0.8,
    ease: 'back.out(1.4)',
    stagger: 0.04,
    heroTitleEase: 'elastic.out(1, 0.5)',
    heroTitleY: 60,
    parallaxScrubEase: 'none',
    galleryEntrance: 'bounce',
  },
  colors: {
    accent: '#6B3077',
    accentRgb: '107, 48, 119',
    progressBar: '#6B3077',
  },
}

export const THEME_MAP: Record<ScrollyThemeName, ThemeConfig> = {
  warm,
  documentary,
  playful,
}

export function getThemeConfig(name?: ScrollyThemeName): ThemeConfig {
  // Fall alltid tilbake til 'warm' for manglende/ukjent tema (f.eks. stega-
  // kodede eller uferdige utkast-verdier) — aldri returner undefined.
  return THEME_MAP[name as ScrollyThemeName] ?? THEME_MAP.warm
}
