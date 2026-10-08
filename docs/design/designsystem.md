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

Byttet oktober 2026 etter Figma-malen «Mal (Rede digitalt) ny versjon». Malen er fasit for **hvilke fonter som brukes til hva** — ikke for layout eller pikselstørrelser (den er tegnet i 1920 px).

| Rolle | Font | Tailwind-klasse | Lastes fra |
|---|---|---|---|
| Logo (kun ordmerket «Rede») | Gastromond | `font-logo` | Adobe Fonts, pakke `ybg3phx` (`src/app/layout.tsx`) |
| Titler | Eczar Regular | `font-display` | Google Fonts via `next/font` (`src/app/fonts.ts`) |
| Mellomtitler i saker | Eczar Bold | `font-display font-bold` | Google Fonts via `next/font` |
| Ingress | Bitter Light | `font-serif font-light` | Google Fonts via `next/font` |
| Ingress oppå et bilde | Bitter Medium | `font-serif font-medium` | Google Fonts via `next/font` |
| Undertittel under sakstittel | Bitter Italic | `font-serif italic` | Google Fonts via `next/font` |
| Teasertekst (f.eks. lederkortet på forsiden) | Bitter Regular | `font-serif` | Google Fonts via `next/font` |
| Sitater og aksenter | Instrument Serif, rett (ikke kursiv) | `font-quote` | Google Fonts via `next/font` |
| Brødtekst | Roboto | `font-body` | Google Fonts via `next/font` |
| Bildetekst | Roboto, 14 px | (arver `font-body`) `text-sm` | Google Fonts via `next/font` |
| Etiketter (tagger, «Les saken», byline-linjer) | Roboto i versaler, sperret | `font-label uppercase tracking-[…]` | Google Fonts via `next/font` |

Tokens ligger i `src/app/globals.css` (`@theme`): `--font-logo`, `--font-display`, `--font-serif`, `--font-quote`, `--font-body`, `--font-label`.

**Regler:**
- Gastromond brukes **bare** til ordmerket «Rede». Alle titler er Eczar.
- Varela Round er fjernet fra hele siden. Klassen `font-heading` finnes ikke lenger — bruk `font-label` til etiketter og `font-display font-bold` til mellomtitler.
- Ingress settes i Bitter Light. **Ligger ingressen oppå et bilde, brukes Bitter Medium** (lesbarhet).
- Bildetekster står i Roboto, ikke Bitter (prøvd og forkastet).
- Depot New (merkevarens brødtekstfont, brukt i Figma-malen) er **ikke** lagt inn på nett. Roboto står inn for både brødtekst og etiketter. Skal Depot New inn senere, kreves Adobe Fonts-pakke eller weblisens.

### Størrelser

| Teksttype | Mobil | Desktop |
|---|---|---|
| Brødtekst | 18 px | 20 px |
| Ingress | 21 px | 24 px |
| Mellomtittel (h2) | 26 px | 32 px |
| Mellomtittel (h3) | 22 px | 26 px |
| Sitat i brødtekst | 30 px | 42 px |
| Etikett | 13 px | 14 px |
| Bildetekst | 14 px | 14 px |
| Forside: tittel på små kort | 18 px | 22 px |
| Forside: etikett på små kort | 11 px | 13 px |

Størrelsene er innført på **forsiden og standardsaker**. Feature-sakene (scrollytelling) har fått fontene, men har fortsatt sine gamle, håndsatte størrelser — de er ikke gått gjennom.

### Luft og linjebryting

- Avstand fra sakstittel til undertittel/ingress: 24 px på mobil, 32 px på desktop (`mt-6 md:mt-8`).
- **Ingen enslige ord på siste linje.** Én felles regel i `globals.css` (`@layer base`): løpende tekst (`p`, `li`, `blockquote`, `figcaption`) har `text-wrap: pretty`; titler, mellomtitler og sitater (`h1`–`h4`, `.font-display`, `.font-quote`) har `text-wrap: balance`. Eldre nettlesere ignorerer regelen og bryter som før.
- Et kort første ord i en tittel («Fra») kan fortsatt bli stående alene på første linje på smale kort. Å binde det til neste ord ble prøvd og forkastet, fordi lange ord da ble orddelt stygt.

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

Fylles ut i [../designkontrakt.md](../designkontrakt.md). Blant annet: forsidens jobb, hvordan ny utgave signaliseres, om Depot New skal på nett (fontene ellers er byttet, se «Fonter»), hvilke spaker som skiller sakene, og nye regler for standardsaker.
