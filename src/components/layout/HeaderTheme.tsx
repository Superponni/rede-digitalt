'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// «Surface» = flaten som ligger UNDER menyen øverst på siden.
//   'dark'  → mørk hero/flate ⇒ hvit logo + diskret scrim
//   'light' → lys flate        ⇒ marineblå logo
export type HeaderSurface = 'light' | 'dark'

interface HeaderSurfaceContextValue {
  override: HeaderSurface | null
  setOverride: (surface: HeaderSurface | null) => void
}

const HeaderSurfaceContext = createContext<HeaderSurfaceContextValue>({
  override: null,
  setOverride: () => {},
})

// Provider legges i (site)/layout slik at både Header og innholdet i <main>
// deler samme kontekst.
export function HeaderSurfaceProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<HeaderSurface | null>(null)
  return (
    <HeaderSurfaceContext.Provider value={{ override, setOverride }}>
      {children}
    </HeaderSurfaceContext.Provider>
  )
}

export function useHeaderSurface() {
  return useContext(HeaderSurfaceContext)
}

// Rendres av en side/artikkel som vil overstyre menyfargen ut fra sin egen
// topp (f.eks. en standard-artikkel med lys mint-topp). Nullstilles automatisk
// når man navigerer bort, så grunninnstillingen (utledet fra ruten) gjelder igjen.
export function SetHeaderSurface({ surface }: { surface: HeaderSurface }) {
  const { setOverride } = useHeaderSurface()
  useEffect(() => {
    setOverride(surface)
    return () => setOverride(null)
  }, [surface, setOverride])
  return null
}
