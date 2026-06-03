/**
 * Pilot: «Trygghet rundt boligselskapsmodellen» → «Skal du kjøpe bolig?»
 *
 * Teksten i Sanity er allerede synket mot print (Rede 2 2026, s. 8–9). Dette
 * scriptet rydder STRUKTUR + DESIGN slik at den digitale visningen matcher
 * trykksaken (oppskrift B: full lilla flate, ingen toppbilde):
 *
 *  1. Tittel → «Skal du kjøpe bolig?», undertittel → «Vær bevisst på dine bokostnader».
 *  2. Løfter den begravde print-tittelen UT av brødteksten.
 *  3. Gjør de to løse «Borettslag/Eierseksjonssameier»-blokkene om til én faktaboks.
 *  4. Setter ingress = print-standfirst.
 *  5. Setter fargeidentitet: lilla, full farget flate, ingen bilde.
 *
 * Bygger brødteksten deterministisk fra den verifiserte print-teksten ⇒ trygt å
 * kjøre flere ganger (idempotent). --dry skriver ingenting.
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

const h3 = (text: string): Block => ({
  _type: 'block',
  _key: key(),
  style: 'h3',
  markDefs: [],
  children: [span(text)],
})

const SLUG = 'trygghet-boligselskap'

const TITLE = 'Skal du kjøpe bolig?'
const SUBTITLE = 'Vær bevisst på dine bokostnader'
const TEASER =
  'Lave felleskostnader kan virke fristende når du skal kjøpe bolig. Men hva skjuler seg bak tallene?'

function buildBody(): Block[] {
  return [
    {
      _type: 'inlineFactBox',
      _key: key(),
      title: 'Hva dekker felleskostnadene?',
      content: [
        para(
          span('Borettslag: ', ['strong']),
          span(
            'Felleskostnadene dekker drift og vedlikehold av eiendommen, men ofte også renter og eventuelt avdrag på borettslagets fellesgjeld. Dersom borettslaget har høy fellesgjeld, ofte knyttet til nybygg eller større rehabiliteringer, kan dette gi høyere månedlige felleskostnader for andelseierne.'
          )
        ),
        para(
          span('Eierseksjonssameier: ', ['strong']),
          span(
            'Felleskostnadene dekker drift og vedlikehold av eiendommen. Sameier kan også ha fellesgjeld, for eksempel i forbindelse med større vedlikeholdsprosjekter, men dette er normalt i mindre omfang enn i borettslag.'
          )
        ),
      ],
    },
    para(
      span(
        'Bokostnader handler om mer enn det du betaler i dag – de handler om økonomisk bærekraft over tid.'
      )
    ),
    h3('Når markedet snur, kommer realitetene'),
    para(
      span(
        'I perioder med sterk vekst i boligmarkedet har det vært lett å la seg friste av lave felleskostnader og fortellingen om at bolig alltid er en trygg investering. Når prisene stiger, stilles det færre kritiske spørsmål. Men når renten øker, avdragsfriheten på fellesgjeld utløper og vedlikeholdsbehovene melder seg, blir forskjellen på markedsføring og realitet tydelig.'
      )
    ),
    para(
      span(
        'Tidlig på 2000-tallet ble mange borettslagsboliger solgt med lavt innskudd og høy fellesgjeld. Felleskostnadene var «skrapt til beinet», blant annet gjennom avdragsfrihet på fellesgjeld i en «startfase». Da avdragene startet og renten steg, økte kostnadene kraftig og mange boliger falt i verdi. For noen ble belastningen så stor at de valgte å gi fra seg boligen.'
      )
    ),
    para(
      span(
        'Regelverket for finansiering av borettslag er strengere i dag enn den gang, men utfordringen er ikke borte. Også de senere årene har mange fått kjenne på effekten av renteøkninger kombinert med oppstart av avdrag på fellesgjelden. Lav inngangsbillett betyr ikke nødvendigvis lav bokostnad over tid.'
      )
    ),
    h3('Hva ligger egentlig bak felleskostnadene?'),
    para(
      span(
        'Felleskostnader kan holdes kunstig lave gjennom høy andel fellesgjeld og avdragsfrihet i en innledende periode. Det kan gi et attraktivt salgsargument, men skyver kostnadene frem i tid.'
      )
    ),
    para(
      span(
        'Totalprisen på boligen er den samme enten finansieringen består av 25 prosent innskudd og 75 prosent fellesgjeld, eller en mer balansert modell som 50/50. En mer balansert finansiering gjør økonomien mer robust mot renteøkninger og gir en mindre dramatisk overgang når avdragene starter. Den bidrar også til større bevissthet hos kjøper på kjøpstidspunktet.'
      )
    ),
    h3('Kvaliteten bak fasaden'),
    para(
      span(
        'Bokostnader handler ikke bare om gjeld og renter. De handler også om kvaliteten i boligprosjektet. I en tid med sterk konkurranse på pris per kvadratmeter kan det være fristende å presse kostnader gjennom enklere løsninger og rimeligere materialvalg.'
      )
    ),
    para(
      span(
        'Prosjekter som på overflaten fremstår like, kan ha betydelige forskjeller i teknisk kvalitet, energiløsninger og forventet levetid. Valg av oppvarmingssystem, tekniske installasjoner og materialer påvirker både energibruk og fremtidig vedlikeholdsbehov. Det som virker rimelig ved kjøp, kan bli kostbart over tid.'
      )
    ),
  ]
}

async function main() {
  console.log(DRY ? '🔍 DRY-RUN (skriver ingenting)\n' : '✍️  Utfører pilot-rydding\n')

  // Hent publisert + evt. utkast
  const docs = await sanity.fetch(
    `*[_type == "article" && slug.current == $slug]{_id, title}`,
    { slug: SLUG }
  )
  if (!docs.length) throw new Error(`Fant ingen artikkel med slug «${SLUG}»`)

  const published = docs.find((d: any) => !d._id.startsWith('drafts.'))
  const draft = docs.find((d: any) => d._id.startsWith('drafts.'))
  if (!published) throw new Error(`Fant ingen PUBLISERT artikkel med slug «${SLUG}»`)

  const body = buildBody()

  const set = {
    title: TITLE,
    subtitle: SUBTITLE,
    teaser: TEASER,
    accentColor: 'purple',
    colorMode: 'filled',
    heroLayout: 'none',
    body,
  }

  console.log('📄 Artikkel:', published._id)
  console.log('   fra:   ', `«${published.title}»`)
  console.log('   til:   ', `«${TITLE}» / «${SUBTITLE}»`)
  console.log('   farge: ', 'lilla · full farget flate · ingen bilde')
  console.log('   ingress:', TEASER)
  console.log('   body:  ', body.length, 'blokker (1 faktaboks, 3 mellomtitler)')
  if (draft) console.log('   ⚠️  utkast finnes også:', draft._id, '— oppdateres likt')

  if (DRY) {
    console.log('\n(dry — ingenting skrevet)')
    return
  }

  const tx = sanity.transaction().patch(published._id, (p) => p.set(set))
  if (draft) tx.patch(draft._id, (p) => p.set(set))
  await tx.commit()

  console.log('\n✅ Ferdig. Piloten er ryddet og fått lilla fargeidentitet.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
