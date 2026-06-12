/**
 * Migrerer de gamle enkeltfeltene (expertPortrait + portraitName + portraitRole)
 * inn i den nye `experts`-lista som experts[0], og fjerner de gamle feltene.
 *
 * Idempotent: tar kun dokumenter som har et gammelt expertPortrait OG ennå ikke
 * har en experts-liste. Kjør på nytt uten skade.
 *
 *   npx tsx scripts/migrate-experts-array.ts --dry   # vis hva som skjer
 *   npx tsx scripts/migrate-experts-array.ts         # utfør
 */
import { createClient } from '@sanity/client'
import { randomUUID } from 'crypto'
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
  expertPortrait?: Record<string, unknown>
  portraitName?: string
  portraitRole?: string
}

async function run() {
  const docs = await sanity.fetch<Doc[]>(
    `*[_type in ["article","editorial"] && defined(expertPortrait.asset) && !defined(experts)]{
      _id, title, expertPortrait, portraitName, portraitRole
    }`,
  )

  if (docs.length === 0) {
    console.log('Ingenting å migrere – alle saker bruker allerede experts-lista.')
    return
  }

  for (const doc of docs) {
    const expert: Record<string, unknown> = {
      _type: 'expertSource',
      _key: randomUUID().replace(/-/g, '').slice(0, 12),
      portrait: { ...doc.expertPortrait, _type: 'image' },
    }
    if (doc.portraitName) expert.name = doc.portraitName
    if (doc.portraitRole) expert.role = doc.portraitRole

    console.log(`${DRY ? '[tørr]' : '→'} ${doc.title} (${doc._id})`)
    console.log(`    ${doc.portraitName || '(uten navn)'} / ${doc.portraitRole || '—'} → experts[0]`)

    if (!DRY) {
      await sanity
        .patch(doc._id)
        .set({ experts: [expert] })
        .unset(['expertPortrait', 'portraitName', 'portraitRole'])
        .commit()
    }
  }

  console.log(`\n${DRY ? 'Tørrkjøring' : 'Ferdig'}: ${docs.length} sak(er).`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
