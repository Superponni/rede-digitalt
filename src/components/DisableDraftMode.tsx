'use client'

import { useSyncExternalStore } from 'react'

// Frittstående = åpnet direkte i nettleseren (ikke i Presentation-iframen).
// Verdien endrer seg aldri etter montering, så subscribe er en no-op.
const noopSubscribe = () => () => {}

// Knapp for å avslutte forhåndsvisning. Vises kun når siden står frittstående
// (åpnet direkte i nettleseren) — inne i Presentation-iframen håndterer Studio
// dette selv, så der skjuler vi den for å unngå dobbel knapp.
export function DisableDraftMode() {
  // useSyncExternalStore i stedet for setState-i-effekt: server-snapshot false
  // (ingen hydration-mismatch), klient-snapshot leser vindusforholdet én gang.
  const isStandalone = useSyncExternalStore(
    noopSubscribe,
    () => window === window.parent && !window.opener,
    () => false,
  )

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
