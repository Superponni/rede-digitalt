# Designsystem — dagens tilstand

Utgangspunktet for redesignet høsten 2026 (forside, profil/fonter, feature-saker, regler for standardsaker). Beskriver det som er bygget og live per oktober 2026. **Oppdater dette dokumentet når nye valg er tatt** — det er det designerens og utviklerens Claude leser.

Kildemateriale: TOBBs profilmanual i `docs/brand/`, opprinnelige skisser i `docs/sketches/`, brief i `docs/brief.md` (seksjon 8 = anti-AI). Beslutninger for redesignet: [../designkontrakt.md](../designkontrakt.md).

---

## Redesign etter malen (gren `feat/ny-mal`, ikke publisert)

Påbegynt 13. oktober 2026 etter designpakken «Rede.no website design system» (laget av Elise i Claude Design). Pakken ligger i Drive: `TOBB/REDE/Rede digitalt - ny mal design package/`. Asbjørn har godkjent malen.

**Alt i denne seksjonen gjelder grenen `feat/ny-mal`, ikke rede.no.** Resten av dokumentet beskriver fortsatt det som er live. Når grenen publiseres, skal seksjonene under («Farger», «Fonter», «Prinsipper») skrives om etter dette.

### Elises valg — der vi avviker fra malen

| Tema | Malen sier | Vi gjør |
|---|---|---|
| Brødtekst og etiketter | Depot New | **Roboto** (Depot New mangler weblisens og Medium-vekt) |
| Logo | «Rede» i Eczar Bold | **Gastromond** (som før) |
| Mellomtittel | Depot New Bold 24 | **Eczar Bold 26/32** (som forrige uke) |
| Sitat | Instrument Serif 32 | **Instrument Serif 30/42** (som forrige uke), uten strek til venstre |
| Ingress | Bitter 600, 22 px | **Bitter Medium (500), 21/24 px, magenta** |
| Fargeverdier | Avrundede varianter | **TOBBs profilverdier**, pluss det nye under |
| Aksentfarge per sak | Ingress/byline i sakens farge | **Alltid magenta** på standardsaker og forsiden |
| Tagger | Kategoriens farge | **Alltid gråblå** |
| «Maks to aksentfarger per side» | Regel | **Gjelder ikke** |
| Bilder i saker | Faste formater (4:3, 21:9, 4:5) | **Originalformat** så lenge det passer i griden |
| Minstestørrelse på bilder | Avvises | Skal gi **advarsel**, ikke avvises (ikke bygget) |

### Farger

- Bakgrunn overalt: krem `#FEFAE8`. (`mint` og `canvas` peker nå på samme kremfarge.)
- Tekst: marineblå `#003865`. Ingress og byline: magenta `#AA0061`.
- Nye fra malen: mørk fiolett `#3E2A57`, lyseblå `#49C5FA`.
- Teal er profilens `#487A7B`. Malens `#028C7B` er friskere — **ikke avgjort** om vi bytter. Teal-kortene er derfor grålige.
- Lyse toner = fargen over hvitt i 10/20/30 % (regnes ut i `src/lib/palette.ts`).
- Standardsaker har ikke lenger egen bakgrunnsfarge. `colorMode` brukes bare av feature-sakene. Signaturfargen (`accentColor`) farger bare faktaboksene i høyrefeltet.

### Typografi (forside og standardsaker)

| Teksttype | Font | Mobil | Desktop |
|---|---|---|---|
| Sakstittel / stor forsidesak | Eczar Regular | 40 px | 64 px |
| Korttittel | Eczar Regular | 26 px | 32 px |
| Tittel på tekstkort (hårstrek) | Eczar Regular | 24 px | 28 px |
| Ingress | Bitter Medium, magenta | 21 px | 24 px |
| Ingress på tekstkort (hårstrek) | Bitter Medium, magenta | 16 px | 16 px |
| Byline | Roboto Medium, magenta, sperret 0,04em | 13 px | 13 px |
| Brødtekst | Roboto | 18 px | 20 px |
| Etikett (tagg, «Les saken», temavalg) | Roboto Medium, versaler, sperret 0,08em | 12 px | 12 px |
| Bildetekst | Roboto | 14 px | 14 px |

