# Plan: import som leser fra trykksaken

**Status:** ikke bygget. Bestilt av Asbjørn 2026-10-07. Bygges av Elise (med Claude).
**Krav (Asbjørn):** tekst og bilder hentes fra trykksaken, og importen bruker *nøyaktig* de bildene som står i trykket — ikke docx, ikke vilkårlige bilder fra råmappa.

I dag (`scripts/import-edition.ts`) leses teksten fra docx, Claude fordeler den i seksjoner, og inntil 8 bilder plukkes fra mappa. Bildetekster og fotokreditt kommer aldri med. Se [../prosess/trykk-avstemming.md](../prosess/trykk-avstemming.md) for hvor mye etterarbeid det ga i Rede 2 2026.

---

## Funn i materialet for Rede 3 2026 (sjekket 2026-10-07)

Drive: `REDE/Rede 2026/Rede 3 2026/`

- `Trykk Rede/Rede 3 2026 - Innmaten.pdf`: 48 **enkeltsider** (ikke oppslag, så formelen «trykkside / 2 + 1» fra Rede 2 gjelder **ikke** her). Har tekstlag (`pdftotext` virker). Bildene er innebygd, men beskåret til rammen, nedsamplet og CMYK. De kan brukes som **referanse**, ikke som originaler. Bilder over oppslag er delt i biter per side.
- `Designfil/Rede 3 2026 - 04.09.2026.indd`: InDesign-originalen. Bildelenkene peker hovedsakelig til `/Users/elisegumaer/Downloads/…`. **Originalbildene ligger altså på Elises maskin**, ikke nødvendigvis i Drive. XMP-historikken i .indd-fila (`stRef:lastURL`) inneholder også gamle lenker fra 2024/2025, så den kan ikke brukes som bildeliste.
- `Bildetekster Rede nr.3/bildetekster_rede3_26.docx`: egen fil med bildetekster.
- `Rede 3 2026 copy.xlsx` / `- sidespeil.pdf`: sidespeil (sak → sider).

## Kilden: to eksporter fra InDesign

Elise eksporterer fra den **endelige** InDesign-fila. Begge legges i utgavemappa i Drive, f.eks. `Rede 3 2026/Trykk Rede/Eksport til digitalt/`:

1. **Pakke** (Fil → Pakke …): `Links/`-mappa inneholder **nøyaktig** bildene som er brukt i trykket, i full oppløsning, med filnavnene som IDML-en refererer til. (Fonter trengs ikke.)
2. **IDML** (Fil → Eksporter → InDesign Markup (IDML)): en zip med XML. Den inneholder all tekst med avsnittsstiler og alle bilderammer med lenke og posisjon, per side.

**Trykk-PDF-en** (Innmaten) brukes til visuell kontroll og som reserve.

## Hvordan IDML leses

IDML er en zip-fil:
- `designmap.xml` lister oppslag (`Spreads/Spread_*.xml`) og tekster (`Stories/Story_*.xml`).
- **Spread**: `<Page Name="12">` (sidetall), `<TextFrame ParentStory="u123">` (tekstramme → story), `<Rectangle>` med `<Image>` → `<Link LinkResourceURI="file:…/bilde.jpg">` (bilde → filnavn). Rammenes posisjon står i `ItemTransform` + `PathPointArray` / `GeometricBounds`. Det brukes til å avgjøre hvilken side rammen står på, og hvilken bildetekst som står nærmest hvilket bilde.
- **Story**: `<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/…">` → `<CharacterStyleRange>` → `<Content>`. Avsnittsstilen sier hva teksten er (tittel, ingress, brødtekst, mellomtittel, sitat, bildetekst, byline/foto). Én brødtekst-story kan gå over flere rammer og sider (lenkede rammer).
- Bildets beskjæring i rammen (`Image` sin `ItemTransform` mot rammen) kan brukes til å sette fokuspunkt/beskjæring i Sanity. Dette er valgfritt.

**Første oppgave:** list avsnittsstilene som faktisk er brukt i Rede 3 (de heter det Elise har kalt dem), og lag en tabell stil → rolle. Den tabellen er manifest-data, ikke kode, så den kan justeres per utgave.

## Ønsket flyt

1. **Manifest** (`scripts/editions/rede-3-2026.json`): per sak `slug`, `type`, `tags` og **`pages: [fra, til]`** (fra sidespeilet). Dessuten sti til IDML og Links-mappe, og stil → rolle-tabellen. `docxFiles`/`imageDir` blir valgfrie reserver.
2. **Uttrekk per sak** fra IDML, innenfor sidene:
   - Tekst i rolle-rekkefølge: tittel, ingress, byline/fotokreditt, brødtekst med mellomtitler og sitater, faktabokser.
   - Bilder: hver bilderamme → filnavn → full fil fra `Links/`. Bevar rekkefølgen (side, så posisjon). Dedupliser når samme bilde er delt over to sider i et oppslag.
   - Bildetekster: kobles til bildet med nummer (`01.` …) eller nærmeste ramme. Se også `bildetekster_rede3_26.docx`.
   - Annonser og fordelssider (logoer, `.eps`/`.ai`) filtreres bort, for eksempel med sidespeilet eller filtype.
3. **Struktur i Sanity** (fortsatt **bare utkast**, slik det er i dag):
   - Standardsak: `body` som portable text (mellomtitler som `h3`, sitater som blockquote), toppbilde = største/første bilde, bildene i teksten med `caption` + `credit`.
   - Feature: Claude får **ferdig uttrukket tekst og bildeliste** og foreslår kun *oppdelingen* i seksjoner (`textWithImage`, `statementPanel`, `collage` …), uten å skrive om teksten. Se [../prosess/feature-saker.md](../prosess/feature-saker.md).
   - Toppbildet har ikke bildetekstfelt (bevisst). Den teksten utelates.
4. **Fullstendighetsrapport** per sak, skrevet til terminalen og helst en fil:
   - antall ord fra trykket vs. i Sanity (skal være like, bortsett fra bevisste utelatelser)
   - bilder i trykket vs. lastet opp, og bildetekster koblet / ikke koblet
   - alt som ikke kunne plasseres listes eksplisitt, og ingenting forsvinner stille
5. **Visuell kontroll** før publisering: kontaktark med bilde + koblet bildetekst ved siden av PDF-siden. Bildetekst-koblingen må **ses**, ikke antas.

## Reserve uten IDML

Hvis IDML mangler for en sak:
- Tekst: `pdftotext -layout -f <fra> -l <til>` fra Innmaten-PDF-en (enkeltsider: PDF-side = trykkside, sjekk mot sidetallet), eller send sidene til Claude som PDF-dokument for strukturert uttrekk.
- Bilder: `pdfimages -j` henter referansebildene fra sidene, og de matches mot råfilene med perceptual hash (bildene i PDF-en er beskåret, så sammenlign bare der det overlapper, eller la Claude vurdere på et kontaktark).

## Regler som gjelder uansett

- Skriv **bare utkast** (`drafts.<id>`). Det er allerede bygget, behold det.
- Les fra Drive, skriv aldri dit. Repoet skal aldri ligge i Drive.
- Last opp bilder i **full oppløsning**. Gjenbruk asset via `originalFilename` så det ikke blir duplikater.
- Ikke les mange bilder inn i Claude-samtalen. Bruk miniatyrer/kontaktark.
- Kjør `--dry-run` først. Den skal vise uttrekket (tekstlengde, bilder, bildetekster per sak) uten å skrive til Sanity.
- Oppdater [../prosess/ny-utgave.md](../prosess/ny-utgave.md) og denne fila når det er bygget.
