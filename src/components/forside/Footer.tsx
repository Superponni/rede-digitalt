import Link from 'next/link'
import { RedeLogo } from '@/components/layout/RedeLogo'

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="wrap grid gap-10 py-10 tab:py-16 desk:grid-cols-12 desk:items-end desk:gap-6">
        <div className="flex flex-col gap-4 desk:col-span-7">
          <RedeLogo className="h-[30px] w-auto self-start tab:h-[36px]" />
          <p className="max-w-md text-[15px] leading-normal text-navy-20">
            Rede er TOBBs medlemsmagasin med historier om bolig, nabolag og
            livet i Trøndelag.
          </p>
          <p className="text-[13px] leading-normal text-navy-30">
            Ansvarlig redaktør: Torkil R. Iversen
            <br />
            Nettredaktør: Christoffer Isdahl
          </p>
        </div>
        <div className="label flex flex-wrap items-center gap-x-8 gap-y-3 tracking-[0.06em] desk:col-span-4 desk:col-start-9 desk:justify-end">
          <Link href="/personvern" className="underline-offset-4 hover:underline">
            Personvern
          </Link>
          {/* Toppen har samme lenke, men den er skjult på mobil. Her er
              avsenderen klikkbar på alle skjermstørrelser. */}
          <a
            href="https://www.tobb.no"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            TOBB.no
          </a>
          <span>&copy; {new Date().getFullYear()} TOBB</span>
        </div>
      </div>
    </footer>
  )
}
