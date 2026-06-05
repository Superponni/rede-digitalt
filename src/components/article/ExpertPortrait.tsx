import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

/**
 * Rundt ekspertportrett med navn buet langs nedre bue og rolle/firma langs øvre –
 * slik trykksaken presenterer kilde-portrettene (megler/banksjef). Teksten følger
 * en SVG-bue (textPath) i signaturfargen. Fotoet beskjæres sirkulært (object-cover),
 * så kvadratiske portretter passer best.
 *
 * Én fast størrelse (230px) overalt – både når portrettet står alene som topp og
 * når det ligger som badge oppå et hovedbilde. Da ser ekspertkildene like ut på
 * tvers av saker, uavhengig av om saken også har en illustrasjon.
 */
interface ExpertPortraitProps {
  image: { asset: { _ref: string }; alt?: string }
  alt: string
  name?: string
  role?: string
  color: string
}

export function ExpertPortrait({ image, alt, name, role, color }: ExpertPortraitProps) {
  const src = urlFor(image).width(440).height(440).url()

  return (
    <div className="relative aspect-square w-full max-w-[230px]">
      {/* Sirkulært foto (radius 96 i viewBox-enheter = 64 % av bredden) */}
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{ boxShadow: `0 0 0 2px ${color}` }}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes="230px" />
      </div>

      {/* Buet rolle (øverst) + navn (nederst). Buene er valgt slik at tekstens
          INNERKANT (mot fotoet) ligger på samme sirkellinje for begge – ellers
          ville rollen øverst (som vokser utover) ligget lenger fra fotoet enn
          navnet nederst (som vokser innover). Navn r=128, rolle r=117.5 ≈ navnets
          innerkant (128 − versalhøyde). */}
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          {/* Øvre bue (rolle): venstre → topp → høyre, lesbar */}
          <path id="expert-arc-role" d="M 32.5,150 A 117.5,117.5 0 0,1 267.5,150" fill="none" />
          {/* Nedre bue (navn): venstre → bunn → høyre, lesbar */}
          <path id="expert-arc-name" d="M 22,150 A 128,128 0 0,0 278,150" fill="none" />
        </defs>
        {name && (
          <text fill={color} className="font-heading" fontSize="15" letterSpacing="2.5">
            <textPath href="#expert-arc-name" startOffset="50%" textAnchor="middle">
              {name.toUpperCase()}
            </textPath>
          </text>
        )}
        {role && (
          <text fill={color} className="font-heading" fontSize="10.5" letterSpacing="1.5">
            <textPath href="#expert-arc-role" startOffset="50%" textAnchor="middle">
              {role.toUpperCase()}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  )
}
