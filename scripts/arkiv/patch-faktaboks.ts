/**
 * Bytter ut de flate "faktaboks"-blokkene i to standard-artikler med ekte
 * inlineFactBox-objekter. Skriver til UTKAST (drafts.<id>) — aldri publisert —
 * så endringen kan vurderes i live-preview før publisering.
 *
 * Trygghet:
 *  - Nøkkelbasert: avbryter hvis de forventede blokkene ikke finnes (idempotent /
 *    fanger opp at innholdet har endret seg siden analysen).
 *  - --dry skriver ingenting, bare viser resultatet.
 */
import { createClient } from '@sanity/client'
import { randomBytes } from 'crypto'
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

const key = () => randomBytes(6).toString('hex')

/* eslint-disable @typescript-eslint/no-explicit-any */
type Block = Record<string, any>

const span = (text: string, marks: string[] = []) => ({
  _type: 'span',
  _key: key(),
  text,
  marks,
})

const lead = (text: string): Block => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [span(text, ['strong'])],
})

const bullet = (text: string): Block => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  listItem: 'bullet',
  level: 1,
  markDefs: [],
  children: [span(text)],
})

const factBox = (title: string, content: Block[]): Block => ({
  _type: 'inlineFactBox',
  _key: key(),
  title,
  content,
})

// --- Definisjon av hva som skal byttes ut, per artikkel ---

interface PatchSpec {
  id: string
  slug: string
  removeKeys: string[] // blokkene som erstattes (i rekkefølge)
  build: () => Block // den nye faktaboksen
}

const PATCHES: PatchSpec[] = [
  {
    id: 'Y9kYytWkpKkSNwzcgToF2Y',
    slug: 'curlingfeber-pa-hoeggen',
    removeKeys: [
      'ogn44xco', // h2 "Faktaboks"
      'ozv9wdpe', // normal (4 sammenslåtte punkter)
      'pevnstju', // h2 "Trondheim Curlingklubb"
      'wkh430cy', // h2 "Idrettslag stiftet i 1958"
      'q5yhy9um', // h2 "Ca 160 medlemmer i alle aldre"
      'zt6xcj3b', // h2 "Holder til i Leangen curlinghall"
      '97txkaav', // h2 "Tilbyr både organisert og uorganisert curling"
      '9mb6xqlt', // h2 "Hjemmeside: trondheimcurling.no"
    ],
    build: () =>
      factBox('Faktaboks', [
        lead('Curling etter skoletid'),
        bullet('Fredager kl. 15.30–17.30 (12–16 år)'),
        bullet('Gratis tilbud'),
        bullet('Gi beskjed på forhånd: 413 81 070'),
        lead('Trondheim Curlingklubb'),
        bullet('Idrettslag stiftet i 1958'),
        bullet('Ca. 160 medlemmer i alle aldre'),
        bullet('Holder til i Leangen curlinghall'),
        bullet('Tilbyr både organisert og uorganisert curling'),
        bullet('Hjemmeside: trondheimcurling.no'),
      ]),
  },
  {
    id: 'Y9kYytWkpKkSNwzcgToncY',
    slug: 'ole-elias',
    removeKeys: [
      'qkmp49x4', // h2 "Fakta: Overføring av medlemskap"
      'ehs5adq7', // h2 "Medlemskap kan overføres innen nær familie og slekt"
      'lkxkwod1', // normal "Overføring er gratis, ..."
      'a7fuc906', // normal "Ansienniteten endres ..."
    ],
    build: () =>
      factBox('Overføring av medlemskap', [
        bullet('Medlemskap kan overføres innen nær familie og slekt'),
        bullet('Overføring er gratis, men eventuell ubetalt kontingent må være betalt først'),
        bullet(
          'Ansienniteten endres til mottakerens fødselsdato dersom denne er yngre enn ansienniteten på medlemskapet'
        ),
      ]),
  },
]

function replaceBlocks(body: Block[], spec: PatchSpec): Block[] {
  const toRemove = new Set(spec.removeKeys)
  const present = body.filter((b) => toRemove.has(b._key)).map((b) => b._key)

  // Allerede patchet? Da finnes ingen av de gamle nøklene — hopp over.
  if (present.length === 0 && body.some((b) => b._type === 'inlineFactBox')) {
    console.log(`   ⏭  ${spec.slug}: allerede patchet (inlineFactBox finnes, ingen gamle blokker)`)
    return body
  }
  if (present.length !== spec.removeKeys.length) {
    throw new Error(
      `${spec.slug}: forventet ${spec.removeKeys.length} blokker å erstatte, fant ${present.length}. Avbryter for sikkerhets skyld.`
    )
  }

  const firstIdx = body.findIndex((b) => b._key === spec.removeKeys[0])
  const out: Block[] = []
  body.forEach((b, i) => {
    if (i === firstIdx) out.push(spec.build())
    if (!toRemove.has(b._key)) out.push(b)
  })
  return out
}

async function main() {
  console.log(DRY ? '🔍 DRY-RUN (skriver ingenting)\n' : '✍️  Skriver utkast\n')

  for (const spec of PATCHES) {
    const draftId = `drafts.${spec.id}`
    const draft = await sanity.getDocument(draftId)
    const published = await sanity.getDocument(spec.id)
    const base = draft || published
    if (!base) throw new Error(`Fant ikke dokument ${spec.id}`)

    const newBody = replaceBlocks((base.body || []) as Block[], spec)

    if (newBody === base.body) continue // uendret (allerede patchet)

    console.log(`📄 ${spec.slug} (${draftId})`)
    const fb = newBody.find((b) => b._type === 'inlineFactBox') as Block
    console.log(`   Faktaboks: «${fb.title}» med ${fb.content.length} innholdsblokker`)

    if (!DRY) {
      await sanity.createOrReplace({ ...base, _id: draftId, body: newBody })
      console.log('   ✓ Utkast lagret\n')
    } else {
      console.log('   (dry — ikke lagret)\n')
    }
  }

  console.log('✅ Ferdig. Vurder endringene i live-preview før publisering.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
