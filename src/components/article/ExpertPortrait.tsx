import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

/**
 * Rundt ekspertportrett med navn buet langs nedre bue og rolle/firma langs øvre –
 * slik trykksaken presenterer kilde-portrettene (megler/banksjef). Teksten følger
 * en SVG-bue (textPath) i signaturfargen. Fotoet beskjæres sirkulært (object-cover),
 * så kvadratiske portretter passer best.
 *
 * Én fast størrelse (280px) overalt – både når portrettet står alene som topp og
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
  const src = urlFor(image).width(540).height(540).url()
  // Unik id-suffiks per portrett (fra bilde-referansen) — uten den ville flere
  // portretter på samme side delt SVG-id (ugyldig HTML). Server-komponent, så vi
  // utleder deterministisk i stedet for useId.
  const uid = (image.asset._ref || name || 'x').replace(/[^a-zA-Z0-9]/g, '')
  const roleArcId = `expert-arc-role-${uid}`
  const nameArcId = `expert-arc-name-${uid}`

  return (
    <div className="relative aspect-square w-full max-w-[280px]">
      {/* Sirkulært foto (radius 96 i viewBox-enheter = 64 % av bredden) */}
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{ boxShadow: `0 0 0 2px ${color}` }}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes="280px" />
      </div>

      {/* Buet rolle (øverst) + navn (nederst). Buene er valgt slik at tekstens
          INNERKANT (mot fotoet) ligger på samme sirkellinje for begge – ellers
          ville rollen øverst (som vokser utover) ligget lenger fra fotoet enn
          navnet nederst (som vokser innover). Navn r=131, rolle r=117.5 ≈ navnets
          innerkant (131 − versalhøyde). */}
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          {/* Øvre bue (rolle): venstre → topp → høyre, lesbar. Buen går 250°
              (litt ned på hver side), så også lange roller får plass i en
              skriftstørrelse som kan leses (minst 12 px på skjerm). */}
          <path id={roleArcId} d="M 53.8,217.4 A 117.5,117.5 0 1,1 246.2,217.4" fill="none" />
          {/* Nedre bue (navn): venstre → bunn → høyre, lesbar */}
          <path id={nameArcId} d="M 19,150 A 131,131 0 0,0 281,150" fill="none" />
        </defs>
        {name && (
          <text fill={color} className="font-label" fontSize="19" fontWeight="500" letterSpacing="2">
            <textPath href={`#${nameArcId}`} startOffset="50%" textAnchor="middle">
              {name.toUpperCase()}
            </textPath>
          </text>
        )}
        {role && (
          <text fill={color} className="font-label" fontSize="15.5" fontWeight="500" letterSpacing="1.2">
            <textPath href={`#${roleArcId}`} startOffset="50%" textAnchor="middle">
              {role.toUpperCase()}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  )
}
