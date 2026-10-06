# Sanity og innhold

## Tre kilder til sannhet

| Kilde | Hva | Regel |
|---|---|---|
| **Drive** (`REDE/`) | Journalistens råmateriale + trykk-PDF | Vi **leser**, skriver aldri |
| **Sanity** (prosjekt `tqfezovu`, datasett `production`) | Alt publisert innhold | All redigering skjer her (Studio eller script) |
| **GitHub** (`Superponni/rede-digitalt`) | Kode, manifest, dokumentasjon | |

Den lokale `content/`-mappa (gitignorert) er et gammelt øyeblikksbilde. Drive er fasit for råmateriale.

## Import

`scripts/import-edition.ts` er en **engangs-seeding per utgave**, ikke en synk. Detaljer i [../prosess/ny-utgave.md](../prosess/ny-utgave.md).

- Deterministiske ID-er: `article-<slug>`, `edition-<nr>-<år>`. Kjøres den igjen, hoppes eksisterende saker over.
- `--force --only=<slug>` overskriver én sak — og sletter redaksjonelle endringer.
- **Felle:** saker opprettet før importen fikk faste ID-er (våren 2026) har tilfeldige ID-er. `--force` på dem lager et **duplikat** ved siden av. Sjekk for dupliserte slugs før og etter.
- AI-delen (Claude via `ANTHROPIC_API_KEY`) er Superponnis verktøy — skal ikke overleveres kunden eller ligge i Vercel.

## Publisering og mellomlagring

Publisert innhold er ute på rede.no innen **~1 minutt**, uten ny deploy. Det krever begge disse (ikke fjern dem):
1. `export const revalidate = 60` i `src/app/(site)/layout.tsx`
2. `fetchOptions: { revalidate: 60 }` i `defineLive()` i `src/sanity/lib/live.ts`

`fetchOptions` er merket som utgående i next-sanity. Ved oppgradering må den erstattes med Sanity-webhook → `revalidateTag`.

Verifiser alltid innholdsendringer på **rede.no**, ikke bare localhost, og vent 1–2 minutter (første besøk etter vinduet kan få gammel side og utløse oppfriskning).

## Forhåndsvisning (Presentation)

- Øye-ikonet i Studio åpner saken side om side med live forhåndsvisning (rede.no/studio, eller localhost:3100/studio).
- Krever `SANITY_API_READ_TOKEN` (Viewer-rolle — **aldri** et skrivetoken her, det sendes til nettleseren i forhåndsvisning).
- Domener som skal kunne vise forhåndsvisning må ligge i Sanity CORS-listen (nå: rede.no, www.rede.no, localhost:3000/3100/3333, rededemo.vercel.app). Nye domener: `sanity cors add <url> --credentials`.
- **Stega-felle:** i forhåndsvisning legges usynlige tegn inn i hver tekststreng. Felt som brukes i logikk (sammenligning, filtrering, oppslag) ser da forskjellige ut og brekker — **kun** i forhåndsvisning. Løsning: legg feltnavnet i `STEGA_SKIP_FIELDS` i `src/sanity/lib/live.ts`. **Alle nye logikkfelt må inn der.**

## Skjemaendringer

- Studio ligger i nettsiden (`/studio`), så en gren har sitt eget Studio — men lagrer i samme datasett som rede.no.
- **Legge til** felt/klosser: trygt.
- **Gi nytt navn til / slette** felt i bruk: krever migrering av eksisterende data. Ellers forsvinner innhold.
- Nye klosser: registrer i `src/sanity/schemas/index.ts`, i `sections` i `documents/article.ts`, og i `SECTION_MAP` i `ScrollytellingRenderer.tsx`.
- Studio-menyen (`src/sanity/structure.ts`) må liste alle dokumenttyper, ellers forsvinner de fra menyen.
- Hvis vi igjen vil ha ulik bakgrunn per seksjon: `ScrollytellingRenderer.tsx` overstyrer i dag seksjonens bakgrunn med artikkelens. Det må endres der, ikke bare i skjemaet.

## Forsideplassering

`frontpagePlacement` (`top`/`regular`) styrer forsiden — ikke artikkeltypen. Toppraden = de 3 nyeste med `top`. Artikkelsiden viser seksjoner hvis de finnes, uansett type, så innhold forsvinner aldri ved typebytte. `menuFeatured` velger menyens store kort.

GROQ-felle: `order(menuFeatured desc)` sorterer `null` **over** `true`. Bruk `order(select(menuFeatured == true => 1, 0) desc, …)`.

## Script mot Sanity — mønster

- Kjør fra prosjektmappa (ikke `/tmp`), med `node --env-file=.env.local` eller `npx tsx`.
- `@sanity/client` med `projectId: 'tqfezovu'`, `dataset: 'production'`, `useCdn: false`, `token: process.env.SANITY_API_WRITE_TOKEN`.
- Midlertidige script i `scripts/tmp/` (eller med `_`-prefiks) — slett etter bruk. Script som bør tas vare på → `scripts/arkiv/`.
- Script skal være **idempotente** (trygge å kjøre to ganger): bruk faste ID-er, `createOrReplace`, gjenbruk assets via `originalFilename`.
- Store endringer → på utkast (`drafts.<id>`) først.
- Last ned bilder fra Drive med `curl -sL "https://drive.google.com/uc?export=download&id=<ID>" -o fil` — ikke via Drive-koblingen i Claude (fyller samtalen med megabytes).

## SEO og lansering

- Hele nettstedet er skjult for Google og AI-søk inntil `NEXT_PUBLIC_SITE_INDEXABLE=true` settes i Vercel (produksjon). Logikk i `src/lib/site.ts`.
- Fanen «Deling & søk» i Studio er valgfrie overstyringer; alt utledes ellers fra tittel/ingress/toppbilde.
