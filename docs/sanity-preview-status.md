# Sanity Preview — status og handoff

**Mål (kundeønske):** Forhåndsvisning av artikler før publisering. Den ønskede
opplevelsen (Webflow-aktig): et **øye-ikon per artikkel** som åpner dokumentet
i **Presentation** side-om-side — redigér i editoren *og* klikk i preview for å
hoppe til riktig felt, alt med **live oppdatering** uten å publisere.

**Branch:** `feat/sanity-preview` (IKKE merget til main ennå). Siste commit: `08e6a32`.

**Stack:** Next 16.2.3 (App Router, React 19, Turbopack), next-sanity 12.2.2,
sanity 5.20.0, @sanity/client 7.20.0. Studio embedded på `/studio` (same origin).

---

## ✅ Gjort og verifisert (build/typecheck/lint grønt)

- **`defineLive`** (Live Content API) i `src/sanity/lib/live.ts`, pakket inn så
  `sanityFetch<T>({query,params}): Promise<T>` er uendret → ingen av de 6
  kall-stedene er rørt.
- **`<SanityLive />`** + **`<VisualEditing />`** + **`<DisableDraftMode />`** ligger i
  `src/app/(site)/layout.tsx` (IKKE root-layout — ellers lekker draft-UI inn i
  Studio). `DisableDraftMode` vises kun frittstående (ikke i Presentation-iframe).
- **Draft-mode-ruter:** `src/app/api/draft-mode/{enable,disable}/route.ts`
  (`defineEnableDraftMode`). `enable` returnerer 401 på direkte kall (riktig).
- **`presentationTool`** i `sanity.config.ts` med `previewUrl.previewMode.enable`,
  `resolve.mainDocuments` (rute→doc) og `resolve.locations` (doc→URL, med
  `tone:'positive'` + `message`).
- **Øye-knapp øverst i dokumentet** `src/sanity/components/PreviewInput.tsx`
  («Åpne live forhåndsvisning», `EyeOpenIcon`). Ett klikk → åpner dokumentet i
  Presentation via `router.navigateIntent('edit', {id, type, mode:'presentation',
  preview})` — samme tverr-verktøy-mønster som Sanitys egen «Open in Structure»
  (`mode:'presentation'` = `EDIT_INTENT_MODE`). Robust uansett hvilket verktøys
  router man står i (intents løses globalt). Koblet inn via `components.input` på
  `article`- og `editorial`-schema; sti bygges av delt `src/sanity/lib/preview.ts`.
  - **Erstattet** den gamle to-stegs `resolve.locations`-banneren (klikk for å
    utvide → klikk lenke) som lugget. `resolve.locations` er fjernet fra config;
    Presentation rendrer kun banneret når en locations-resolver finnes
    (`hasLocationsResolver`), så uten den er den borte. `mainDocuments` beholdt
    (URL→doc, kreves av Presentation). Gamle `previewAction.tsx` slettet.
- **stega på** med filter som hopper over logikk-felter
  (`scrollyTheme`, `scrollyBackground`, `spotifyUrl`, `url`) — usynlige stega-tegn
  i oppslagsnøkler/farger/URLer bryter logikk (f.eks. `THEME_MAP[scrollyTheme]`).
- **`stegaClean()`** der tekst splittes/måles klient-side:
  `PullQuote.tsx` (ord-split) og `FullscreenParallax.tsx` (lengde-sjekk).
- **`getThemeConfig`** (`theme-config.ts`) faller alltid tilbake til `warm`.
- **`defined(slug.current)`-filter** i alle artikkel-spørringer (`queries.ts`):
  uferdige utkast (det finnes ett tomt scrollytelling-utkast, `6707cb14…`, uten
  slug/tittel) krasjer ikke lenger lenke-stedene. Offentlig side uendret (13
  publiserte beholdes).
- **`FullscreenMenu.tsx`**: `featured?.slug?.current`-guard.

## 🖥️ Lokalt dev

- **Rede kjører på fast port `3100`** (`next dev/start --port 3100` i package.json).
  Grunn: Keepr-prosjektet brukte `localhost:3000` og registrerte en **service
  worker** der. SW-er er bundet til origin (host+port), ikke prosjekt, så Keepr sin
  SW lekket sitt app-skall/tittel inn i Rede OG serverte stale cache → live-
  redigering oppdaterte ikke. Egen port = egen origin = ingen Keepr-baggage.
