/**
 * Splitter «bank-og-megler» i to print-tro, frittstående saker (Rede 2 2026):
 *
 *  1. «Boligmarkedet før sommeren» (megler Marthe Frantzen, EiendomsMegler 1
 *     Heimdal, s.30-31). Gjenbruker det EKSISTERENDE dokumentet – fordi
 *     toppbildet faktisk ER Frantzen (filnavn Marthe_..._Frantzen_..._EM1).
 *     Bytter tittel/slug/body, beholder bilde/forfatter/utgave. Rundt
 *     ekspertportrett. PUBLISERT (har foto).
 *
 *  2. «Planlegg ferien i god tid» (banksjef Marte Mølnvik, SpareBank 1 SMN,
 *     s.32). Mølnvik-teksten lå feilaktig i bank-og-megler. Opprettes som NY
 *     sak. Mangler Mølnvik-foto ⇒ lagres som UTKAST til bildet er på plass.
 *
 * Begge: lilla · tinted · rundt ekspertportrett. Idempotent. --dry skriver ingenting.
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
const quote = (text: string): Block => ({ _type: 'block', _key: key(), style: 'blockquote', markDefs: [], children: [span(text)] })

const EDITION_REF = 'Y9kYytWkpKkSNwzcgTmdlC'
const AUTHOR_REF = 'author-verena-dosvik'

// ── 1. Boligmarkedet før sommeren (megler Frantzen) ───────────────────
const BOLIG_SLUG = 'boligmarkedet-for-sommeren'
const BOLIG_TITLE = 'Boligmarkedet før sommeren'
const BOLIG_TEASER =
  'Hvordan er boligmarkedet på sørsiden av Trondheim rett før sommeren? Bør du selge nå eller vente til høsten?'

function boligBody(): Block[] {
  return [
    para(
      span(
        '– Vi ser fortsatt god etterspørsel i markedet, men kjøperne er mer bevisste og prisfølsomme enn tidligere, sier eiendomsmegler Marthe Frantzen ved EiendomsMegler 1 Heimdal.'
      )
    ),
    para(
      span(
        'Hun opplever at boliger nå ligger lengre ute for salg enn før, samtidig som det er tydelige forskjeller mellom ulike boligtyper.'
      )
    ),
    h3('Rush før skolestart'),
    para(
      span(
        'Etterspørselen etter familieboliger øker inn mot sommeren. I fjor ble det solgt rekordmange boliger på sørsiden av Trondheim, noe som viser at området fortsatt er svært populært.'
      )
    ),
    para(
      span(
        '– Barnefamilier ønsker gjerne å flytte og komme på plass før skolestart. Det ser vi tydelig på sørsiden av Trondheim, sier Frantzen. Hun mener dette gjør det gunstig å legge ut familieboliger for salg før sommeren.'
      )
    ),
    para(
      span(
        '– Det kommer mange nye boliger på markedet etter påske hvert år, og dette er et mønster vi har sett over lang tid.'
      )
    ),
    h3('Nærhet til skole og barnehage'),
    para(
      span(
        'Pris og beliggenhet er fortsatt avgjørende for kjøperne. – De som kommer på visning er som regel godt forberedt, med finansiering på plass og en tydelig grense for hvor langt de kan strekke seg, sier Frantzen.'
      )
    ),
    para(
      span(
        'Hun forteller at prisene på boliger i sør har vært relativt stabile, og at etterspørselen etter leiligheter er mindre sesongbasert enn familieboliger.'
      )
    ),
    para(
      span(
        '– På sørsiden skiller leilighetsmarkedet seg noe ut, med gjennomgående større enheter. Dette gjør at også barnefamilier kjøper leilighet her, siden det finnes boliger med flere soverom til en overkommelig pris. Nærhet til skole og barnehage er viktig for mange.'
      )
    ),
    h3('Bør du selge nå – eller vente?'),
    para(
      span(
        'Ifølge Frantzen finnes det ikke ett riktig svar for alle, men boligtype og behov spiller en viktig rolle. – Familieboliger treffer ofte godt i markedet før sommeren, nettopp fordi mange ønsker å være på plass til skolestart. Samtidig kan høsten være et godt tidspunkt for andre typer boliger, sier hun.'
      )
    ),
    para(span('Hun anbefaler at selgere vurderer både egen situasjon og markedet før de bestemmer seg.')),
    h3('Forbered boligen for salg'),
    para(
      span(
        'Bilder er ofte det første potensielle kjøpere legger merke til. – Førsteinntrykket har mye å si. Gode bilder og en stylet bolig er som regel en god investering, sier Frantzen.'
      )
    ),
    para(
      span(
        'Hun understreker at det sjelden lønner seg med store oppussingsprosjekter før salg. – Enkle grep som maling og oppgradering av lister kan derimot løfte helhetsinntrykket betydelig.'
      )
    ),
    para(
      span(
        'Et annet viktig råd er å prise boligen riktig. – En vanlig feil er å sette prisen for høyt. Da risikerer man at boligen blir liggende lenge i markedet, noe som også kan skape utfordringer med mellomfinansiering dersom man allerede har kjøpt ny bolig.'
      )
    ),
    quote('Gjør de enkle grepene, treff riktig på pris og vær klar når de riktige kjøperne dukker opp.'),
  ]
}

// ── 2. Planlegg ferien i god tid (banksjef Mølnvik) ───────────────────
const FERIE_ID = 'planlegg-ferien-i-god-tid'
const FERIE_TITLE = 'Planlegg ferien i god tid'
const FERIE_TEASER =
  'Økte renter og høyere boutgifter gjør at mange må prioritere hardere. Likevel er det mulig å få til en god sommerferie med noen enkle grep og bedre planlegging.'

function ferieBody(): Block[] {
  return [
    para(span('Det beste rådet fra banken er å starte med sparing i god tid.')),
    para(
      span(
        '– Sett av et fast trekk til feriekontoen når du får lønn. Dette er penger du ikke «ser», og som vil komme godt med når sommerferien kommer. Og kanskje kan du sette deg et mål om å selge tre ting du ikke bruker lengre på Finn? Det er rådet fra Marte Mølnvik, regionbanksjef i Trondheim, SpareBank 1 SMN.'
      )
    ),
    para(
      span(
        'Sett av et beløp som passer din økonomi. Selv små summer kan vokse seg store over tid. Samtidig er det viktig å tilpasse ambisjonene. Dropp drømmeferien hvis den ikke passer budsjettet.'
      )
    ),
    para(
      span(
        '– Vi anbefaler aldri å finansiere ferie med kreditt. Det kan virke overkommelig der og da, men tilbakebetalingen blir ofte både lengre og dyrere enn planlagt, sier banksjef Mølnvik.'
      )
    ),
    para(
      span(
        'Planlegger du ferie flere år frem i tid, kan sparing i fond være et alternativ. Denne typen sparing kan gi bedre avkastning over tid.'
      )
    ),
    quote(
      'Den faste kaffekoppen på Dromedar Kaffebar kan fort bli mange tusen kroner i løpet av et år, penger som heller kan settes til sparing.'
    ),
    para(
      span(
        'Til tross for renteøkninger er rådet å opprettholde sparing, både til buffer og ferie. Se heller på abonnementer og små utgifter i hverdagen som kan kuttes.'
      )
    ),
    para(
      span(
        'Mølnviks viktigste råd er likevel å tilpasse ferien etter økonomien. – Juster ambisjonsnivået. For mange barn handler ferie mest om tid sammen med familien, og en hyttetur kan være like vellykket som en utenlandstur, sier hun.'
      )
    ),
    para(span('Rådet er enkelt: ikke bruk penger du ikke har, og start sparingen tidlig.')),
  ]
}

async function main() {
  console.log(DRY ? '🔍 DRY-RUN (skriver ingenting)\n' : '✍️  Splitter bank-og-megler\n')

  // Finn det eksisterende bank-og-megler-dokumentet (publisert + evt utkast).
  const docs = await sanity.fetch(
    `*[_type == "article" && slug.current == "bank-og-megler"]{ _id }`
  )
  if (!docs.length) throw new Error('Fant ingen artikkel med slug «bank-og-megler»')

  const tx = sanity.transaction()

  // 1) Gjør om eksisterende → Boligmarkedet før sommeren (behold Frantzen-bildet).
  const boligSet = {
    title: BOLIG_TITLE,
    slug: { _type: 'slug', current: BOLIG_SLUG },
    teaser: BOLIG_TEASER,
    accentColor: 'purple',
    colorMode: 'tinted',
    heroLayout: 'portrait',
    portraitName: 'Marthe Frantzen',
    portraitRole: 'EiendomsMegler 1 Heimdal',
    'heroImage.alt': 'Eiendomsmegler Marthe Frantzen',
    subtitle: undefined,
    estimatedReadTime: 3,
    body: boligBody(),
  }
  for (const d of docs) {
    tx.patch(d._id, (p) => p.set(stripUndefined(boligSet)).unset(['subtitle']))
  }

  // 2) Ny: Planlegg ferien i god tid (Mølnvik) – UTKAST, mangler foto.
  const ferieDraft = {
    _id: `drafts.${FERIE_ID}`,
    _type: 'article',
    type: 'standard',
    title: FERIE_TITLE,
    slug: { _type: 'slug', current: FERIE_ID },
    teaser: FERIE_TEASER,
    estimatedReadTime: 2,
    publishedAt: '2026-04-01T00:00:00Z',
    edition: { _type: 'reference', _ref: EDITION_REF },
    author: { _type: 'reference', _ref: AUTHOR_REF },
    accentColor: 'purple',
    colorMode: 'tinted',
    heroLayout: 'portrait',
    portraitName: 'Marte Mølnvik',
    portraitRole: 'Regionbanksjef, SpareBank 1 SMN',
    body: ferieBody(),
  }
  tx.createOrReplace(ferieDraft)

  console.log('1) bank-og-megler →', `«${BOLIG_TITLE}»  [${BOLIG_SLUG}]`)
  console.log('   lilla · tinted · rundt ekspertportrett (Marthe Frantzen) · PUBLISERT (beholder foto)')
  console.log('   body:', boligBody().length, 'blokker')
  console.log('2) NY UTKAST →', `«${FERIE_TITLE}»  [${FERIE_ID}]`)
  console.log('   lilla · tinted · rundt ekspertportrett (Marte Mølnvik) · mangler foto ⇒ UTKAST')
  console.log('   body:', ferieBody().length, 'blokker')

  if (DRY) {
    console.log('\n(dry — ingenting skrevet)')
    return
  }

  await tx.commit()
  console.log('\n✅ Ferdig. Boligmarkedet er live; Planlegg ferien venter på Mølnvik-foto (utkast).')
}

function stripUndefined(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
