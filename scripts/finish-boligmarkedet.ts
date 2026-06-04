/**
 * Fullfører Boligmarkedet før sommeren med kombinert topp (som trykksaken):
 * stue-illustrasjonen som hovedbilde + Marthe Frantzen som lite rundt ekspert-badge.
 * Oppsett «side» (tittel/standfirst venstre, illustrasjon høyre, badge øverst).
 *
 * Flytter dagens Frantzen-hovedbilde til expertPortrait, og setter illustrasjonen
 * (lagret fra PDF) som nytt hovedbilde. Sletter også det utdaterte gronn-plattform-
 * utkastet. Idempotent. --dry tørrkjører.
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

const SLUG = 'boligmarkedet-for-sommeren'
const ILL_FILE = 'content/Rede 2 2026/Bank og megler/Boligmarkedet illustrasjon.jpeg'
const ILL_NAME = 'Boligmarkedet illustrasjon.jpeg'
const ILL_ALT = 'Illustrasjon av en stue – en bolig klar for salg'

async function main() {
  console.log(DRY ? '🔍 DRY-RUN\n' : '✍️  Fullfører Boligmarkedet (illustrasjon + Frantzen-badge)\n')

  // 1) Last opp illustrasjonen (gjenbruk hvis finnes).
  let illRef = await sanity.fetch(`*[_type=="sanity.imageAsset" && originalFilename==$f][0]._id`, { f: ILL_NAME })
  if (illRef) console.log('↩︎  Illustrasjon finnes:', illRef)
  else if (DRY) { illRef = 'DRY'; console.log('⬆️  (dry) ville lastet opp illustrasjonen') }
  else {
    const a = await sanity.assets.upload('image', readFileSync(ILL_FILE), { filename: ILL_NAME })
    illRef = a._id
    console.log('⬆️  Lastet opp illustrasjon →', illRef)
  }

  // 2) Hent dagens dok (Frantzen ligger som heroImage).
  const docs = await sanity.fetch(
    `*[_type=="article" && slug.current==$s]{ _id, "frantzenRef": heroImage.asset._ref, "frantzenAlt": heroImage.alt }`,
    { s: SLUG }
  )
  if (!docs.length) throw new Error('Fant ikke Boligmarkedet')

  const tx = sanity.transaction()
  for (const d of docs) {
    const set = {
      heroImage: { _type: 'image', asset: { _type: 'reference', _ref: illRef }, alt: ILL_ALT },
      expertPortrait: {
        _type: 'image',
        asset: { _type: 'reference', _ref: d.frantzenRef },
        alt: d.frantzenAlt || 'Eiendomsmegler Marthe Frantzen',
      },
      heroLayout: 'side',
    }
    tx.patch(d._id, (p) => p.set(set))
    console.log(`   → ${d._id}: hovedbilde=illustrasjon, badge=Frantzen (${d.frantzenRef?.slice(0, 30)}…), oppsett=side`)
  }

  // 3) Slett utdatert gronn-plattform-utkast.
  const gpDraft = await sanity.fetch(`*[_type=="article" && slug.current=="gronn-plattform" && _id in path("drafts.**")]._id`)
  for (const id of gpDraft) console.log('🗑️  Sletter utdatert utkast:', id)

  if (DRY) {
    console.log('\n(dry — ingenting skrevet)')
    return
  }

  await tx.commit()
  for (const id of gpDraft) await sanity.delete(id)
  console.log('\n✅ Boligmarkedet har kombinert topp. Norge på kreditt-utkast slettet.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
