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
  validert mot `drafts`-perspektiv. Brukes som **både `serverToken` og
  `browserToken`** i `defineLive`. next-sanity sender browserToken til nettleseren
  KUN når draftMode er på (bak preview-secret) — aldri til offentlige besøkende, så
  Viewer-tokenet er trygt. Se «Live-redigering løst» under for hvorfor det kreves.
- **TODO før produksjon:** legg `SANITY_API_READ_TOKEN` i **Vercel** (alle miljøer).
  Uten den vil live draft-preview ikke virke i prod (kun published-events).
- `apiVersion` bumpet til `2025-02-19` (kreves for `drafts`-perspektiv) i `env.ts`.

## ✅ Alt verifisert i nettleser

1. ✅ **De 183 «Failed to decode stega»-feilene er borte.** Verifisert 2026-06-02:
   forsvarsrunden lastet i draft-modus (`?sanity-preview-perspective=drafts`, dvs.
   stega faktisk kodet inn) → **0 stega-feil** i dev-loggen. Hypotesen stemte:
   feilene tilhørte mellomtilstanden før stega-fiksene (rådata var bekreftet ren).
2. ✅ **Live-redigering** LØST & verifisert (se «Live-redigering løst»).
3. ✅ **Øye-knapp** verifisert: grønn «Åpne live forhåndsvisning» øverst i
   artikkel/leder, ett klikk → Presentation via `navigateIntent('edit', …,
   mode:'presentation')`. Skjules inne i Presentation (`usePresentationParams`).

**→ Branchen er funksjonelt ferdig.** Gjenstår kun: legg token + prod-domene-CORS
i Vercel (se Konfig), og merge til `main`.

## ✅ Live-redigering løst (browserToken)

**Symptom:** draft-edits i Presentation oppdaterte ikke preview-en live.

**Root-cause:** `<SanityLive/>` (next-sanity 12.2.2) refresher KUN på
`client.live.events({ includeDrafts: !!token })`. Med `browserToken: false` får
nettleseren bare published-events → ingen refresh på draft-mutasjon.
`PresentationComlink` håndterer kun **perspektiv-bytte**, ikke mutasjoner — og
prosjektet bruker rene server-komponenter + `sanityFetch` (ingen
`@sanity/react-loader`/`useQuery`-sti som ellers ville fått loader-oppdateringer).

**Fix:** `browserToken: token` i `src/sanity/lib/live.ts`. Sendt til nettleseren
kun i draftMode (next-sanity `live.js` linje 81: `isDraftModeEnabled ? browserToken
: void 0`). Krever `localhost:3100` (og prod-domenet) i Sanity CORS origins, fordi
nettleseren nå kobler til live-endpointet med credentials fra den origin-en.

**Note:** oppdateringen er «litt treg» — forventet, siden `router.refresh()` kjører
server-komponenten på nytt (refetch + re-render). Ikke optimalisert (ingen måledata).

## Research-funn (autoritativt, next-sanity v12)

- ⚠️ **KORRIGERT (var feil):** Det ble tidligere antatt at `browserToken` ikke
  trengs i Presentation fordi Comlink synker drafts. Det stemmer IKKE for
  next-sanity 12.2.2 med rene server-komponenter: Comlink (`PresentationComlink`)
  håndterer kun perspektiv-bytte, ikke mutasjoner. Draft-live krever `browserToken`
  (→ `includeDrafts:true` på `client.live.events`). Se «Live-redigering løst».
  Comlink-/loader-synk uten token gjelder kun hvis man bruker
  `@sanity/react-loader` (`useQuery`/`loadQuery`) i klient-komponenter — det gjør
  vi ikke her.
- `defineLive` + `sanityFetch` + `<SanityLive/>` (+ `browserToken`) gir
  live-i-Presentation uten `@sanity/react-loader`/`useQuery`.
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
