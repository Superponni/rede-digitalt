import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

/**
 * Rundt ekspertportrett med navn buet langs øvre bue og rolle/firma langs nedre –
 * slik trykksaken presenterer kilde-portrettene (megler/banksjef). Teksten følger
 * en SVG-bue (textPath) i signaturfargen. Fotoet beskjæres sirkulært (object-cover),
 * så kvadratiske portretter passer best.
 */
interface ExpertPortraitProps {
  image: { asset: { _ref: string }; alt?: string }
  alt: string
  name?: string
  role?: string
  color: string
  /** lg = stor frittstående topp, sm = lite badge oppå et annet topp-oppsett */
  size?: 'lg' | 'sm'
}

export function ExpertPortrait({ image, alt, name, role, color, size = 'lg' }: ExpertPortraitProps) {
  const src = urlFor(image).width(440).height(440).url()
  const maxW = size === 'sm' ? 'max-w-[150px]' : 'max-w-[320px]'

  return (
    <div className={`relative aspect-square w-full ${maxW}`}>
      {/* Sirkulært foto */}
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{ boxShadow: `0 0 0 2px ${color}` }}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes="320px" />
      </div>

      {/* Buet navn (øverst) + rolle (nederst) */}
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          {/* Øvre bue: venstre → høyre over toppen (lesbar) */}
          <path id="expert-arc-top" d="M 22,150 A 128,128 0 0,0 278,150" fill="none" />
          {/* Nedre bue: venstre → høyre under bunnen (lesbar, opprett) */}
          <path id="expert-arc-bottom" d="M 22,150 A 128,128 0 0,1 278,150" fill="none" />
        </defs>
        {name && (
          <text fill={color} className="font-heading" fontSize="15" letterSpacing="2.5">
            <textPath href="#expert-arc-top" startOffset="50%" textAnchor="middle">
              {name.toUpperCase()}
            </textPath>
          </text>
        )}
        {role && (
          <text fill={color} className="font-heading" fontSize="10.5" letterSpacing="1.5">
            <textPath href="#expert-arc-bottom" startOffset="50%" textAnchor="middle">
              {role.toUpperCase()}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  )
}
