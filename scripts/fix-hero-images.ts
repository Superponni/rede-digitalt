/**
 * Retter toppbilder som ikke stemte med trykksaken (Rede 2 2026):
 *
 *  1) Ole Elias («Ta vare på medlemskapet ditt») — feil bilde lå som topp (en selfie
 *     av en annen person). Trykket bruker portrettet på løpebanen → 68be8841…jpg,
 *     rettet opp (EXIF) og lagret som scripts/assets/ole-elias-portrett.jpg.
 *  2) Curlingfeber på Hoeggen — topp lå som en vid blink av elever på vei bortover
 *     (P1014140). Trykket leder med de tre guttene rett mot kamera → P1014249.jpg.
 *  3) Kåseri («Farvel til tørt inneklima») — lå med et Unsplash-foto og heroLayout
 *     «none» (ingen topp synlig). Trykket bruker den håndtegnede strek­illustrasjonen
 *     (paraply innendørs). Hentet fra trykk-PDF → scripts/assets/kaseri-…png, og
 *     oppsett settes til «side» så den faktisk vises.
 *
 * Idempotent (gjenbruker assets via originalFilename, setter samme felt). --dry tørrkjører.
 * Patcher både publisert og evt. utkast.
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const DRY = process.argv.includes('--dry')
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

type Fix = {
  slug: string
  file: string
  filename: string
  alt: string
  credit: string
  heroLayout?: string // settes kun hvis oppgitt
}

const FIXES: Fix[] = [
  {
    slug: 'ole-elias',
    file: 'scripts/assets/ole-elias-portrett.jpg',
    filename: 'ole-elias-portrett.jpg',
    alt: 'Ole Elias Jensås på løpebanen en sommerdag',
    credit: 'Privat',
  },
  {
    slug: 'curlingfeber-pa-hoeggen',
    file: 'content/Rede 2 2026/Støtte til lag og foreninger/wetransfer_curling_2026-03-03_1245 2/P1014249.jpg',
    filename: 'P1014249.jpg',
    alt: 'Einar, Ludvik og Sondre med koster i curlinghallen',
    credit: 'Christoffer Isdahl',
  },
  {
    slug: 'farvel-til-tort-inneklima',
    file: 'scripts/assets/kaseri-taklekkasje-illustrasjon.png',
    filename: 'kaseri-taklekkasje-illustrasjon.png',
    alt: 'Strektegning: en mann sitter på en stol innendørs under en paraply mens det drypper fra taket',
    credit: 'Ai-generert',
    heroLayout: 'side',
  },
]

async function assetRef(file: string, filename: string): Promise<string> {
  const existing = await sanity.fetch(`*[_type=="sanity.imageAsset" && originalFilename==$f][0]._id`, { f: filename })
  if (existing) {
    console.log(`   ↩︎  gjenbruker asset (${filename}) → ${existing}`)
    return existing
  }
  if (DRY) {
    console.log(`   ⬆️  (dry) ville lastet opp ${filename}`)
    return 'DRY'
  }
  const a = await sanity.assets.upload('image', readFileSync(file), { filename })
  console.log(`   ⬆️  lastet opp ${filename} → ${a._id}`)
  return a._id
}

async function main() {
  console.log(DRY ? '🔍 DRY-RUN — ingenting skrives\n' : '✍️  Retter toppbilder mot trykk\n')

  for (const fix of FIXES) {
    console.log(`━━ ${fix.slug}`)
    const ref = await assetRef(fix.file, fix.filename)

    const docs = await sanity.fetch(`*[_type=="article" && slug.current==$s]{ _id }`, { s: fix.slug })
    if (!docs.length) {
      console.log('   ⚠️  fant ingen dokumenter for slug — hopper over\n')
      continue
    }

    const set: Record<string, unknown> = {
      heroImage: { _type: 'image', asset: { _type: 'reference', _ref: ref }, alt: fix.alt, credit: fix.credit },
    }
    if (fix.heroLayout) set.heroLayout = fix.heroLayout

    if (DRY) {
      console.log(`   → ville satt hero=${fix.filename}${fix.heroLayout ? `, oppsett=${fix.heroLayout}` : ''} på ${docs.length} dok\n`)
      continue
    }

    const tx = sanity.transaction()
    for (const d of docs) tx.patch(d._id, (p) => p.set(set))
    await tx.commit()
    console.log(`   ✅ hero=${fix.filename}${fix.heroLayout ? `, oppsett=${fix.heroLayout}` : ''} satt på ${docs.length} dok (${docs.map((d: { _id: string }) => d._id).join(', ')})\n`)
  }

  console.log('Ferdig.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
