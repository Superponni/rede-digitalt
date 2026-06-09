export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy px-6 py-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="font-display text-3xl italic text-white">Rede</span>
          <p className="max-w-md font-heading text-sm text-white/40">
            Rede er TOBBs medlemsmagasin med historier om bolig, nabolag og
            livet i Trøndelag.
          </p>
          <p className="font-heading text-sm text-white/40">
            Ansvarlig redaktør: Torkil R. Iversen
            <br />
            Nettredaktør: Christoffer Isdahl
          </p>
          <div className="mt-4 font-heading text-[11px] uppercase tracking-widest text-white/30">
            &copy; {new Date().getFullYear()} TOBB
          </div>
        </div>
      </div>
    </footer>
  )
}
