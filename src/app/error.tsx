'use client'

/**
 * Norsk feilside — fanger uventede feil under root-layouten, inkludert feil i
 * (site)-layouten (f.eks. hvis Sanity er utilgjengelig). Rendres uten header
 * (den ligger i site-layouten som kan være kilden til feilen), så siden er
 * selvforsynt med vei tilbake.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mint px-6 py-28 text-center">
      <p className="font-heading text-[11px] uppercase tracking-[0.3em] text-navy/50">
        Rede
      </p>
      <h1 className="mt-5 max-w-2xl font-display text-5xl leading-[1.05] text-navy md:text-6xl">
        Noe gikk galt
      </h1>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-navy/70">
        Vi klarte ikke å vise siden akkurat nå. Prøv igjen om et øyeblikk.
      </p>
      <div className="mt-12 flex flex-col items-center gap-6">
        <button
          onClick={reset}
          className="cursor-pointer border border-navy px-7 py-3 font-heading text-[11px] uppercase tracking-[0.3em] text-navy transition-colors hover:bg-navy hover:text-mint"
        >
          Prøv igjen
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-3 font-heading text-[11px] uppercase tracking-[0.3em] text-navy transition-opacity hover:opacity-70"
        >
          <span className="h-px w-8 bg-current" />
          Til forsiden
          <span className="h-px w-8 bg-current" />
        </a>
      </div>
    </div>
  )
}
