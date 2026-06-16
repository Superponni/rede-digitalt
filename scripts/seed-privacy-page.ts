/**
 * Seeder personvern-singletonen i Sanity med standardteksten fra
 * src/lib/privacy-default.ts. Etter dette kan redaktøren finpusse ordlyden
 * direkte i Studio (Innhold → Personvern).
 *
 * Trygt som standard: bruker createIfNotExists, så en re-kjøring ALDRI
 * overskriver redaktørens endringer. Vil du tvinge tilbake standardteksten:
 *
 *   npx tsx scripts/seed-privacy-page.ts            # oppretter hvis den mangler
 *   npx tsx scripts/seed-privacy-page.ts --force    # overskriver med standard
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@sanity/client'
import {
  PRIVACY_TITLE,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  type PrivacySection,
} from '../src/lib/privacy-default'

const DOC_ID = 'privacyPage'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

// Deterministiske nøkler så en --force-kjøring gir identisk dokument (ingen
// støy i diff/historikk).
let counter = 0
const key = () => `seed${(counter++).toString(36)}`

function textBlock(text: string, style: 'normal' | 'h2', listItem?: 'bullet') {
  return {
    _type: 'block',
    _key: key(),
    style,
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

function buildBody(sections: PrivacySection[]) {
  const blocks: ReturnType<typeof textBlock>[] = []
  for (const section of sections) {
    blocks.push(textBlock(section.heading, 'h2'))
    for (const p of section.paragraphs ?? []) blocks.push(textBlock(p, 'normal'))
    for (const b of section.bullets ?? []) blocks.push(textBlock(b, 'normal', 'bullet'))
  }
  return blocks
}

async function main() {
  const force = process.argv.includes('--force')

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Mangler SANITY_API_WRITE_TOKEN i .env.local')
    process.exit(1)
  }

  const doc = {
    _id: DOC_ID,
    _type: 'privacyPage',
    title: PRIVACY_TITLE,
    intro: PRIVACY_INTRO,
    body: buildBody(PRIVACY_SECTIONS),
  }

  if (force) {
    await client.createOrReplace(doc)
    console.log('✓ Personvern-dokumentet overskrevet med standardtekst (--force).')
  } else {
    const result = await client.createIfNotExists(doc)
    // createIfNotExists returnerer eksisterende dokument uendret hvis det fantes.
    const created = result._createdAt === result._updatedAt
    console.log(
      created
        ? '✓ Personvern-dokumentet opprettet med standardtekst.'
        : 'ℹ Personvern-dokumentet finnes allerede — rørte ikke redaktørens tekst. Bruk --force for å tilbakestille.',
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
