/**
 * Re-laster familie-originalen (3907px) som hovedbilde på «Medlem nr. 80 000»,
 * fordi den eksisterende Sanity-kopien var nedskalert til 2400px (kornete på
 * store skjermer). Bytter KUN asset-referansen — beholder fokuspunkt, beskjæring,
 * alt-tekst og fotograf. Dekker både publisert versjon og utkast.
 * Idempotent: laster ikke opp på nytt hvis originalen alt finnes som asset.
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
  perspective: 'raw', // få med både publisert og utkast
})

const SLUG = 'medlem-nummer-80000'
const FILE =
  'content/Rede 2 2026/Medlem_forskjøpsrett/Bilder medlem 80k/Familien til medlem nr 80k.JPG'
const FILENAME = 'familien-medlem-80000-original.jpg'

async function main() {
  // 1) Gjenbruk asset hvis originalen alt er lastet opp.
  let asset = await sanity.fetch(
    `*[_type=="sanity.imageAsset" && originalFilename==$f][0]{_id, metadata{dimensions}}`,
    { f: FILENAME },
  )
  if (asset?._id) {
    console.log('↩︎  Asset finnes alt:', asset._id, asset.metadata?.dimensions)
  } else {
    console.log('⬆️  Laster opp original ...')
    asset = await sanity.assets.upload('image', readFileSync(FILE), { filename: FILENAME })
    console.log('✅ Lastet opp:', asset._id, `${asset.metadata?.dimensions?.width}×${asset.metadata?.dimensions?.height}`)
  }

  // 2) Hent alle versjoner (publisert + utkast) av saken.
  const docs: { _id: string; heroImage?: Record<string, unknown> }[] = await sanity.fetch(
    `*[_type=="article" && slug.current==$s]{_id, heroImage}`,
    { s: SLUG },
  )
  if (docs.length === 0) {
    throw new Error(`Fant ingen artikkel med slug "${SLUG}"`)
  }

  const tx = sanity.transaction()
  for (const d of docs) {
    if (!d.heroImage) {
      console.log('   ⚠︎ ', d._id, '— mangler heroImage, hopper over')
      continue
    }
    // Behold ALT (fokuspunkt/crop/alt/credit), bytt bare asset-referansen.
    const newHero = {
      ...d.heroImage,
      asset: { _type: 'reference', _ref: asset._id },
    }
    tx.patch(d._id, (p) => p.set({ heroImage: newHero }))
    console.log('   →', d._id, '(asset byttet, fokuspunkt/beskjæring beholdt)')
  }
  await tx.commit()
  console.log('\n✅ Ferdig. Toppbildet er nå i full oppløsning.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
