/**
 * Slår sammen Høyt & Lavt + Hit Padel + Trondheim Kino til ÉN «Sommerfordeler»-
 * artikkel, slik trykksaken presenterer dem (Rede 2 2026, s. 23–25): én paraply-
 * tittel + standfirst, tre underseksjoner med hver sin medlemsfordel.
 *
 * Teksten i de tre eksisterende sakene er allerede print-tro – gjenbrukes her,
 * og bildene gjenbrukes via asset-ref (ingen ny opplasting).
 *
 * Lagres som UTKAST (drafts.sommerfordeler). De tre originalene RØRES IKKE –
 * de forblir live til Asbjørn har vurdert utkastet og bestemt om de skal
 * erstattes (avpubliseres/omdirigeres) eller beholdes.
 *
 * Farge: teal er valgt som LESBAR standard (gull fra «sommer» gir for dårlig
 * kontrast som tittelfarge på lys flate). Asbjørn velger endelig signaturfarge.
 *
 * Idempotent (createOrReplace på fast utkast-id). --dry skriver ingenting.
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
const h2 = (text: string): Block => ({ _type: 'block', _key: key(), style: 'h2', markDefs: [], children: [span(text)] })

const img = (ref: string, alt: string, credit: string): Block => ({
  _type: 'image',
  _key: key(),
  asset: { _type: 'reference', _ref: ref },
  alt,
  credit,
})

const factBox = (title: string, text: string): Block => ({
  _type: 'inlineFactBox',
  _key: key(),
  title,
  content: [para(span(text))],
})

// Eksisterende asset-refs (gjenbrukes – ingen opplasting).
const HERO_HOYT = 'image-b176ef681689d0931258276b9f39b92d9c6e03d9-3771x5186-jpg'
const HERO_PADEL = 'image-a93184a300d62a9b09ba65c3a18bbbab641db1f5-3840x2560-jpg'
const HERO_KINO = 'image-1630424f598240fdba89dcf886d2fbb32405ac71-7522x4320-jpg'

const ID = 'sommerfordeler'
const TITLE = 'Sommerfordeler'
const TEASER =
  'Fra chill til full aktivitet. Med medlemsfordeler er det lett å fylle sommeren med gode øyeblikk.'

const EDITION_REF = 'Y9kYytWkpKkSNwzcgTmdlC'
const AUTHOR_REF = 'author-verena-dosvik'

function buildBody(): Block[] {
  return [
    // ── Høyt & Lavt ────────────────────────────────────────────────
    h2('Høyt & Lavt for hele familien'),
    img(HERO_HOYT, 'Klatring i Høyt & Lavt klatrepark på Rotvoll', 'Truls Lucas Melbye'),
    para(
      span(
        'Tror du klatreparken bare er for barn? Tar du turen til skogen på Rotvoll, oppdager du raskt at tilbudet favner langt bredere. Her finnes det løyper for hele familien, også for dem som søker litt mer spenning.'
      )
    ),
    para(
      span(
        'De høyeste og mest krevende løypene gir et skikkelig sug i magen, og mestringsfølelsen når du kommer deg gjennom, er vanskelig å slå. Og zipline? Det er like gøy, hver gang.'
      )
    ),
    para(
      span(
        'Her legger du nivået selv. Mange foreldre og besteforeldre som blir med barna, ender opp med å prøve seg selv og finner ut at klatring er for alle.'
      )
    ),
    para(
      span(
        'Selv i ekte trøndervær er dette en opplevelse. Den tette skogen på Rotvoll skjermer godt, og gjør klatreparken til et trygt valg også når været ikke spiller helt på lag. At den ligger så nært bysentrum, gjør terskelen lav for å ta turen, enten det er en ettermiddag med familien eller en spontan utflukt.'
      )
    ),
    factBox(
      'Ekstra bra for TOBB-medlemmer',
      'Som TOBB-medlem får du 15 % rabatt på Høyt & Lavt Klatrepark.'
    ),

    // ── Hit Padel ──────────────────────────────────────────────────
    h2('Bli hekta på sommerens råeste sport!'),
    img(HERO_PADEL, 'Padelspill på Hit Padel', 'Oliver Berre, Berre Media'),
    para(
      span(
        'VM-feberen nærmer seg, og kanskje frister det å gjøre som Cristiano Ronaldo? Når han ikke dominerer på fotballbanen, spiller han nemlig padel. Faktisk har han vært med på å bygge opp flere padelsentre i Portugal. Ikke tilfeldig, for dette er sporten «alle» snakker om nå.'
      )
    ),
    para(
      span(
        'Padel er en av verdens raskest voksende idretter, og bølgen har for alvor truffet Norge. Spesielt ungdom og unge voksne har fått øynene opp for den fartsfylte, sosiale og vanedannende aktiviteten. Her spiller du som regel to mot to, i en dynamisk miks av tennis og squash, der veggene er en del av spillet.'
      )
    ),
    para(
      span(
        'Enten du er nybegynner eller har litt konkurranseinstinkt på lur, er padel lavterskel, inkluderende og skikkelig gøy fra første slag.'
      )
    ),
    factBox(
      'Ekstra bra for TOBB-medlemmer',
      'I mai, juni og juli får du hele 30 % rabatt på Hit Padel. En perfekt anledning til å teste noe nytt med venner, familie eller kollegaer.'
    ),

    // ── Trondheim Kino ─────────────────────────────────────────────
    h2('Kinosommer er ekstra gøy for TOBB-medlemmer!'),
    img(HERO_KINO, 'Kinosal hos Trondheim Kino', 'Trondheim Kino / Terje Trobe'),
    para(
      span(
        'Sommeren på kino i Trondheim, Stjørdal og Steinkjer er fylt med små og store øyeblikk som gjør hverdagen magisk. Her finnes noe for alle, fra klassikere og favoritter som Toy Story, Minions, Spider-Man, Star Wars og Supergirl, til mange andre spennende filmer.'
      )
    ),
    para(
      span(
        'Perfekt for en kinodate, aktivitet med barna, sosial kveld med venner, eller bare et lite pusterom med storskjerm og popcorn i hånda. Opplev kinomagi i komfortable saler med fantastisk lyd og bilde, og ta turen innom kiosken med hyller fulle av snacks og fristelser. Film på kino kan nytes uansett vær – og det er alltid bedre sammen!'
      )
    ),
    factBox(
      'TOBB-rabatt',
      'Kr 25 i rabatt per billett hele året + halv pris på popcornmeny i sommerferien (23. juni – 18. august).'
    ),
  ]
}

async function main() {
  console.log(DRY ? '🔍 DRY-RUN (skriver ingenting)\n' : '✍️  Bygger Sommerfordeler-utkast\n')

  const body = buildBody()
  const doc = {
    _id: `drafts.${ID}`,
    _type: 'article',
    type: 'standard',
    title: TITLE,
    slug: { _type: 'slug', current: ID },
    teaser: TEASER,
    estimatedReadTime: 4,
    publishedAt: '2026-04-01T00:00:00Z',
    edition: { _type: 'reference', _ref: EDITION_REF },
    author: { _type: 'reference', _ref: AUTHOR_REF },
    accentColor: 'teal',
    colorMode: 'tinted',
    heroLayout: 'none',
    body,
  }

  console.log('📄 ', TITLE, ` [${ID}] — UTKAST`)
  console.log('   tema:  teal · tinted · ingen enkelt-toppbilde (seksjonsbilder i body)')
  console.log('   3 seksjoner: Høyt & Lavt · Hit Padel · Trondheim Kino (hver m/ bilde + rabattboks)')
  console.log('   body-blokker:', body.length)
  console.log('   ⚠️  Originalene (hoyt-og-lavt, hit-padel, trondheim-kino) er IKKE rørt.')

  if (DRY) {
    console.log('\n(dry — ingenting skrevet)')
    return
  }

  await sanity.createOrReplace(doc)
  console.log('\n✅ Lagret som UTKAST. Vurder i Studio/preview før vi evt. erstatter de tre originalene.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
