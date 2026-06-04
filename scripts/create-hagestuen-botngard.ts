/**
 * Oppretter «Hagestuen åpner for fellesskap» (Botngård Park).
 *
 * Saken manglet i Sanity fordi den hadde placeholdertekst i forrige PDF. Den
 * oppdaterte trykksaken (Rede 2 2026, s. 4–5) har ferdig, korrekturlest tekst
 * av Verena Døsvik – bygget deterministisk inn her ⇒ idempotent (createOrReplace).
 *
 * Tema: lilla · tinted (lys lilla flate) · INGEN toppbilde enda.
 * Fotoene (Verena Døsvik, telefon/amatør) finnes ikke digitalt enda. Derfor
 * lagres saken som UTKAST (drafts.*) – ikke live – så den ikke viser et tomt
 * forsidekort. Legg til bildene i Studio, sett heroLayout (bildecollage) og
 * publiser når fotoene er hentet fra Drive.
 *
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

const span = (text: string, marks: string[] = []) => ({ _type: 'span', _key: key(), text, marks })
const para = (...children: any[]): Block => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children })
const h3 = (text: string): Block => ({ _type: 'block', _key: key(), style: 'h3', markDefs: [], children: [span(text)] })

const ID = 'hagestuen-botngard-park'
const SLUG = 'hagestuen-botngard-park'
const TITLE = 'Hagestuen åpner for fellesskap'
const TEASER =
  'Da TOBB åpnet hagestuen ved Botngård Park i april, strømmet både beboere og boliginteresserte til. Det tok ikke lang tid før bordene var fulle og praten gikk livlig.'

// Samme utgave + forfatter som de øvrige Rede 2 2026-sakene (jf. medlem-nummer-80000).
const EDITION_REF = 'Y9kYytWkpKkSNwzcgTmdlC'
const AUTHOR_REF = 'author-verena-dosvik'

function buildBody(): Block[] {
  return [
    para(
      span(
        'Det er en kjølig dag i april, og det gjør det ekstra godt at hagestuen er lun og varm. Med innlagt varme kan den brukes året rundt av beboerne i Botngård Park. Ved åpningen ventet en hyggelig velkomst med kanelsnurrer og brus, og hagestuen sto ferdig møblert og klar til bruk. Interessen var stor, og det måtte raskt hentes inn flere stoler.'
      )
    ),
    para(
      span(
        '– Er det dette som er ettroms leilighet? spøker en av de som vurderer å kjøpe, til latter rundt bordet. Stemningen sitter løst, og det er lett å se for seg at hagestuen blir et naturlig samlingspunkt for sosiale sammenkomster.'
      )
    ),
    h3('Gjør klart for gode nabotreff'),
    para(
      span(
        '– Det blir finere til sommeren, det lover vi. Foran hagestuen kommer det en lekeplass, slik at dere kan følge med på barna mens dere er her, sier Helle M. Pettersen, direktør for eiendomsutvikling i TOBB.'
      )
    ),
    para(span('Hun forteller at det også legges til rette for enkel bruk av hagestuen i hverdagen.')),
    para(
      span(
        '– Vi kan hjelpe dere med en løsning for booking. Hagestuen er selvfølgelig gratis å bruke, den er jo deres. Vi håper også dere vil skape liv her, enten det er strikkekvelder, spillkvelder eller andre aktiviteter.'
      )
    ),
    para(
      span(
        'TOBB har allerede sørget for spill til innendørs bruk, og møbler som kan brukes både inne og ute, slik at hagestuen kan bli et naturlig samlingspunkt for beboerne.'
      )
    ),
    h3('Et godt sted å være'),
    para(span('Berit Leth-Olsen flyttet til Botngård Park i januar og har funnet seg godt til rette.')),
    para(
      span(
        '– Jeg flyttet hit fordi jeg trengte noe enklere. Da mannen min døde for fire år siden, ble en stor enebolig for mye alene, sier hun.'
      )
    ),
    para(
      span(
        'I leiligheten i andre etasje har hun utsikt over Bjugnfjorden. Nå bor hun i en treroms, og nylig hadde hun barnebarna på besøk.'
      )
    ),
    para(
      span(
        '– Jeg var på informasjonsmøte om prosjektet og signerte kontrakt noen måneder senere. Det som var fint, var at jeg fikk god tid til å forberede flyttingen. Jeg har samlet mye gjennom årene, så det ble en prosess å gi slipp på en del.'
      )
    ),
    para(span('Noe måtte likevel bli med videre, blant annet to gyngestoler og en kommode med affeksjonsverdi.')),
    para(
      span(
        'Berit har allerede blitt kjent med naboene og engasjert seg i styret. Hun ser også fram til å ta hagestuen i bruk.'
      )
    ),
    para(
      span(
        '– Det er mye som er fint med å bo her. Jeg har alt i nærheten og kan gå til butikken, der jeg før måtte kjøre langt. Vi er en gjeng damer som møtes på bakeriet én gang i uka, så det er veldig hyggelig å bo så sentralt.'
      )
    ),
    h3('Noe enklere'),
    para(
      span(
        'Tordis og John Helmer Harsvik er klare for en enklere hverdag. Etter mange år som bønder og senere i enebolig, lokker livet nærmere sentrum. De møter megler John Kolbjørn Baardsgaard fra Eiendomsmegler 1 for å se på mulighetene.'
      )
    ),
    para(
      span(
        '– Vi ønsker oss en leilighet med to soverom, men akkurat nå er det ingen ledige. Kanskje vi må vurdere tre soverom, sier de.'
      )
    ),
    para(
      span(
        'Stemningen er lett, og praten dreier seg etter hvert over på det sosiale miljøet i prosjektet. Helle M. Pettersen peker på hvor viktig det kan være med en sosialgruppe for beboerne, og foreslår at noen kan ta et lite initiativ til aktiviteter og samlinger. Birgit Moan blir raskt nevnt i den sammenhengen, fordi hun er «eksperten» på Facebook i følge naboer.'
      )
    ),
    para(
      span(
        'Det er allerede mye som tyder på at hagestuen vil få en viktig rolle framover. Her legges det til rette for små og store samlinger, og et lunt møtested der naboer kan treffes året rundt, uansett hva trønderværet byr på.'
      )
    ),
  ]
}

async function main() {
  console.log(DRY ? '🔍 DRY-RUN (skriver ingenting)\n' : '✍️  Oppretter Botngård-saken\n')

  const body = buildBody()
  const doc = {
    _id: `drafts.${ID}`,
    _type: 'article',
    type: 'standard',
    title: TITLE,
    slug: { _type: 'slug', current: SLUG },
    teaser: TEASER,
    estimatedReadTime: 3,
    publishedAt: '2026-04-01T00:00:00Z',
    edition: { _type: 'reference', _ref: EDITION_REF },
    author: { _type: 'reference', _ref: AUTHOR_REF },
    accentColor: 'purple',
    colorMode: 'tinted',
    heroLayout: 'none',
    body,
  }

  console.log('📄 ', TITLE, ` [${SLUG}] — UTKAST`)
  console.log('   tema:  lilla · tinted (lys lilla flate) · ingen toppbilde (foto mangler)')
  console.log('   forfatter: Verena Døsvik · utgave: Rede nr 2 2026')
  console.log('   ingress:', TEASER)
  console.log('   body:  ', body.length, 'blokker (3 mellomtitler)')

  if (DRY) {
    console.log('\n(dry — ingenting skrevet)')
    return
  }

  // Rydd bort en evt. publisert (ufullstendig) versjon, lagre som utkast.
  await sanity.transaction().delete(ID).createOrReplace(doc).commit()
  console.log('\n✅ Lagret som UTKAST (vises ikke live).')
  console.log('⚠️  Mangler foto (Verena Døsvik) – legg til i Studio, sett heroLayout og publiser når bildene er på plass.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
