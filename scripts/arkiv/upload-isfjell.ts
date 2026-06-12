/**
 * Laster opp isfjell-illustrasjonen til Sanity og setter den som hovedbilde på
 * pilot-saken «Skal du kjøpe bolig?» med topp-oppsett «tittel og bilde ved siden».
 * Idempotent: hopper over opplasting hvis en asset med samme originalFilename finnes.
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
})

const SLUG = 'trygghet-boligselskap'
const FILE =
  '/Users/asbjorngronli/Library/CloudStorage/GoogleDrive-asbjorn@superponni.no/Delte disker/Superponni/02 Prosjekter/TOBB/REDE/Rede 2026/Rede 2 2026/Trygghet rundt boligselskapsmodellen/freepik_2832015314.png'
const FILENAME = 'isfjell-bokostnader.png'
const ALT = 'Illustrasjon av et isfjell der det meste skjuler seg under vannflaten'
const CREDIT = 'Illustrasjon: Freepik'

async function main() {
  // Gjenbruk eksisterende asset hvis den alt er lastet opp.
  let asset = await sanity.fetch(
    `*[_type=="sanity.imageAsset" && originalFilename==$f][0]{_id}`,
    { f: FILENAME }
  )
  if (asset?._id) {
    console.log('↩︎  Asset finnes allerede:', asset._id)
  } else {
    console.log('⬆️  Laster opp', FILENAME, '...')
    asset = await sanity.assets.upload('image', readFileSync(FILE), {
      filename: FILENAME,
    })
    console.log('✅ Lastet opp:', asset._id)
  }

  const heroImage = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: ALT,
    credit: CREDIT,
  }

  const docs = await sanity.fetch(`*[_type=="article" && slug.current==$s]{_id}`, { s: SLUG })
  const tx = sanity.transaction()
  for (const d of docs) {
    tx.patch(d._id, (p) => p.set({ heroImage, heroLayout: 'side' }))
    console.log('   →', d._id, '(heroImage + heroLayout=side)')
  }
  await tx.commit()
  console.log('\n✅ Ferdig. Isfjellet er hovedbilde, oppsett = tittel og bilde ved siden.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
