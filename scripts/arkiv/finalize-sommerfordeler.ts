/**
 * Fullfører Sommerfordeler-sammenslåingen (godkjent av Asbjørn):
 *  1. Publiserer utkastet drafts.sommerfordeler → sommerfordeler.
 *  2. Fjerner de tre originalene (hoyt-og-lavt, hit-padel, trondheim-kino).
 *
 * Bildene gjenbrukes via asset-ref i den sammenslåtte saken; å slette
 * artikkel-DOKUMENTENE rører ikke selve bilde-assetene. --dry skriver ingenting.
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

const ORIGINALS = ['hoyt-og-lavt', 'hit-padel', 'trondheim-kino']

async function main() {
  console.log(DRY ? '🔍 DRY-RUN (skriver ingenting)\n' : '✍️  Fullfører Sommerfordeler\n')

  const draft = await sanity.getDocument('drafts.sommerfordeler')
  if (!draft) throw new Error('Fant ikke utkastet drafts.sommerfordeler – kjør create-sommerfordeler.ts først.')

  // Finn alle dok-id-er for de tre originalene (publisert + evt utkast).
  const originalIds: string[] = await sanity.fetch(
    `*[_type=="article" && slug.current in $slugs]._id`,
    { slugs: ORIGINALS }
  )

  // Sjekk om noe annet refererer til originalene (ville blokkert sletting).
  const refs: { _id: string; refTo: string }[] = await sanity.fetch(
    `*[references($ids)]{ _id, "refTo": "(refererer original)" }`,
    { ids: originalIds.filter((id) => !id.startsWith('drafts.')) }
  )

  console.log('Publiserer: sommerfordeler')
  console.log('Sletter originaler:', originalIds.join(', '))
  if (refs.length) {
    console.log('⚠️  Andre dokumenter refererer til originalene:', refs.map((r) => r._id).join(', '))
    console.log('   (sletting kan feile – håndteres ved behov)')
  }

  if (DRY) {
    console.log('\n(dry — ingenting skrevet)')
    return
  }

  // 1) Publiser: lag publisert versjon uten drafts.-prefiks/_rev, slett utkast.
  /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
  const { _id, _rev, _createdAt, _updatedAt, ...content } = draft as any
  await sanity.createOrReplace({ ...content, _id: 'sommerfordeler' })
  await sanity.delete('drafts.sommerfordeler')

  // 2) Slett originalene.
  const tx = sanity.transaction()
  for (const id of originalIds) tx.delete(id)
  await tx.commit()

  console.log('\n✅ Sommerfordeler publisert. De tre originalene er fjernet.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