Ingress var Bitter Light etter fontbyttet 8. okt. Den ble byttet til **Medium** 13. okt. fordi Light ble for tynn i magenta på krem. Feature-sakene har fortsatt Light.

### Former, ramme og luft

- **Pilleformer** på tagger, temavalg og knapper (opphever «ingen pill-knapper»). Kort og bilder har firkantede hjørner. Ingen skygger.
- Ramme: innhold maks 1280 px + marg (80 desktop, 48 nettbrett, 20 mobil) — klassen `.wrap`. 12 kolonner, 24 px mellomrom.
- Brytpunkter: `tab:` fra 720 px, `desk:` fra 1200 px.
- Luft i brødtekst: avsnitt→avsnitt 16, tekst→mellomtittel 48, mellomtittel→tekst 16, tekst→bilde/sitat/boks 48, bilde→bildetekst 12.
- Fokus (tastatur): 2 px magenta ramme.

### Kort (`src/components/ui/Cards.tsx`)

- **Fem faste kortpaletter** fra malen — bakgrunn, tittelfarge og pil hører sammen og blandes aldri:

  | Palett | Bakgrunn | Tittel |
  |---|---|---|
  | Lilla | lys lilla | mørk fiolett |
  | Lyseblå | lys lyseblå | marineblå |
  | Teal | lys teal | blå |
  | Gul | lys gul | magenta |
  | Mørk marineblå | marineblå | hvit |

- **Fargen trekkes automatisk, men er fast per sak** (regnes ut fra sakens id). To kort ved siden av eller over hverandre får aldri samme palett, og det er maks ett mørkt kort per rad.
- **Kan overstyres** i Studio med feltet «Kortfarge (valgfri)» på artikkelen. Da viker nabokortene. Brukt på «Vil du bruke forkjøpsretten?» (mørk marineblå, fordi illustrasjonen har mørkeblå bakgrunn).
- **Bildekort:** bildet beskjæres til 4:3 og går helt ut i kantene. «Les saken» ligger i en **hvit pille** på bildet (malens hvite tekst rett på bildet forsvant på lyse bilder).
- **Beskjæring:** følger fokuspunktet satt i Studio. Mangler fokuspunkt, sikter utsnittet mot øvre tredjedel (der ansikter som regel er). De fleste bilder mangler fokuspunkt — sett det i Studio når et kort kuttes uheldig.
- **Tekstkort uten flate** («hårstrek-kort»): tre i bredden, delt av hårstreker. Brukes under forsidesaken og i «Les også».
- **Ingress på forsiden og kort er kortet ned:** hele setninger fra starten, innenfor ca. 160 tegn (stor sak) / 110 tegn (kort). Første setning er alltid med. Inne i saken vises hele ingressen. (`shortTeaser` i `src/lib/typography.ts`.)
- **Hover:** flaten blir ett trinn dypere, tittelen understrekes, pilen glir, bildet zoomer svakt. Ingen løft.
- **Alle saker skal ha tema**, ellers mangler pillen på kortet.

### Forsiden (`src/components/forside/Forside.tsx`)

Elises plan, 13. okt.:
1. **Stor sak øverst** — velges for hånd i Studio under «Forsiden» → «Forsidesak». Tomt felt: nyeste sak merket «toppraden», ellers nyeste sak.
2. **Tre tekstkort** — lederen + de to nyeste sakene. Ved lik dato (hele utgaven har samme dato) avgjør trykkrekkefølgen.
3. **Fargede kort** — resten av gjeldende utgave i trykkrekkefølge (lista «Sakenes rekkefølge» på utgaven i Studio; ikke fylt ut ennå, så dato brukes). Podkastkortet viser nyeste episode og lenker til Spotify.
4. **«Flere saker»** — eldre saker, inntil 9, i en rekkefølge som byttes hver uke.

