/**
 * Laster opp Botngård-bildene (Drive-originaler, lastet til lokal content-speil) og
 * bygger den ferdige saken «Hagestuen åpner for fellesskap» med toppbilde +
 * seksjonsbilder med print-bildetekster, og PUBLISERER (fjerner utkastet).
 *
 * Toppbilde = Berit (oppslagets lead-foto i trykksaken, jf. bildeteksten ved
 * standfirst). Topp-oppsett «side» (tittel + portrett ved siden), som åpningen i print.
 * Idempotent: gjenbruker assets via originalFilename, deterministisk body. --dry tørrkjører.
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
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
const span = (text: string) => ({ _type: 'span', _key: key(), text, marks: [] })
const para = (text: string): Block => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [span(text)] })
const h3 = (text: string): Block => ({ _type: 'block', _key: key(), style: 'h3', markDefs: [], children: [span(text)] })

const DIR = 'content/Rede 2 2026/Botngård/Bilder_Botngård'
const ID = 'hagestuen-botngard-park'

// Bilder som brukes (matcher trykksaken). filnavn → {alt, bildetekst}
const IMAGES = {
  berit: { file: 'Berit.JPG', alt: 'Berit Leth-Olsen i Botngård Park', caption: '', credit: 'Verena Døsvik' },
  sosialt: {
    file: 'Sosialt rundt bordet.JPG',
    alt: 'Beboere samlet rundt bordet i hagestuen',
    caption: 'Mange møtte opp til åpningen av hagestuen. Praten gikk livlig rundt bordet over kanelsnurrer og brus.',
    credit: 'Verena Døsvik',
  },
  prospekt: {
    file: 'Prospekt.JPG',
    alt: 'Botngård Park under utbygging',
    caption: 'Ute bærer området fortsatt preg av byggeplass, men det vil snart endre seg.',
    credit: 'Verena Døsvik',
  },
  megler: {
    file: 'Megler og interessenter.JPG',
    alt: 'Tordis og John Helmer Harsvik i møte med megler',
    caption: 'Tordis og John Helmer Harsvik møter megler John Kolbjørn Baardsgaard for å se på mulighetene.',
    credit: 'Verena Døsvik',
  },
}

async function uploadReuse(file: string): Promise<string> {
  const existing = await sanity.fetch(`*[_type=="sanity.imageAsset" && originalFilename==$f][0]._id`, { f: file })
  if (existing) {
    console.log(`   ↩︎  ${file} finnes (${existing})`)
    return existing
  }
  if (DRY) {
    console.log(`   ⬆️  (dry) ville lastet opp ${file}`)
    return 'DRY-REF'
  }
  const asset = await sanity.assets.upload('image', readFileSync(`${DIR}/${file}`), { filename: file })
  console.log(`   ⬆️  lastet opp ${file} → ${asset._id}`)
  return asset._id
}

const imgBlock = (ref: string, meta: { alt: string; caption: string; credit: string }): Block => ({
  _type: 'image',
  _key: key(),
  asset: { _type: 'reference', _ref: ref },
  alt: meta.alt,
  ...(meta.caption ? { caption: meta.caption } : {}),
  credit: meta.credit,
})

async function main() {
  console.log(DRY ? '🔍 DRY-RUN\n' : '✍️  Botngård: bilder + publisering\n')

  console.log('Laster opp / gjenbruker bilder:')
  const beritRef = await uploadReuse(IMAGES.berit.file)
  const sosialtRef = await uploadReuse(IMAGES.sosialt.file)
  const prospektRef = await uploadReuse(IMAGES.prospekt.file)
  const meglerRef = await uploadReuse(IMAGES.megler.file)

  // Hent eksisterende dok (utkast el. publisert) for å beholde felt som tittel/teaser/forfatter.
  const base = await sanity.fetch(
    `*[_type=="article" && slug.current==$s][0]{ title, subtitle, teaser, edition, author, accentColor, colorMode, estimatedReadTime }`,
    { s: ID }
  )
  if (!base) throw new Error('Fant ikke Botngård-dokumentet')

  const body: Block[] = [
    para(
      'Det er en kjølig dag i april, og det gjør det ekstra godt at hagestuen er lun og varm. Med innlagt varme kan den brukes året rundt av beboerne i Botngård Park. Ved åpningen ventet en hyggelig velkomst med kanelsnurrer og brus, og hagestuen sto ferdig møblert og klar til bruk. Interessen var stor, og det måtte raskt hentes inn flere stoler.'
    ),
    para(
      '– Er det dette som er ettroms leilighet? spøker en av de som vurderer å kjøpe, til latter rundt bordet. Stemningen sitter løst, og det er lett å se for seg at hagestuen blir et naturlig samlingspunkt for sosiale sammenkomster.'
    ),
    imgBlock(sosialtRef, IMAGES.sosialt),
    h3('Gjør klart for gode nabotreff'),
    para(
      '– Det blir finere til sommeren, det lover vi. Foran hagestuen kommer det en lekeplass, slik at dere kan følge med på barna mens dere er her, sier Helle M. Pettersen, direktør for eiendomsutvikling i TOBB.'
    ),
    para('Hun forteller at det også legges til rette for enkel bruk av hagestuen i hverdagen.'),
    imgBlock(prospektRef, IMAGES.prospekt),
    para(
      '– Vi kan hjelpe dere med en løsning for booking. Hagestuen er selvfølgelig gratis å bruke, den er jo deres. Vi håper også dere vil skape liv her, enten det er strikkekvelder, spillkvelder eller andre aktiviteter.'
    ),
    para(
      'TOBB har allerede sørget for spill til innendørs bruk, og møbler som kan brukes både inne og ute, slik at hagestuen kan bli et naturlig samlingspunkt for beboerne.'
    ),
    h3('Et godt sted å være'),
    para('Berit Leth-Olsen flyttet til Botngård Park i januar og har funnet seg godt til rette.'),
    para(
      '– Jeg flyttet hit fordi jeg trengte noe enklere. Da mannen min døde for fire år siden, ble en stor enebolig for mye alene, sier hun.'
    ),
    para(
      'I leiligheten i andre etasje har hun utsikt over Bjugnfjorden. Nå bor hun i en treroms, og nylig hadde hun barnebarna på besøk.'
    ),
    para(
      '– Jeg var på informasjonsmøte om prosjektet og signerte kontrakt noen måneder senere. Det som var fint, var at jeg fikk god tid til å forberede flyttingen. Jeg har samlet mye gjennom årene, så det ble en prosess å gi slipp på en del.'
    ),
    para('Noe måtte likevel bli med videre, blant annet to gyngestoler og en kommode med affeksjonsverdi.'),
    para(
      'Berit har allerede blitt kjent med naboene og engasjert seg i styret. Hun ser også fram til å ta hagestuen i bruk.'
    ),
    para(
      '– Det er mye som er fint med å bo her. Jeg har alt i nærheten og kan gå til butikken, der jeg før måtte kjøre langt. Vi er en gjeng damer som møtes på bakeriet én gang i uka, så det er veldig hyggelig å bo så sentralt.'
    ),
    h3('Noe enklere'),
    para(
      'Tordis og John Helmer Harsvik er klare for en enklere hverdag. Etter mange år som bønder og senere i enebolig, lokker livet nærmere sentrum. De møter megler John Kolbjørn Baardsgaard fra Eiendomsmegler 1 for å se på mulighetene.'
    ),
    imgBlock(meglerRef, IMAGES.megler),
    para(
      '– Vi ønsker oss en leilighet med to soverom, men akkurat nå er det ingen ledige. Kanskje vi må vurdere tre soverom, sier de.'
    ),
    para(
      'Stemningen er lett, og praten dreier seg etter hvert over på det sosiale miljøet i prosjektet. Helle M. Pettersen peker på hvor viktig det kan være med en sosialgruppe for beboerne, og foreslår at noen kan ta et lite initiativ til aktiviteter og samlinger. Birgit Moan blir raskt nevnt i den sammenhengen, fordi hun er «eksperten» på Facebook i følge naboer.'
    ),
    para(
      'Det er allerede mye som tyder på at hagestuen vil få en viktig rolle framover. Her legges det til rette for små og store samlinger, og et lunt møtested der naboer kan treffes året rundt, uansett hva trønderværet byr på.'
    ),
  ]

  const doc = {
    _id: ID,
    _type: 'article',
    type: 'standard',
    title: base.title || 'Hagestuen åpner for fellesskap',
    slug: { _type: 'slug', current: ID },
    teaser: base.teaser,
    estimatedReadTime: base.estimatedReadTime || 3,
    publishedAt: '2026-04-01T00:00:00Z',
    edition: base.edition,
    author: base.author,
    accentColor: base.accentColor || 'purple',
    colorMode: base.colorMode || 'tinted',
    heroLayout: 'side',
    heroImage: { _type: 'image', asset: { _type: 'reference', _ref: beritRef }, alt: IMAGES.berit.alt, credit: IMAGES.berit.credit },
    body,
  }

  console.log(`\n📄 Botngård: toppbilde=Berit (side), ${body.filter((b) => b._type === 'image').length} seksjonsbilder, ${body.length} blokker`)
  console.log('   → PUBLISERER (fjerner utkast)')

  if (DRY) return console.log('\n(dry — ingenting skrevet)')

  await sanity.createOrReplace(doc)
  await sanity.delete(`drafts.${ID}`).catch(() => {})
  console.log('\n✅ Botngård publisert med bilder.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
