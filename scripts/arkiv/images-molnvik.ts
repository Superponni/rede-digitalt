/**
 * Laster opp Mølnvik-portrettet (Drive-original) og setter det som det runde
 * ekspertportrettet på «Planlegg ferien i god tid», og PUBLISERER (fjerner utkast).
 * Idempotent (gjenbruk via originalFilename). --dry tørrkjører.
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

const ID = 'planlegg-ferien-i-god-tid'
const FILE = 'content/Rede 2 2026/Bank og megler/Marte Mølnvik.JPG'
const FILENAME = 'Marte Mølnvik.JPG'
const ALT = 'Regionbanksjef Marte Mølnvik, SpareBank 1 SMN'

async function main() {
  console.log(DRY ? '🔍 DRY-RUN\n' : '✍️  Mølnvik → Planlegg ferien\n')

  let ref = await sanity.fetch(`*[_type=="sanity.imageAsset" && originalFilename==$f][0]._id`, { f: FILENAME })
  if (ref) console.log('↩︎  Asset finnes:', ref)
  else if (DRY) { ref = 'DRY-REF'; console.log('⬆️  (dry) ville lastet opp', FILENAME) }
  else {
    const asset = await sanity.assets.upload('image', readFileSync(FILE), { filename: FILENAME })
    ref = asset._id
    console.log('⬆️  Lastet opp →', ref)
  }

  const base = await sanity.fetch(
    `*[_type=="article" && slug.current==$s][0]{ title, teaser, edition, author, accentColor, colorMode, heroLayout, portraitName, portraitRole, body }`,
    { s: ID }
  )
  if (!base) throw new Error('Fant ikke Planlegg ferien-dokumentet')

  const doc = {
    _id: ID,
    _type: 'article',
    type: 'standard',
    title: base.title,
    slug: { _type: 'slug', current: ID },
    teaser: base.teaser,
    estimatedReadTime: 2,
    publishedAt: '2026-04-01T00:00:00Z',
    edition: base.edition,
    author: base.author,
    accentColor: base.accentColor || 'purple',
    colorMode: base.colorMode || 'tinted',
    heroLayout: 'portrait',
    portraitName: base.portraitName || 'Marte Mølnvik',
    portraitRole: base.portraitRole || 'Regionbanksjef, SpareBank 1 SMN',
    heroImage: { _type: 'image', asset: { _type: 'reference', _ref: ref }, alt: ALT },
    body: base.body,
  }

  console.log('📄 Planlegg ferien: rundt ekspertportrett (Mølnvik) → PUBLISERER')
  if (DRY) return console.log('\n(dry — ingenting skrevet)')

  await sanity.createOrReplace(doc)
  await sanity.delete(`drafts.${ID}`).catch(() => {})
  console.log('\n✅ Planlegg ferien publisert med Mølnvik-portrett.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
