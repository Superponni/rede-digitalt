/**
 * Engangsskript: oppretter «Om-side»-dokumentet med fast ID slik at /om får et
 * hovedokument i Presentation. Idempotent (createIfNotExists) — kjører du det
 * på nytt, rører det ikke et eksisterende dokument du har redigert.
 *
 *   npx tsx scripts/create-about-page.ts
 */
import dotenv from 'dotenv'
import { createClient } from '@sanity/client'

dotenv.config({ path: '.env.local' })

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

async function main() {
  const doc = {
    _id: 'aboutPage',
    _type: 'aboutPage',
    label: 'Om Rede',
    title: 'Et magasin om bolig, nabolag og folk i Trøndelag.',
    intro:
      'Rede er TOBBs medlemsmagasin. I 80 år har TOBB bygget hjem og nabolag i Trøndelag — Rede forteller historiene som bor der. Nå tar vi magasinet fra papir til skjerm.',
    featureLabel: 'Fra papir til skjerm',
    featureHeading: 'Ikke en PDF — en opplevelse.',
    featureBody:
      'Her kan du scrolle deg gjennom reportasjer som beveger seg, høre stemmene bak historiene og se video — ikke bare lese. Rede er bygget for skjermen, fra første bokstav til siste bilde.',
    topicsLabel: 'Hva du finner',
    publisherLine: 'Rede gis ut av TOBB',
    editionsHeading: 'Utgaver',
  }

  const result = await sanity.createIfNotExists(doc)
  console.log(`OK: ${result._id} (${result._rev ? 'finnes' : 'opprettet'})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
