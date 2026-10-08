import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy px-6 py-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="font-logo text-3xl italic text-white">Rede</span>
          {/* Minst white/60 på navy — lavere alfa faller under 4,5:1-kravet. */}
          <p className="max-w-md font-label text-sm text-white/70">
            Rede er TOBBs medlemsmagasin med historier om bolig, nabolag og
            livet i Trøndelag.
          </p>
          <p className="font-label text-sm text-white/70">
            Ansvarlig redaktør: Torkil R. Iversen
            <br />
            Nettredaktør: Christoffer Isdahl
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-label text-[11px] uppercase tracking-widest text-white/60">
            <Link href="/personvern" className="transition-colors hover:text-white/90">
              Personvern
            </Link>
            {/* Toppen har samme lenke, men den er skjult på mobil. Her er
                avsenderen klikkbar på alle skjermstørrelser. */}
            <a
              href="https://www.tobb.no"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/90"
            >
              TOBB.no
            </a>
            <span>&copy; {new Date().getFullYear()} TOBB</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