- **CORS:** `http://localhost:3100` må ligge i Sanity CORS origins (Manage → API).
- Rydder du opp gammel SW på `:3000`: DevTools → Application → Service Workers →
  Unregister + tøm Cache Storage.

## ⚙️ Konfig / hemmeligheter

- **`SANITY_API_READ_TOKEN`** (Viewer-rolle) ligger i `.env.local` (gitignorert),
  validert mot `drafts`-perspektiv. Brukes som `serverToken` (kun server-side).
  `browserToken` er bevisst **ikke** satt (`false`) — Presentation bruker Comlink,
  ingen token til nettleseren.
- **TODO før produksjon:** legg `SANITY_API_READ_TOKEN` i **Vercel** (alle miljøer).
- `apiVersion` bumpet til `2025-02-19` (kreves for `drafts`-perspektiv) i `env.ts`.

## ❗ Gjenstår å verifisere i nettleser (start her i ny chat)

1. **De 183 «Failed to decode stega»-feilene** dukket opp på forsvarsrunden FØR
   stega-fiksene. Reproduksjon viste at **rådataen er ren** (51 stega-strenger, 0
   dekodingsfeil, 0 «pure-invisible»), og det finnes **ingen annen display-tekst-
   splitting** enn PullQuote (nå renset) — og forsvarsrunden har ingen PullQuote.
   Hypotese: feilene hørte til mellomtilstanden og er borte nå. **Må bekreftes.**
   - **Slik verifiserer du:** hard refresh `localhost:3000/studio` → åpne
     forsvarsrunden i Presentation → les `[browser] Failed to decode stega` i
     dev-server-loggen (`npm run dev` stdout). Tell antall. Hvis fortsatt mange:
     loggstrengene viser kilden — sannsynlig neste mistenkt er hvordan
     `@sanity/visual-editing` skanner PortableText-tekstnoder, eller en
     RSC-serialisering som mangler zero-width-tegn.
2. **Live-redigering:** rediger et felt i Presentation-panelet → skal oppdatere
   preview live (via Comlink, uten publisering). Brukeren rapporterte at dette
   IKKE virket i forrige (stega-av) tilstand — sjekk på nytt med stega på.
3. **Øye-knapp:** bekreft at den grønne «Åpne live forhåndsvisning»-knappen
   øverst i artikkel/leder åpner Presentation med riktig dokument + preview-URL i
   ett klikk (nå via `navigateIntent('edit', …, mode:'presentation')` — det
   autoritative tverr-verktøy-mønsteret, ikke lenger `navigateUrl`).

## Research-funn (autoritativt, next-sanity v12)

- Inne i Presentation trengs **ikke** `browserToken` — Comlink/postMessage synker
  drafts. `browserToken` (kun Viewer/published) er bare for frittstående preview.
- `defineLive` + `sanityFetch` + `<SanityLive/>` er nok for live-i-Presentation;
  trenger IKKE `@sanity/react-loader`/`useQuery`.
- stega + tekst som splittes ⇒ rens med `stegaClean()` før splitting; vil man
  beholde overlay på et renset felt, bruk `createDataAttribute()` (begge eksportert
  fra `next-sanity`).
- Kilder: sanity.io/docs/visual-editing/* (live-preview-content-updates,
  visual-editing-client-stega, visual-editing-overlays, presentation-resolver-api).

## Filer endret/lagt til

```
sanity.config.ts                                  (presentationTool, document.actions)
src/sanity/lib/live.ts                            (defineLive + stega-filter)
src/sanity/env.ts                                 (token, apiVersion)
src/sanity/actions/previewAction.tsx              (NY — øye-ikon)
src/app/layout.tsx                                (tilbake til enkel/sync)
src/app/(site)/layout.tsx                         (SanityLive/VisualEditing/Disable)
src/app/api/draft-mode/enable/route.ts            (NY)
src/app/api/draft-mode/disable/route.ts           (NY)
src/components/DisableDraftMode.tsx               (NY)
src/components/layout/FullscreenMenu.tsx          (slug-guard)
src/components/scrollytelling/sections/PullQuote.tsx        (stegaClean)
src/components/scrollytelling/sections/FullscreenParallax.tsx (stegaClean)
src/components/scrollytelling/theme-config.ts     (warm-fallback)
src/sanity/lib/queries.ts                         (defined(slug.current))
```
