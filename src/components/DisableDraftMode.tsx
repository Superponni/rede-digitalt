'use client'

import { useEffect, useState } from 'react'

// Knapp for å avslutte forhåndsvisning. Vises kun når siden står frittstående
// (åpnet direkte i nettleseren) — inne i Presentation-iframen håndterer Studio
// dette selv, så der skjuler vi den for å unngå dobbel knapp.
export function DisableDraftMode() {
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(window === window.parent && !window.opener)
  }, [])

  if (!isStandalone) return null

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-50 rounded-full bg-navy px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      Avslutt forhåndsvisning
    </a>
  )
}
