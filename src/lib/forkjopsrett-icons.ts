// Ikon-register for forkjøpsrett-saken (slugs fra /public/forkjopsrett/icons,
// normalisert av scripts/normalize-svg-icons.py → icons.json).
// Delt kilde for både Sanity-skjema (ikon-dropdown) og IllustratedScene-komponenten.

export interface ForkjopsrettIcon {
  /** filnavn-slug i /public/forkjopsrett/icons */
  slug: string
  /** norsk visningsnavn */
  title: string
}

export const FORKJOPSRETT_ICONS: ForkjopsrettIcon[] = [
  { slug: 'bankkort', title: 'Bankkort' },
  { slug: 'bil', title: 'Bil' },
  { slug: 'bomiljo', title: 'Bomiljø' },
  { slug: 'check', title: 'Check' },
  { slug: 'error', title: 'Error' },
  { slug: 'fotball', title: 'Fotball' },
  { slug: 'forstemann', title: 'Førstemann' },
  { slug: 'handlepose', title: 'Handlepose' },
  { slug: 'kalender', title: 'Kalender' },
  { slug: 'kurv', title: 'Kurv' },
  { slug: 'liste', title: 'Liste' },
  { slug: 'lyspaere', title: 'Lyspære' },
  { slug: 'mappe', title: 'Mappe' },
  { slug: 'mote', title: 'Møte' },
  { slug: 'nr-1', title: 'Nr. 1' },
  { slug: 'nokkel', title: 'Nøkkel' },
  { slug: 'pc', title: 'PC' },
  { slug: 'penger', title: 'Penger' },
  { slug: 'pizza', title: 'Pizza' },
  { slug: 'plusstegn', title: 'Plusstegn' },
  { slug: 'profil', title: 'Profil' },
  { slug: 'rammer', title: 'Rammer' },
  { slug: 'salg', title: 'Salg' },
  { slug: 'signere', title: 'Signere' },
  { slug: 'sparebank', title: 'Sparebank' },
  { slug: 'sparegris', title: 'Sparegris' },
  { slug: 'strom', title: 'Strøm' },
  { slug: 'telefon', title: 'Telefon' },
  { slug: 'telefon-2', title: 'Telefon 2' },
  { slug: 'til-salgs', title: 'Til salgs' },
  { slug: 'verktoy', title: 'Verktøy' },
  { slug: 'verktoykasse', title: 'Verktøykasse' },
  { slug: 'verktoykasse-2', title: 'Verktøykasse 2' },
]

export const ICON_OPTIONS = FORKJOPSRETT_ICONS.map((i) => ({ title: i.title, value: i.slug }))

export const ICON_BASE = '/forkjopsrett/icons'

export function iconSrc(slug?: string): string | undefined {
  return slug ? `${ICON_BASE}/${slug}.svg` : undefined
}
