// Standard personvern-tekst for Rede. ÉN sannhet, brukt to steder:
//   1. /personvern-siden som fallback hvis Sanity-dokumentet ikke finnes ennå
//   2. seed-scriptet (scripts/seed-privacy-page.ts) som legger teksten inn i
//      Sanity, slik at redaktøren kan finpusse ordlyden derfra.
// Holdes bevisst som enkel struktur (overskrift + avsnitt + punkter) så den er
// lett å lese her OG lett å konvertere til Portable Text i seed-scriptet.

export interface PrivacySection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export const PRIVACY_TITLE = 'Personvern'

export const PRIVACY_INTRO =
  'Denne siden forklarer hvordan Rede behandler personopplysninger når du besøker nettstedet. Rede er TOBBs medlemsmagasin, og TOBB (Trondheim og Omegn Boligbyggelag) er ansvarlig for behandlingen av personopplysninger her.'

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    heading: 'Kort oppsummert',
    bullets: [
      'Vi bruker Google Analytics for å forstå hvordan magasinet leses — for eksempel hvilke artikler som er populære og hvor langt folk leser.',
      'Vi samler aldri inn navn, e-post eller annet som identifiserer deg personlig.',
      'Måling skjer kun hvis du sier ja til det. Sier du nei, blir du ikke sporet.',
      'Du kan ombestemme deg når som helst og trekke tilbake samtykket.',
    ],
  },
  {
    heading: 'Hva vi måler',
    paragraphs: [
      'Når du har samtykket, bruker vi Google Analytics til å samle inn anonym statistikk om bruken av nettstedet. Dette hjelper oss å lage et bedre magasin.',
    ],
    bullets: [
      'Hvilke sider og artikler som besøkes, og hvor mange ganger.',
      'Hvor langt ned i en artikkel leserne kommer (lesedybde).',
      'Hvor lenge man blir værende, og hvilke lenker som klikkes.',
      'Hvilken type enhet og nettleser som brukes, og omtrentlig geografisk område.',
    ],
  },
  {
    heading: 'Vi prøver aldri å finne ut hvem du er',
    paragraphs: [
      'Informasjonen brukes kun samlet og statistisk. Vi forsøker ikke å identifisere enkeltpersoner, og vi selger ikke data videre til andre.',
    ],
  },
  {
    heading: 'Rettslig grunnlag',
    paragraphs: [
      'Behandlingen er basert på ditt samtykke, jf. personvernforordningen (GDPR) artikkel 6 nr. 1 bokstav a og ekomloven. Du gir samtykke gjennom varselet om informasjonskapsler første gang du besøker siden, og kan trekke det tilbake når som helst.',
    ],
  },
  {
    heading: 'Informasjonskapsler (cookies)',
    paragraphs: ['Vi bruker disse informasjonskapslene:'],
    bullets: [
      'En samtykke-cookie — husker om du har sagt ja eller nei til måling, slik at du ikke må ta stilling på nytt ved hvert besøk. Denne er nødvendig for at valget ditt skal bli husket.',
      '_ga og _ga_* — settes av Google Analytics for å skille mellom besøkende og økter. Disse settes kun hvis du samtykker til måling. Varighet: inntil 24 måneder.',
    ],
  },
  {
    heading: 'Google som databehandler',
    paragraphs: [
      'Google Analytics leveres av Google Ireland Limited, som behandler dataene på vegne av TOBB. Data kan bli overført til USA. Google er sertifisert under EUs rammeverk for dataoverføring (Data Privacy Framework).',
      'Vi har slått på innstillinger som begrenser datadeling og anonymiserer IP-adresser så langt det lar seg gjøre.',
    ],
  },
  {
    heading: 'Dine rettigheter',
    paragraphs: [
      'Du har rett til innsyn i, og sletting av, opplysninger om deg. Fordi statistikken er anonym, kan vi som regel ikke knytte den til deg som enkeltperson. Den enkleste måten å stoppe måling på er å trekke tilbake samtykket — det kan du gjøre når som helst via samtykkeinnstillingene på siden.',
      'Har du spørsmål om personvern, kan du kontakte TOBB via tobb.no. Mener du at vi behandler personopplysninger i strid med regelverket, kan du klage til Datatilsynet (datatilsynet.no).',
    ],
  },
  {
    heading: 'Endringer',
    paragraphs: [
      'Vi kan oppdatere denne erklæringen ved behov, for eksempel hvis vi tar i bruk nye verktøy. Datoen for siste oppdatering vises øverst på siden.',
    ],
  },
]
