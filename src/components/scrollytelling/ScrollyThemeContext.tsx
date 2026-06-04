'use client'

import { createContext, useContext } from 'react'
import { type ThemeConfig, getThemeConfig } from './theme-config'

// Bevegelsesprofilen er nå én felles, rolig profil for alle feature-saker.
// Provideren beholdes så seksjonene kan lese animasjonsverdiene via hook, men
// den tar ikke lenger noe tema-valg — farge styres separat (ScrollyColorContext).
const ScrollyThemeContext = createContext<ThemeConfig>(getThemeConfig())

export function ScrollyThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ScrollyThemeContext.Provider value={getThemeConfig()}>
      {children}
    </ScrollyThemeContext.Provider>
  )
}

export function useScrollyTheme(): ThemeConfig {
  return useContext(ScrollyThemeContext)
}
