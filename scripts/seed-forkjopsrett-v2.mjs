/**
 * Seeder den NYE forkjøpsrett-scrollytellingen (set-piece-versjonen) som UTKAST
 * (drafts.article-forkjopsrett). Erstatter den gamle fade-strukturen helt.
 * Idempotent: createOrReplace på draft-id.
 *
 * STOPP å kjøre dette så snart redaktøren redigerer teksten i Studio (overskriver).
 *
 *   node scripts/seed-forkjopsrett-v2.mjs
 */
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'tqfezovu',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

let n = 0
const key = () => `k${(n++).toString(36)}`

// portable text: enkelt avsnitt (ingen fet/kursiv her)
const block = (text) => [
  {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  },
]

const step = (icon, title, text) => ({ _type: 'stickyVeiStep', _key: key(), icon, title, text })

const sections = [
  // 0 — Cover
  {
    _type: 'illustratedCover',
    _key: key(),
    kicker: 'Forkjøpsrett',
    title: 'Slik går du foran i boligkøen',
    dek: 'Forkjøpsrett er din største fordel som TOBB-medlem. Men hvordan fungerer det egentlig?',
    icon: 'nokkel',
  },
  // 1 — Åpning (skiltet settes sammen)
  {
    _type: 'illustratedScene',
    _key: key(),
    eyebrow: 'Boligjakt',
    title: 'Du finner drømmeleiligheten',
    icon: 'til-salgs',
    animateIllustration: true,
    text: block(
      'Riktig pris. Riktig nabolag. Til og med balkong mot vest. Så scroller du ned til visningstidspunktet — og skjønner at du ikke er alene.',
    ),
  },
  // 2 — 29 andre (folkemengde)
  {
    _type: 'illustratedScene',
    _key: key(),
    title: 'Det gjør 29 andre også',
    icon: 'forstemann',
    text: block(
      'På en god visning i en presset by kan det stå titalls mennesker i kø. Alle med finansieringsbevis. Den med mest på konto vinner som regel. Men hva om du kunne snike i køen, helt lovlig?',
    ),
  },
  // 3 — Snik-slider
  { _type: 'koeSlider', _key: key(), competitors: 29 },
  // 4 — Ansiennitet (motoren)
  {
    _type: 'illustratedScene',
    _key: key(),
    eyebrow: 'Motoren',
    title: 'Klokka starter dagen du blir medlem',
    icon: 'nr-1',
    secondaryIcon: 'kalender',
    text: block(
      'Forkjøpsrett bygger på ansiennitet — hvor lenge du har vært TOBB-medlem. Jo lengre du har vært medlem, jo nærmere døra står du. En TOBB-bolig gjøres tilgjengelig for medlemmer på én av to måter — megleren bestemmer hvilken, ut fra salgsformen.',
    ),
  },
  // 5 — Veiskille (Y-deling)
  {
    _type: 'veideling',
    _key: key(),
    intro: 'Her deler veien seg.',
    mainLabel: 'Forhåndsavklaring',
    mainBadge: '95 % av salgene',
    sideLabel: 'Fastprisavklaring',
    sideBadge: 'Unntaket',
  },
  // 6 — Vei 1 (sticky)
  {
    _type: 'stickyVei',
    _key: key(),
    label: 'Vei 1 · Forhåndsavklaring',
    badge: '95 % av salgene',
    intro:
      'Du viser interesse tidlig, helt uforpliktende. En faktisk kø oppstår først hvis du vil kreve forkjøp etter budrunden — og da vinner best ansiennitet.',
    steps: [
      step('pc', 'Boligen dukker opp', 'Boligen lyses ut for medlemmer i forkjøpsportalen på TOBB.no. Her melder du interesse innen fristen — før den legges ut for salg offentlig.'),
      step('mote', 'Megler tar over', 'Fristen utløper, og megler får oversikt over interessentene. Så kjøres salget som et vanlig boligsalg: annonsering, visning og budaksept.'),
      step('telefon', 'Sjansen din kommer', 'TOBB sender deg sms og e-post med frist for å kreve forkjøpsrett. Et krav du sender inn her, er bindende.'),
      step('nokkel', 'Avklart', 'Forkjøpsretten avklares, og alle parter informeres. Står du øverst på ansiennitet, er nøkkelen din.'),
    ],
  },
  // 7 — Bro til Vei 2
  {
    _type: 'illustratedScene',
    _key: key(),
    title: 'Men hva om boligen allerede er solgt i en helt vanlig budrunde?',
    centerBody: true,
    text: block('Da slår den andre veien inn — unntaket.'),
  },
  // 8 — Vei 2 (sticky)
  {
    _type: 'stickyVei',
    _key: key(),
    label: 'Vei 2 · Fastprisavklaring',
    badge: 'Unntaket',
    intro:
      'Her finnes ingen interessefase. Boligen er allerede solgt i en vanlig budrunde, og gjøres så tilgjengelig for forkjøpsrett — køen rangeres etter ansiennitet.',
    steps: [
      step('til-salgs', 'Vanlig salg først', 'Boligen legges direkte ut på det åpne markedet, uten å ha vært lyst ut med forkjøpsrett. Megler kjører annonsering, visning, budrunde og aksept.'),
      step('pc', 'Fast pris i portalen', 'TOBB legger boligen i Forkjøpsportalen med en frist. Pris og overtakelse er allerede fastsatt — etter høyeste bud.'),
      step('signere', 'Du krever forkjøp', 'Du bruker forkjøpsretten ved å sende inn et skjema på TOBB.no. Innsendingen er bindende.'),
      step('nokkel', 'Avklart', 'Forkjøpsrett avklares hos TOBB, og alle parter informeres. Best ansiennitet vinner — også her.'),
    ],
  },
  // 9 — Avslutning (sparegris)
  {
    _type: 'illustratedScene',
    _key: key(),
    eyebrow: 'Livet gjennom',
    title: 'Et fortrinn som følger deg',
    icon: 'sparegris',
    animateIllustration: true,
    text: block(
      'Første leilighet. Større bolig når livet vokser. Noe mindre den dagen barna har flyttet ut. Forkjøpsretten står ved din side hver gang du skal flytte videre — og jo tidligere du startet, jo sterkere står du.',
    ),
  },
  // 10 — Følger-deg-gif
  {
    _type: 'gifKort',
    _key: key(),
    src: '/forkjopsrett/stalk.gif',
    alt: 'Forkjøpsretten følger deg',
    maxWidth: 320,
  },
  // 11 — Storby-kart
  {
    _type: 'storbyKart',
    _key: key(),
    eyebrow: 'Hele landet',
    title: 'Og ikke bare i Trondheim',
    intro:
      'Gjennom Storbysamarbeidet gjelder forkjøpsretten i åtte boligbyggelag — fra Kristiansand til Tromsø. Skal du studere eller flytte? Ansienniteten din blir med deg.',
  },
  // 12 — Personlig ansiennitet-sjekk + CTA
  {
    _type: 'ansiennitetSjekk',
    _key: key(),
    ctaLabel: 'Bli TOBB-medlem',
    ctaHref: 'https://tobb.no/bli-medlem/',
  },
]

const doc = {
  _id: 'drafts.article-forkjopsrett',
  _type: 'article',
  title: 'Slik går du foran i boligkøen',
  slug: { _type: 'slug', current: 'forkjopsrett' },
  type: 'scrollytelling',
  accentColor: 'navy',
  colorMode: 'canvas',
  teaser:
    'Forkjøpsrett er din største fordel som TOBB-medlem. Men hvordan fungerer det egentlig? Bli med inn i boligkøen.',
  sections,
}

const res = await client.createOrReplace(doc)
console.log('Utkast lagret:', res._id, '—', doc.sections.length, 'seksjoner')
