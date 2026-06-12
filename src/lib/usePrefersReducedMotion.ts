'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

/**
 * Lytter på `prefers-reduced-motion` via useSyncExternalStore — riktig måte å
 * abonnere på en ekstern kilde (media query) på. Server-snapshot er `false`
 * (matcher SSR, ingen hydration-mismatch); klient-snapshot leser brukerens
 * faktiske preferanse og oppdateres hvis OS-innstillingen endres.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
