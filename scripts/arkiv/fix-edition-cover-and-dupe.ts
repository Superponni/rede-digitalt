/**
 * Rydder opp i utgave-dokumentene for Rede 2 2026 og gir utgaven et coverbilde:
 *
 *  1. Laster opp forsiden (hentet fra trykk-PDF, side 1) som Sanity-asset og
 *     setter den som `coverImage` på den KANONISKE utgaven (Y9kYyt…, brukt av
 *     12 artikler). Hopper over opplasting hvis utgaven allerede har cover.
 *  2. Peker den ene artikkelen som refererer DUPLIKATET (edition-2-2026,
 *     «Norge på kreditt») over til den kanoniske utgaven.
 *  3. Sletter duplikat-dokumentet edition-2-2026 når ingen lenger refererer det.
 *
 * Idempotent: trygt å kjøre på nytt. Krever en lokal cover-PNG på COVER_PATH.
 *
 *   npx tsx scripts/fix-edition-cover-and-dupe.ts --dry   # vis hva som skjer
 *   npx tsx scripts/fix-edition-cover-and-dupe.ts         # utfør
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'node:fs'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const DRY = process.argv.includes('--dry')

const CANONICAL = 'Y9kYytWkpKkSNwzcgTmdlC' // utgaven 12 artikler bruker
const DUPLICATE = 'edition-2-2026' // near-orphan, 1 referanse
const COVER_PATH = '/tmp/rede-cover-01.png'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

async function run() {
  // ── 1. Cover ────────────────────────────────────────────────────────────
  const canonical = await sanity.fetch<{ _id: string; hasCover: boolean } | null>(
    `*[_id == $id][0]{ _id, "hasCover": defined(coverImage.asset) }`,
    { id: CANONICAL },
  )
  if (!canonical) throw new Error(`Fant ikke kanonisk utgave ${CANONICAL}`)

  if (canonical.hasCover) {
    console.log('✓ Kanonisk utgave har allerede coverImage — hopper over opplasting.')
  } else if (!existsSync(COVER_PATH)) {
    console.warn(`⚠ Mangler cover-fil på ${COVER_PATH} — hopper over cover-steget.`)
  } else if (DRY) {
    console.log(`[dry] Ville lastet opp ${COVER_PATH} og satt som coverImage på ${CANONICAL}`)
  } else {
    const asset = await sanity.assets.upload('image', readFileSync(COVER_PATH), {
      filename: 'rede-2-2026-cover.png',
    })
    await sanity
      .patch(CANONICAL)
      .set({
        coverImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: 'Forsiden til Rede nr 2 2026',
        },
      })
      .commit()
    console.log(`✓ Lastet opp cover (${asset._id}) og satt på ${CANONICAL}`)
  }

  // ── 2. Pek referanser fra duplikat → kanonisk ─────────────────────────────
  const refs = await sanity.fetch<{ _id: string }[]>(
    `*[references($dupe)]{ _id }`,
    { dupe: DUPLICATE },
  )
  for (const { _id } of refs) {
    if (DRY) {
      console.log(`[dry] Ville pekt ${_id}.edition → ${CANONICAL}`)
    } else {
      await sanity
        .patch(_id)
        .set({ edition: { _type: 'reference', _ref: CANONICAL } })
        .commit()
      console.log(`✓ Pekte ${_id}.edition → ${CANONICAL}`)
    }
  }

  // ── 3. Slett duplikatet ───────────────────────────────────────────────────
  const dupeExists = await sanity.fetch<boolean>(`defined(*[_id == $id][0]._id)`, {
    id: DUPLICATE,
  })
  if (!dupeExists) {
    console.log('✓ Duplikatet finnes ikke (allerede slettet).')
  } else if (DRY) {
    console.log(`[dry] Ville slettet duplikat-utgaven ${DUPLICATE}`)
  } else {
    await sanity.delete(DUPLICATE)
    console.log(`✓ Slettet duplikat-utgaven ${DUPLICATE}`)
  }

  console.log('\nFerdig.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
