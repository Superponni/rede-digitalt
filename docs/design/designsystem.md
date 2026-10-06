# Designsystem — dagens tilstand

Utgangspunktet for redesignet høsten 2026 (forside, profil/fonter, feature-saker, regler for standardsaker). Beskriver det som er bygget og live per oktober 2026. **Oppdater dette dokumentet når nye valg er tatt** — det er det designerens og utviklerens Claude leser.

Kildemateriale: TOBBs profilmanual i `docs/brand/`, opprinnelige skisser i `docs/sketches/`, brief i `docs/brief.md` (seksjon 8 = anti-AI). Beslutninger for redesignet: [../designkontrakt.md](../designkontrakt.md).

---

## Farger

Definert i `src/app/globals.css` (`@theme`) og, per artikkel, i `src/components/article/theme.ts`.

| Token | Verdi | Bruk |
|---|---|---|
| `navy` | `#003865` | Primær, tekst, mørk flate |
| `mint` | `#F1F8F0` | Lys bakgrunn (`light`-modus) |
| `canvas` | `#D3E4F5` | Forsidens bakgrunn |
| `gold` | `#F6BE00` | Aksent (fremdriftsstripe, «Utvalgt») |
| `tobb-green` | `#74AA50` | Signaturfarge |
| `teal` | `#487A7B` | Signaturfarge |
| `magenta` | `#AA0061` | Signaturfarge |
| `purple` | `#6B3077` | Signaturfarge |
| `tobb-blue` | `#0047BB` | Signaturfarge |

Hver signaturfarge har fire trinn i `theme.ts`: `base`, `tint`, `pale` (bakgrunn i `tinted`-modus) og `text` (mørknet variant for tekst på lys flate — gull, grønn og teal er for lyse ellers).

Kjent gjeld: ~27 filer har `#003865` hardkodet i stedet for token. Rydd når fargene uansett skal gjennomgås.

## Fonter

| Rolle | Merkevaren sier | Brukes på nett i dag | Lastes fra |
|---|---|---|---|
| Display (logo, store titler) | Gastromond Regular | Gastromond | Adobe Fonts, pakke `ybg3phx` (`src/app/layout.tsx`) |
| Brødtekst | Depot New Light/Bold | **Roboto** (reserve — Depot New er ikke lagt inn) | Google Fonts via `next/font` (`src/app/fonts.ts`) |
| Overskrifter (h2/h3, metatekst) | Varela Round | Varela Round | Google Fonts via `next/font` |

Tokens: `--font-display`, `--font-body`, `--font-heading` (Tailwind: `font-display`, `font-body`, `font-heading`).

**Bytte font:**
- Google-font → endre i `src/app/fonts.ts`.
- Adobe-font → legg den i Adobe-pakken (eller ny pakke), oppdater `<link>` i `layout.tsx` og tokenet i `globals.css`.
- Egen lisensiert fontfil → `next/font/local` med filene i prosjektet. Sjekk at lisensen tillater nettbruk (webfont-lisens).
- Gastromond kan ikke bakes inn i bilder (lisens). Trengs logo/grafikk med ordmerket, bruk ekte eksporterte filer (logoen: `public/rede-logo.png`).

## Byggeklosser og maler

- **Standardsaker:** signaturfarge × bakgrunnsmodus × topp-oppsett. Se [../prosess/standard-saker.md](../prosess/standard-saker.md).
- **Feature-saker:** helskjerm-cover + seksjonsklosser (tekst+bilde, statementPanel, collage, galleri, parallax, illustrerte scener …). Se [../prosess/feature-saker.md](../prosess/feature-saker.md).
- **Forsiden:** `src/components/forside/DiscoverView.tsx` — topprad (3 saker med `frontpagePlacement: top`) + vanlige rader, på `canvas`-bakgrunn.
- **Felles bunn** på alle artikler: `ArticleOutro`.
- **Meny:** fullskjerm (`src/components/layout/FullscreenMenu.tsx`), temaer + utvalgt sak.

## Prinsipper vi har låst (endres bare bevisst)

**Anti-AI (fra briefen):** ingen gradienter som dekor, ingen glassmorphism, ingen pill-knapper (vi bruker `rounded-sm`), ingen symmetriske SaaS-grid, ingen generisk «tech»-estetikk. I stedet: asymmetri, variasjon, editorial layout, TOBBs faktiske farger, innholdsdrevet design.

**Fra arbeidet med sakene:**
- Trykket er fasit for tekst og bildevalg — designet på nett er fritt.
- Bilder vises i **naturlig format**, uten å kutte motiv. Toppbilder beskjæres aldri.
- Nesten aldri tekst oppå foto; emfase skjer med farget flate.
- Hver sak har én signaturfarge.
- Variasjon mellom saker er bevisst — samme kvalitet, ulik karakter.
- Alt skal kunne leses smooth nedover: ingen pinnede/scrubbede scener, ingen horisontal scroll, ingen klikk-gallerier som hovednavigasjon.
- Spenning i feature-saker = bilder, rytme og animerte illustrasjoner — ikke UI.
- Flat illustrasjonsstil, ingen skygger på illustrasjoner.
- Bevegelse er lett og rolig, og respekterer «redusert bevegelse».
- Én felles bunn for alle artikler, ikke filter-grid (forsiden er arkivet).
- Kontrast: dempet tekst minst 72 % på lys flate; sitater i full tekstfarge.

## Åpne spørsmål for redesignet

Fylles ut i [../designkontrakt.md](../designkontrakt.md). Blant annet: forsidens jobb, hvordan ny utgave signaliseres, nye fonter (og om Depot New faktisk skal på nett), hvilke spaker som skiller sakene, og nye regler for standardsaker.
