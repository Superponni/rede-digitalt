/**
 * Seeder forkjøpsrett-scrollytellingen som UTKAST (drafts.article-forkjopsrett).
 * Flytende, midtstilt narrativ (illustratedScene), lys blå bakgrunn (canvas).
 * Idempotent: createOrReplace på draft-id. STOPP å kjøre dette så snart redaktøren
 * redigerer i Studio.
 *
 *   node scripts/seed-forkjopsrett.mjs
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

// portable text-avsnitt; bruk {b:'...'} for **fet** og {i:'...'} for kursiv
const para = (...parts) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: parts.map((p) => {
    if (typeof p === 'string') return { _type: 'span', _key: key(), text: p, marks: [] }
    if (p.b) return { _type: 'span', _key: key(), text: p.b, marks: ['strong'] }
    return { _type: 'span', _key: key(), text: p.i, marks: ['em'] }
  }),
})

// scene: illustrasjon (valgfri) + tekst, alltid midtstilt. Uten icon = historie-bro.
const scene = ({ eyebrow, title, icon, secondaryIcon, text, ctaLabel, ctaHref }) => ({
  _type: 'illustratedScene',
  _key: key(),
  ...(eyebrow ? { eyebrow } : {}),
  ...(title ? { title } : {}),
  ...(icon ? { icon } : {}),
  ...(secondaryIcon ? { secondaryIcon } : {}),
  ...(text ? { text } : {}),
  ...(ctaLabel ? { ctaLabel } : {}),
  ...(ctaHref ? { ctaHref } : {}),
})

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
  sections: [
    // 0 — Cover
    {
      _type: 'illustratedCover',
      _key: key(),
      kicker: 'Forkjøpsrett',
      title: 'Slik går du foran i boligkøen',
      dek: 'Forkjøpsrett er din største fordel som TOBB-medlem. Men hvordan fungerer det egentlig?',
      icon: 'nokkel',
    },
    // 1 — Åpning (bro)
    scene({
      eyebrow: 'Boligjakt',
      title: 'Du finner drømmeleiligheten',
      text: [
        para('Riktig pris. Riktig nabolag. Til og med balkong mot vest. Du ser det for deg allerede — kaffen om morgenen, vennene på besøk en fredag.'),
        para('Så scroller du ned til visningstidspunktet. Og skjønner at du ikke er alene.'),
      ],
    }),
    // 2 — Køen
    scene({
      icon: 'forstemann',
      title: 'Det gjør 29 andre også',
      text: [
        para('På en god visning i en presset by kan det stå titalls mennesker i kø. Alle med finansieringsbevis. Alle klare til å by deg ut.'),
        para('I et marked der det er mange om beinet, vinner som regel den med mest på konto. Med mindre du har noe de andre ikke har.'),
      ],
    }),
    // 3 — Vrien (bro)
    scene({
      title: 'Men hva om du kunne gå foran i køen — helt lovlig?',
      text: [
        para('Det er akkurat det forkjøpsrett er: din største fordel som TOBB-medlem. Den lar deg gå foran i boligkøen, og koster deg ingenting ekstra når du først er medlem.'),
        para('Men hvordan fungerer det egentlig? Bli med inn i køen.'),
      ],
    }),
    // 4 — Ansiennitet
    scene({
      icon: 'nr-1', secondaryIcon: 'kalender', eyebrow: 'Motoren',
      title: 'Klokka starter dagen du blir medlem',
      text: [
        para('Forkjøpsrett bygger på ', { b: 'ansiennitet' }, ' — hvor lenge du har vært TOBB-medlem. Jo lenger, jo lenger frem i køen står du.'),
        para('Det betyr at det smarteste boligtrekket ditt kanskje er å melde deg inn lenge før du i det hele tatt er klar til å kjøpe. Ansienniteten din vokser mens du sover.'),
      ],
    }),
    // 4b — Interaktiv ansiennitet-slider
    {
      _type: 'ansiennitetSlider',
      _key: key(),
      title: 'Hvor sterkt står du i køen?',
      intro: 'Dra på antall år du har vært medlem, og se hvor langt frem du kommer.',
    },
    // 5 — To veier (bro)
    scene({
      title: 'To veier inn',
      text: [
        para('En TOBB-bolig som skal selges, gjøres tilgjengelig for medlemmer på én av to måter. Megleren bestemmer hvilken — det følger salgsformen.'),
        para('Den ene brukes nesten alltid. Den andre er unntaket. Her er begge.'),
      ],
    }),
    // 6 — Forhåndsavklaring intro
    scene({
      icon: 'liste', eyebrow: 'Vei 1 · brukes i 95 % av tilfellene',
      title: 'Forhåndsavklaring',
      text: [
        para('Når du kan vise interesse ', { i: 'tidlig' }, '. Å melde interesse er ', { b: 'ikke' }, ' bindende — det er bare et signal.'),
        para('En faktisk kø oppstår først hvis du vil kreve forkjøp etter budrunden. Og da er det den med best ansiennitet som blir kjøper.'),
      ],
    }),
    scene({
      icon: 'pc', eyebrow: 'Steg 1', title: 'Boligen dukker opp',
      text: [para('Boligen lyses ut for medlemmer i forkjøpsportalen på TOBB.no. Her melder du interesse innen fristen — før den i det hele tatt legges ut for salg offentlig.')],
    }),
    scene({
      icon: 'mote', eyebrow: 'Steg 2', title: 'Megler tar over',
      text: [para('Fristen utløper, og megler får oversikt over interessentene. Så kjøres salget som et vanlig boligsalg: annonsering, visning, salg og budaksept.')],
    }),
    scene({
      icon: 'telefon', eyebrow: 'Steg 3', title: 'Sjansen din kommer',
      text: [para('TOBB mottar salgsmelding og sender deg sms og e-post med frist for å kreve forkjøpsrett. ', { b: 'Et krav du sender inn her, er bindende.' })],
    }),
    scene({
      icon: 'nokkel', secondaryIcon: 'check', eyebrow: 'Steg 4', title: 'Avklart',
      text: [para('Forkjøpsretten avklares, og alle parter informeres. Står du øverst på ansiennitet, er nøkkelen din.')],
    }),
    // 7 — Bro til fastpris
    scene({
      text: [
        para('Men hva skjer hvis boligen allerede er solgt i en helt vanlig budrunde? Kan du fortsatt komme til?'),
        para({ b: 'Ja.' }, ' Da slår den andre veien inn.'),
      ],
    }),
    // 8 — Fastprisavklaring intro
    scene({
      icon: 'penger', eyebrow: 'Vei 2 · unntaket',
      title: 'Fastprisavklaring',
      text: [
        para('Når prisen er satt ', { i: 'etter' }, ' budrunden. Her finnes ingen interessefase.'),
        para('Boligen gjøres direkte tilgjengelig for forkjøpsrett. Køen oppstår umiddelbart og rangeres etter ansiennitet.'),
      ],
    }),
    scene({
      icon: 'til-salgs', eyebrow: 'Steg 1', title: 'Vanlig salg først',
      text: [para('Boligen legges direkte ut på det åpne markedet, uten å ha vært lyst ut med forkjøpsrett. Megler kjører annonsering, visning, budrunde og aksept.')],
    }),
    scene({
      icon: 'pc', secondaryIcon: 'penger', eyebrow: 'Steg 2', title: 'Fast pris i portalen',
      text: [para('TOBB mottar salgsmelding, og boligen legges i Forkjøpsportalen med en frist. Pris og overtakelse er allerede fastsatt — etter høyeste bud.')],
    }),
    scene({
      icon: 'signere', eyebrow: 'Steg 3', title: 'Du krever forkjøp',
      text: [para('Du bruker forkjøpsretten ved å sende inn et skjema på TOBB.no. ', { b: 'Innsendingen er bindende.' })],
    }),
    scene({
      icon: 'nokkel', secondaryIcon: 'check', eyebrow: 'Steg 4', title: 'Avklart',
      text: [para('Forkjøpsrett avklares hos TOBB, og alle parter informeres. Best ansiennitet vinner — også her.')],
    }),
    // 8b — Storbysamarbeidet
    scene({
      icon: 'bomiljo', eyebrow: 'Hele landet',
      title: 'Og den virker ikke bare i Trondheim',
      text: [
        para('Som TOBB-medlem kan du bruke forkjøpsretten over hele landet. Gjennom ', { b: 'Storbysamarbeidet' }, ' gjelder den både brukte og nye boliger for salg — i tillegg til utleieboliger i flere av de største universitetsbyene.'),
        para('Skal du studere i en annen by? Ansienniteten din følger med deg.'),
      ],
    }),
    // 9 — Avslutning / myk CTA
    scene({
      title: 'Et fortrinn som følger deg livet gjennom',
      text: [
        para('Første leilighet. Større bolig når livet vokser. Noe mindre den dagen barna har flyttet ut. Forkjøpsretten står ved din side hver gang du skal flytte videre.'),
        para('Og jo tidligere du startet, jo sterkere står du. Kanskje er det neste smarte trekket ditt å bli medlem — i dag.'),
      ],
      ctaLabel: 'Bli TOBB-medlem',
      ctaHref: 'https://tobb.no/bli-medlem/',
    }),
  ],
}

const res = await client.createOrReplace(doc)
console.log('Utkast lagret:', res._id, '—', doc.sections.length, 'scener')