En sak vises bare ett sted. Valgfritt felt «Stor sak nr. 2» gir en stor sak til midt på siden. Går ikke antall kort opp i tre, blir de siste kortene bredere. Temalinjen («Alle» + temaene som piller) står øverst.

### Standardsak (`StandardArticle.tsx`, `PortableTextRenderer.tsx`)

- **To topper**, valgt ut fra «Topp-oppsett» og bildets retning:
  - *Bilde ved siden:* tekst i kolonne 1–5, bilde i kolonne 7–12. Brukes for «side», «tittel først» og alle stående toppbilder.
  - *Bilde i full bredde:* bildet først, så midtstilt tekst. Brukes for «bilde øverst» med liggende bilde. Bildet vises i originalformat, men aldri høyere enn ca. 70 % av skjermen.
  - «Ingen bilde» og «rundt portrett av kilde» har ingen plass i malen ennå og har midtstilt topp som før — **ikke avgjort**.
- På mobil kommer teksten alltid først, så bildet.
- **Brødtekst** i kolonne 1–7. **Faktabokser og stående bilder** står i høyrefeltet (kolonne 9–12) ved siden av teksten som følger etter dem; på mobil og nettbrett står de i tekstflyten. De følger ikke med ved scrolling.
- Tema-pillene øverst i saken lenker til temasiden.

### Felles bunn (`ArticleOutro.tsx`)

Deling → «Se alle saker om [tema]» → tre fargede kort → «Les også» (tre tekstkort). Står alltid på krem, også etter feature-saker.

### Mobil og nettbrett (sett gjennom 13. okt.)

- Toppen av saken er **venstrestilt** på mobil og nettbrett; midtstilling gjelder bare desktop (og rundt kildeportrett).
- Nettbrett har to kort i bredden. Blir ett kort til overs, fyller det hele raden.
- Kortfargene trekkes så to like aldri står over hverandre — heller ikke på mobil (ett kort i bredden) og nettbrett (to).
- Ingress på bildekort får inntil tre linjer, på tekstkort (hårstrek) inntil fem.

### Nye felt i Studio (vises på rede.no/studio først når grenen er publisert)

- «Forsiden» (eget dokument): «Forsidesak» og «Stor sak nr. 2».
- Utgave: «Sakenes rekkefølge (som på trykk)».
- Artikkel: «Kortfarge (valgfri)».

### Innhold lagret som utkast 13. okt. (må publiseres i Studio)

- Tema lagt til: Jarlerunden (sport, nabolag), Norgespris (økonomi, bolig), Fra «pensjonistsport» til ungdomstrend (sport, fritid), strømforsikring-saken (økonomi).
- Fokuspunkt: kortbildet til «Ung stemme i Trondheim», hovedbildet til «Vil du bruke forkjøpsretten?».
- Kortfarge mørk marineblå: «Vil du bruke forkjøpsretten?».

En «Annonse»-pille for annonseinnhold ble laget og fjernet igjen samme dag — Elise vil ikke ha den. Strømforsikring-saken har fortsatt ingressen «Annonseinnhold».

### Ikke gjort / ikke avgjort

- Feature-sakene (bare bunnen er ny) og reportasjemalen. Skal dagens seks feature-saker beholdes som de er?
- Avstemning, tallboks og kart i høyrefeltet. Sperrer i Studio (tegntellere, bildeadvarsel).
- Lydspillerens utseende, menyen, og sidene Om, Medlemstilbud og Personvern (har bare krem bakgrunn og ny topp/bunn).
- Illustrasjoner på tekstkort (malen viser transparente PNG-er; finnes nesten ikke).
- Samleside «Alle saker» når det blir flere enn 9 eldre saker.
- Teal-verdien. Sitat på mobil (malen har midtstilt i lilla bånd; vi har venstrestilt).

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
