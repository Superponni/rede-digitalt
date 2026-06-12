/**
 * Engangs-rydding av «Grønn Plattform» → én artikkel «Norge på kreditt».
 *
 * Utgangspunkt (kartlagt 2026-06-02):
 *  - GAMMEL publisert doc (Y9kYytWkpKkSNwzcgToNxq): utdatert tekst, ingen faktaboks.
 *  - NY utkast-doc (drafts.article-gronn-plattform): fersk tekst = dagens Drive,
 *    men feil tittel, feil toppbilde og faktaboks som løse avsnitt.
 *
 * Dette scriptet:
 *  1. Tar den nye (ferske) som fasit.
 *  2. Setter tittel «Norge på kreditt».
 *  3. Gjør de løse faktaboks-blokkene om til en ekte inlineFactBox.
 *  4. Setter toppbilde = SINTEF-fotoet (arbeidere med hjelm), som alt ligger i Sanity.
 *  5. Publiserer den og sletter både utkastet og den gamle doc-en → fra 2 til 1.
 *
 * Nøkkelbasert og idempotent: avbryter hvis de forventede faktaboks-blokkene
 * ikke finnes (fanger opp at innholdet er endret siden kartleggingen).
 * --dry skriver ingenting.
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

const para = (...children: any[]): Block => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children,
})

// --- ID-er ---
const OLD_ID = 'Y9kYytWkpKkSNwzcgToNxq' // gammel publisert (slettes)
const DRAFT_ID = 'drafts.article-gronn-plattform' // fersk kilde
const PUB_ID = 'article-gronn-plattform' // publisert resultat

// SINTEF-foto av arbeidere med hjelm — ligger allerede som asset i Sanity
const HERO_ASSET = 'image-0f2b493a4d90d981f167af26b83d6c2660557a02-3543x5315-jpg'

// Faktaboks-blokkene i utkastet som skal erstattes (i rekkefølge)
const FAKTABOKS_KEYS = [
  'c1orw839', // h2 "Faktaboks"
  '9cipwpjm', // normal "Grønn plattform er en norsk statlig satsing ..."
  'mfvqoegj', // h2 "Vendom:"
  'ja76mahq', // normal "Verdikjeder for næringsdrevet ombruk av byggevarer."
]

function buildBody(body: Block[]): Block[] {
  const toRemove = new Set(FAKTABOKS_KEYS)
  const present = body.filter((b) => toRemove.has(b._key)).map((b) => b._key)

  // Allerede patchet?
  if (present.length === 0 && body.some((b) => b._type === 'inlineFactBox')) {
    console.log('   ⏭  faktaboks allerede konvertert — beholder body som den er')
    return body
  }
  if (present.length !== FAKTABOKS_KEYS.length) {
    throw new Error(
      `Forventet ${FAKTABOKS_KEYS.length} faktaboks-blokker, fant ${present.length}. Avbryter.`
    )
  }

  const factBox: Block = {
    _type: 'inlineFactBox',
    _key: key(),
    title: 'Faktaboks',
    content: [
      para(
        span(
          'Grønn plattform er en norsk statlig satsing som gir bedrifter og forskningsinstitutter økonomisk støtte til forsknings- og innovasjonsdrevet grønn omstilling i næringslivet.'
        )
      ),
      para(
        span('Vendom: ', ['strong']),
        span('Verdikjeder for næringsdrevet ombruk av byggevarer.')
      ),
    ],
  }

  const firstIdx = body.findIndex((b) => b._key === FAKTABOKS_KEYS[0])
  const out: Block[] = []
  body.forEach((b, i) => {
    if (i === firstIdx) out.push(factBox)
    if (!toRemove.has(b._key)) out.push(b)
  })
  return out
}

async function main() {
  console.log(DRY ? '🔍 DRY-RUN (skriver ingenting)\n' : '✍️  Utfører rydding\n')

  const draft = await sanity.getDocument(DRAFT_ID)
  if (!draft) throw new Error(`Fant ikke ${DRAFT_ID}`)

  const newBody = buildBody((draft.body || []) as Block[])

  // Bygg det publiserte dokumentet fra utkastet, med rettelser
  const { _rev, _createdAt, _updatedAt, ...base } = draft as any
  const published: Block = {
    ...base,
    _id: PUB_ID,
    title: 'Norge på kreditt',
    heroImage: {
      _type: 'image',
      _key: undefined,
      asset: { _type: 'reference', _ref: HERO_ASSET },
      alt: 'Arbeidere med hjelm på byggeplass',
      credit: 'Anne Line Bakken / SINTEF',
    },
    body: newBody,
  }
  delete (published.heroImage as any)._key

  // Oppsummering
  console.log('📄 Resultat-artikkel:', PUB_ID)
  console.log('   tittel:', published.title)
  console.log('   slug:  ', published.slug?.current)
  console.log('   hero:  ', HERO_ASSET, '(SINTEF, arbeidere med hjelm)')
  const fb = newBody.find((b) => b._type === 'inlineFactBox') as Block
  console.log(
    `   faktaboks: «${fb.title}» med ${fb.content.length} innholdsblokker`
  )
  console.log('   body-blokker:', newBody.length)
  console.log('\n🗑  Slettes:')
  console.log('   -', OLD_ID, '(gammel publisert, utdatert tekst)')
  console.log('   -', DRAFT_ID, '(utkast — erstattes av publisert versjon)')

  if (DRY) {
    console.log('\n(dry — ingenting skrevet)')
    return
  }

  await sanity
    .transaction()
    .createOrReplace(published)
    .delete(DRAFT_ID)
    .delete(OLD_ID)
    .commit()

  console.log('\n✅ Ferdig. Én artikkel «Norge på kreditt» er publisert; de to gamle er borte.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
