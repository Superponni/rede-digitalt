import Link from 'next/link'
import { SetHeaderSurface } from '@/components/layout/HeaderTheme'

/**
 * Norsk 404 — rendres inne i (site)-layouten, så header/meny og footer er på
 * plass og brukeren alltid har en vei videre. Ukjente adresser fanges av
 * [...rest]-ruten som kaller notFound(), og lander her.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-mint px-6 py-28 text-center">
      <SetHeaderSurface surface="light" />
      <p className="font-heading text-[11px] uppercase tracking-[0.3em] text-navy/50">
        Feil 404
      </p>
      <h1 className="mt-5 max-w-2xl font-display text-5xl leading-[1.05] text-navy md:text-6xl">
        Denne siden finnes ikke
      </h1>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-navy/70">
        Siden kan være flyttet eller slettet — eller så har adressen en
        skrivefeil.
      </p>
      <Link
        href="/"
        className="mt-12 inline-flex items-center gap-3 font-heading text-[11px] uppercase tracking-[0.3em] text-navy transition-opacity hover:opacity-70"
      >
        <span className="h-px w-8 bg-current" />
        Tilbake til magasinet
        <span className="h-px w-8 bg-current" />
      </Link>
    </div>
  )
}
