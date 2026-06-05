/**
 * Flytter ekspert-/kildefoto fra `heroImage` (hovedbilde) til `expertPortrait`
 * (ekspertbilde) på saker med topp-oppsett «Rundt ekspertportrett» der fotoet
 * ved en feil ble lastet opp som hovedbilde.
 *
 * Idempotent: tar kun saker som har heroLayout=='portrait', et heroImage, og
 * IKKE allerede et expertPortrait. Kjør på nytt uten skade.
 *
 *   npx tsx scripts/move-expert-to-portrait.ts --dry   # vis hva som skjer
 *   npx tsx scripts/move-expert-to-portrait.ts         # utfør
 */
import { createClient } from '@sanity/client'
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

type Doc = {
  _id: string
  title: string
  heroImage?: { asset?: { _ref: string }; hotspot?: unknown; crop?: unknown; alt?: string }
}

async function run() {
  // Inkluderer både publiserte dokumenter og utkast (drafts.*).
  const docs = await sanity.fetch<Doc[]>(
    `*[_type == "article" && heroLayout == "portrait" && defined(heroImage.asset) && !defined(expertPortrait.asset)]{
      _id, title, heroImage
    }`,
  )

  if (docs.length === 0) {
    console.log('Ingenting å flytte – alle portrett-saker har allerede ekspertbildet på rett felt.')
    return
  }

  for (const doc of docs) {
    const h = doc.heroImage!
    const expertPortrait: Record<string, unknown> = {
      _type: 'image',
      asset: { _type: 'reference', _ref: h.asset!._ref },
    }
    if (h.hotspot) expertPortrait.hotspot = h.hotspot
    if (h.crop) expertPortrait.crop = h.crop
    if (h.alt) expertPortrait.alt = h.alt

    console.log(`${DRY ? '[tørr]' : '→'} ${doc.title} (${doc._id})`)
    console.log(`    hovedbilde ${h.asset!._ref} → ekspertbilde, tømmer hovedbilde`)

    if (!DRY) {
      await sanity
        .patch(doc._id)
        .set({ expertPortrait })
        .unset(['heroImage'])
        .commit()
    }
  }

  console.log(`\n${DRY ? 'Tørrkjøring' : 'Ferdig'}: ${docs.length} sak(er).`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
