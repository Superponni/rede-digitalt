# QA-rapport — Rede Digitalt

**Dato:** 12. juni 2026
**Omfang:** Full gjennomgang av hele løsningen — frontend-kode, scrollytelling/animasjon, Sanity/backend, sikkerhet, tilgjengelighet (WCAG 2.1 AA), ytelse, SEO/AEO, design-konsistens og brukeropplevelse. Seks spesialiserte gjennomganger + TypeScript- og lint-sjekk. **Ingen filer er endret.**

**Helhetsbilde:** Kodebasen er i god stand — ryddig, godt kommentert (på norsk), uten TypeScript-feil, uten lekkede tokens, med korrekt sikret preview-løsning og uvanlig god disiplin på animasjonsopprydding og «redusert bevegelse». Funnene under er konsentrert om ett sikkerhetshull (QA-ruten), tilgjengelighet (meny, kontrast, tastatur), manglende feilsider, og en del død kode / duplisering som bør ryddes.

---

## PRIORITERING — anbefalt rekkefølge

### P1 — Gjør umiddelbart (sikkerhet + ting brukere merker hver dag)
1. **Slett `/qa-forkjopsrett` og `/qa-forkjopsrett/koe`** — eksponerer upublisert utkast offentlig (KRITISK, funn S1)
2. **Fiks FullscreenMenu-tilgjengelighet** — usynlige lenker i tab-rekkefølge på ALLE sider (KRITISK, funn T1)
3. **Fiks kontrastbruddene i temasystemet** — gull/grønn-kombinasjoner er uleselige (KRITISK, funn T2)
4. **Lag norsk 404- og feilside** — i dag engelsk standardside (HØY, funn F1)
5. **Fiks tilbake-knappen** — brukeren kastes til toppen av forsiden (HØY, funn F2)

### P2 — Denne/neste uke (høy verdi, avgrensede fikser)
6. Stega-hull som knekker quiz/illustrasjoner i preview (funn SC1)
7. `/medlemstilbud` er foreldreløs — meny, sitemap, llms.txt (funn U1)
8. Ytelses-trioen: `priority` på forsidens toppbilde, GIF→video, statisk bygging av artikkelsider (funn Y1–Y3)
9. Tastaturstøtte: ansiennitet-slider og lydspiller-spoling (funn T3, T4)
10. Heading-struktur, skip-lenke og `<main>` (funn T5)
11. Autoplay-videoer: pauseknapp + respekter redusert bevegelse, også i Lenis (funn T6, T7)
12. Anti-AI-regelbrudd: pill-buttons og Tailwind-standardfarger i quiz (funn D1, D2)

### P3 — Opprydding (kan tas som én eller to samlede commits)
13. Død kode: MagasinView-grenen + 4 ubrukte komponenter + ubrukte spørringer/felt
14. Duplisering: kort-fragment i GROQ, PortableText-oppsett, coverSrc-logikk, fargekonstanter
15. Hardkodet innhold → Sanity (footer, meny, sosiale lenker)
16. Resten av MIDDELS-funnene under

### P4 — Småplukk (LAV-funn, tas når man er innom filene likevel)

---

## SIKKERHET OG BACKEND (Sanity, datalag, scripts)

### S1. KRITISK — QA-rute lekker upublisert innhold offentlig
`src/app/qa-forkjopsrett/page.tsx` (+ `/koe`-undersiden)
Filen sier selv «MIDLERTIDIG QA-RUTE — slettes før deploy», men ligger på main og er deployet. Den henter forkjøpsrett-saken med lese-token og `perspective: 'drafts'` og viser **upublisert utkast til hvem som helst** på en gjettbar URL — utenom hele den sikrede preview-løsningen. Den har heller ingen noindex og er ikke blokkert i robots, så den blir synlig for Google den dagen indeksering skrus på.
**Fiks:** Slett begge rutene (Presentation-preview dekker behovet), eller minimum legg dem bak draft-mode-sjekk.

### S2. MIDDELS — Samme token brukes som server- og browser-token
`src/sanity/env.ts:10` + `src/sanity/lib/live.ts`
Oppsettet er riktig brukt, men ingenting håndhever at tokenet faktisk er Viewer-rolle. Limes et skrive-token inn i `SANITY_API_READ_TOKEN` en dag, sendes det til nettleseren i preview.
**Fiks:** Verifiser i Sanity Manage at tokenet er Viewer + noter kravet i `.env.example`.

### S3. MIDDELS — `videoPost`-dokumenttypen er død i frontend
`src/sanity/schemas/documents/videoPost.ts` + `structure.ts:29-32`
Redaktører kan opprette «Videoer» i Studio, men ingenting henter dem — innholdet vises aldri.
**Fiks:** Fjern fra Studio-menyen til typen faktisk konsumeres.

### S4. MIDDELS — Død og duplisert GROQ
`src/sanity/lib/queries.ts` — `EDITION_QUERY` (linje 61-79) er ubrukt; kort-projeksjonen (`_id, title, slug, teaser, heroImage, tags…`) er duplisert ~6 steder.
**Fiks:** Slett `EDITION_QUERY`; trekk ut et `CARD_FRAGMENT` (samme mønster som `SEO_FRAGMENT`).

### S5. MIDDELS — scripts/-mappen: ~25 av ~35 filer er ferdigkjørte engangsjobber
Aktive verktøy: `import-edition.ts`, `lib/seo-prompt.ts`, `editions/`, `export-article-text.mjs`, `audit-image-resolution.ts`. Resten er fullførte migreringer (ingen tokens, ingen ubeskyttede sletteoperasjoner — sjekket).
**Fiks:** Flytt til `scripts/arkiv/` eller slett (git husker).

### S6. LAV
- `.env.example` mangler `SANITY_API_WRITE_TOKEN` og `ANTHROPIC_API_KEY` (trengs for scripts).
- `heroImage.alt` og `publishedAt` har ingen validering i artikkel-skjemaet (alt-tekst → tilgjengelighet; manglende dato → uforutsigbar sortering).
- `env.ts` bruker `!`-assertions → kryptisk feil hvis variabel mangler.
- «Tags» i Studio-menyen er engelsk; frontend kaller det «tema». Bytt til «Temaer».
- Ingen sikkerhetsheadere i `next.config.ts` (X-Frame-Options/Referrer-Policy) — billig å legge til.

### Verifisert OK (ingen funn)
Ingen hardkodede tokens noe sted; `.env*` gitignored; draft mode bruker signert validering (`defineEnableDraftMode`); `useCdn` riktig per miljø; Live Content API gir sanntidsoppdatering av publisert innhold uten webhook; GROQ har `defined(slug.current)`-guards; skjemaene har gode norske redaktørbeskrivelser; alle seksjonstyper har matchende komponenter; import-scriptet er forbilledlig (manifest, dry-run, idempotent).

---

## FRONTEND-KODE OG ROBUSTHET

### F1. HØY — Mangler `not-found.tsx`, `error.tsx` og `global-error.tsx`
Feil slug gir Nexts **engelske** standard-404 uten meny eller vei tilbake; er Sanity nede, kaster meny-hentingen i `(site)/layout.tsx` og hele siten viser en naken engelsk feilside.
**Fiks:** Norsk 404 + feilside med Rede-design og lenke hjem.

### F2. HØY — Tilbake-knappen mister scrollposisjon
`src/components/SmoothScroll.tsx:45` — `lenis.scrollTo(0, { immediate: true })` kjører ved ALL navigering, også tilbake/frem. Bruker som leser en sak og trykker tilbake havner øverst på forsiden.
**Fiks:** Hopp over reset ved popstate/tilbake-navigering.

### F3. HØY/MIDDELS — Død MagasinView-gren bundles til alle besøkende
`src/components/forside/ForsideController.tsx:51` — `mode` er hardlåst til `'discover'`, men hele MagasinView-treet (FeaturedHero, IntroSection, HorizontalScroll, PodcastSection m.fl.) importeres statisk, sendes til nettleseren og rendres aldri. I tillegg helt ubrukte: `ui/Tag.tsx`, `ui/ProgressBar.tsx`, `ui/ArticleCard.tsx`, `forside/PodcastSection.tsx`.
**Fiks:** Fjern grenen og de ubrukte filene (git har historikken), eller `next/dynamic` bak en ekte toggle.

### F4. MIDDELS — Typedefinisjon stemmer ikke med spørringen
`src/app/(site)/artikler/[slug]/page.tsx:27-30` — `ArticleData` deklarerer `portraitName`/`portraitRole`/`expertPortrait` som ikke finnes i spørringen, mens `experts[]` (som faktisk brukes) mangler i typen. TypeScript verifiserer i praksis ingenting her.
**Fiks:** La typen speile `ARTICLE_BY_SLUG_QUERY`.

### F5. MIDDELS — ShareButtons kan gi hydration-mismatch
`src/components/ui/ShareButtons.tsx:18-30` — `navigator.share`-sjekk under render: server sier nei, klient kan si ja → React-advarsel og mulig blink.
**Fiks:** Flytt detekteringen til `useEffect` + state.

### F6. MIDDELS — Lydspiller stoler blindt på at avspilling lykkes
`src/components/article/AudioPlayer.tsx:44-54` — `audio.play()`-promiset ignoreres; feiler avspillingen viser UI «Spiller av» i stillhet. `duration` kan også bli `NaN` («NaN:NaN» i tidsvisning). Samme mønster i scrolly-`HeroSection`-lydknappen.
**Fiks:** Sett state fra play/pause-events eller `.then/.catch`; guard med `Number.isFinite`.

### F7. MIDDELS — `DisableDraftMode.tsx:12` — setState direkte i effect (lint-ERROR)
Gir unødig dobbel render. Fiks med `useSyncExternalStore` eller lazy init.

### F8. LAV
- `ExpertPortrait.tsx:43-45`: dupliserte SVG-id-er ved flere portretter på samme side — bruk `useId()`.
- `StoriesGrid.tsx:79-83`: tittel-prefiks-stripping kan gi tom tittel — fall tilbake til original.
- `om/page.tsx:224`: alle utgave-kort lenker til forsiden (placeholder — greit med én utgave, villedende med flere).
- `om/page.tsx:57-58`: `DEFAULT_MIN_SIDE_URL` er en ~2000 tegn lang engangs innloggings-URL med utløpende parametre — vil før eller siden gi feilside. Bytt til ren inngangs-URL.
- Spotify-embed-transformasjonen (`DiscoverView.tsx:250`) feiler stille på `intl-no/`-URL-er — lag delt `spotifyEmbedUrl()`-hjelper.
- `om/page.tsx:88-97`: hele Om-siden 404-er hvis aboutPage-dokumentet slettes i Sanity — render fallback i stedet.
- Spredt `any`-bruk rundt PortableText — innfør delte typer basert på `PortableTextBlock`.

### Verifisert OK
Riktig server/klient-splitt; konsekvent opprydding av listeners/GSAP/timeouts; god fallback-håndtering ved manglende Sanity-data (tomtilstander på tema- og medlemstilbud-sidene, ekspertportrett-fallback på forsiden); ingen hydration-feil utover F5.

---

## SCROLLYTELLING OG ANIMASJON

### SC1. HØY — Stega-hull knekker interaktivitet og illustrasjoner i preview
`src/sanity/lib/live.ts:12-23` — `STEGA_SKIP_FIELDS` mangler logikk-felter:
- `InteractiveQuiz.tsx:40`: `data.style` sammenlignes rått → **quiz/poll blir helt død i Presentation-preview**.
- Sanity-styrte `icon`/`secondaryIcon`-slugs → ødelagt URL → **illustrasjoner usynlige i preview**.
- `GifKort.tsx:51`: `data.src` stega-kodes → ødelagt GIF i preview.
**Fiks:** Legg `icon`, `secondaryIcon`, `style`, `src` i `STEGA_SKIP_FIELDS` (samme felle er allerede fikset for TextWithImage/Gallery/StatementPanel).

### SC2. MIDDELS — iOS-detaljer
- Mangler `ScrollTrigger.config({ ignoreMobileResize: true })` → adresselinje-kollaps gir hopp i pinnede seksjoner. Legg i `gsap-config.ts`.
- `HeroSection.tsx:127` bruker `h-screen` (tittel kan ligge bak nettleser-UI på iOS); `FullscreenParallax` og `StatementPanel` samme. `IllustratedCover` gjør det riktig med `100svh`. Bruk `svh` konsekvent.

### SC3. MIDDELS — VideoSection autostarter uansett innstilling
`VideoSection.tsx:39-55` — IntersectionObserver kaller `play()` ved 50 % synlighet selv når autoplay er av (video med lyd!) → blokkeres av nettleser, uhåndtert promise; `loop` alltid på; `preload` mangler (default laster for mye).
**Fiks:** IO-play kun ved `data.autoplay`, `.catch()` på play, `preload="metadata"`.

### SC4. MIDDELS — Collage-lightbox låser ikke scroll
`Collage.tsx:159-194` — siden bak fortsetter å scrolle (Lenis) mens lightboxen er åpen; fokus flyttes heller ikke inn.
**Fiks:** `lenis.stop()`/scroll-lås + fokus til lukkeknappen mens åpen.

### SC5. MIDDELS — Døde tema-/skjemafelt (redaktøren velger ting som ikke gjør noe)
- `theme-config.ts:15-19`: `heroTitleEase`, `heroTitleY`, `parallaxScrubEase`, `galleryEntrance` brukes aldri.
- `heroSection.ts:36`: `titlePosition` leses aldri.
- `pullQuote.ts:22` og `factBox.ts:19`: `style`-feltene brukes aldri i komponentene.
**Fiks:** Fjern feltene eller implementer dem.

### SC6. MIDDELS — Duplisering på tvers av de 24 seksjonene
PortableText-oppsettet duplisert i 4+ komponenter (StickyPortrait har det to ganger); «fade inn med stagger»-effekten nesten identisk i 10+ seksjoner; «Foto:»-kreditering kopiert 7 steder.
**Fiks:** `scrollyPortableTextComponents()`, `useScrollyReveal()`-hook og `<PhotoCredit>`.

### SC7. LAV
- `AssembledIllustration.tsx:88-112`: tweens drepes ikke ved unmount (ufarlig, men uren).
- `InlineSvg`: permanent feilet ikon-lasting → usynlig boks uten feilmelding for alltid. Fall tilbake til statisk bilde.
- `IllustratedScene.tsx:87-104`: nestet `mm.add` kan gi dupliserte tweens i ekstrem kant-case — kombiner betingelsene i én streng (slik StickyPortrait gjør).
- `ScrollytellingRenderer.tsx:127`: ukjent seksjonstype droppes stille — `console.warn` i dev.
- `ScrollyColorContext.tsx:65`: default-kontekst `('navy','dark')` vs. funksjonens `('navy','light')` — inkonsistent.
- `Gallery.tsx:191`: horisontal karusell fanges av Lenis ved hjul/trackpad — `data-lenis-prevent`.
- `InteractiveQuiz` poll-barer animerer `width` i stedet for `scaleX` (minimal konsekvens).
- `AnsiennitetSlider.tsx:83`: ternary med to identiske grener; `AssembledIllustration` har død `start`-prop.

### Verifisert OK
Plugin-registrering sentralisert; `mm.revert()`/`kill()`/IO-disconnect overalt — ingen lekkasjer; Lenis↔GSAP koblet etter offisiell oppskrift; ingen scroll-frame-drevne React-state-oppdateringer; gjennomtenkt `ScrollTrigger.refresh`-strategi ved bilde-/fontlasting; alle 24 seksjoner korrekt registrert i både renderer og skjema.

---

## TILGJENGELIGHET (WCAG 2.1 AA)

### T1. KRITISK — FullscreenMenu er ikke en tilgjengelig dialog
`FullscreenMenu.tsx:44-60` + `Header.tsx`
Lukket meny skjules kun med `opacity-0` + `pointer-events-none` — ~10 **usynlige lenker ligger i tab-rekkefølgen på hver eneste side**, og kan aktiveres i blinde. Åpen meny: ingen fokusfelle, ingen fokusflytting, ingen Escape-lukking, ingen `role="dialog"`/`aria-modal`; hamburgeren mangler `aria-expanded`/`aria-controls`.
**Fiks:** `inert`/`visibility: hidden` når lukket; dialog-semantikk + Escape + fokus inn/ut når åpen. Bygg fokusfelle-mønsteret én gang og gjenbruk i Collage-lightboxen.

### T2. KRITISK — Kontrastbrudd i temasystemet
`article/theme.ts` + `scrollytelling/theme-config.ts` (beregnede verdier):
- Gull `#F6BE00` som tekst på hvit/mint: **1,6–1,8:1** (krav 4,5:1) — brukes på ingress/underoverskrifter.
- Hvit tekst på gull-flate (filled-modus): **1,7:1**; tint-tittel på gull: **1,3:1**. Hvit på grønn: **2,4–2,8:1**.
- `muted`-tekst (0.55 alpha): 3,3:1 på mint, 2–3:1 på mørke flater — datolinjer, bildetekster, «Foto:».
- Footer `white/40` på navy: **3,2:1**; `white/30`: 2,4:1. Meny-«Temaer»-label `white/45`: 3,6:1.
- Teal-base på mint: 4,47:1 — hårfint under kravet for brødtekst.
**Fiks (systemnivå, ikke per komponent):** Blokker gull/grønn som tekstfarge på lyse flater og som bakgrunn for hvit tekst i `getArticleTheme`; hev muted-alpha til ≥0,72 (scrolly gjør dette alt); hev footer/label-alphaer.

### T3. KRITISK — AnsiennitetSlider kan ikke betjenes med tastatur
`AnsiennitetSlider.tsx:171-214` — drag-håndtaket har `role="slider"` + `aria-valuenow` (bra), men ingen piltast-håndtering.
**Fiks:** keydown med piltaster/Home/End.

### T4. HØY — Lydspiller-spoling kun med mus
`AudioPlayer.tsx:111-128` + `AudioSection.tsx:118-135` — spolefeltet er en klikkbar div uten slider-rolle/tastatur.
**Fiks:** stylet `<input type="range">`.

### T5. HØY — Struktur: h1, skip-lenke, `<main>`
- Forsiden har **ingen h1** (hierarkiet starter på h3 i kortene; podcast/video-seksjonene bruker h4).
- Ingen skip-lenke («Hopp til innhold») noe sted.
- `(site)/layout.tsx` rendrer children uten `<main>`; forsiden har main i DiscoverView, artikkelsider har ingen — inkonsistent. `MedlemstilbudView.tsx:110` har dobbel `<main>` (ugyldig).
- Scrolly-saker kan hoppe h1→h3 avhengig av seksjonsrekkefølge; menyens h3-er forstyrrer alle sider.
**Fiks:** `<main>` i layout + skip-lenke i Header + ryddet heading-nivåer.

### T6. HØY — Bevegelse uten pause-mulighet
- Autospillende, loopende videoer (FeaturedHero, DiscoverView, VideoSection) uten pauseknapp og uten reduced-motion-respekt (WCAG 2.2.2).
- Evig loopende GIF-er (GifKort, KoeLapp) — reduced-motion stopper bare inn-toningen, ikke GIF-en. `winning.gif` har engelsk alt-tekst.
**Fiks:** Pauseknapp / ikke autostart ved redusert bevegelse; statisk stillbilde for GIF-er.

### T7. HØY — Lenis respekterer ikke `prefers-reduced-motion`
`SmoothScroll.tsx:13-38` — GSAP-laget er forbilledlig vaktet, men selve smooth-scrollingen kjører for alle. Også `scroll-behavior: smooth` i globals.css mangler media-vakt.
**Fiks:** Hopp over Lenis-init (og pakk CSS-en i media query) ved `reduce`.

### T8. HØY — Video uten tekstings-mulighet
`VideoSection` — verken iframe (mangler også `title`) eller native video har captions-felt/`<track>`. Sanity-skjemaet mangler feltet.
**Fiks:** VTT-felt i skjema + `<track kind="captions">`; `aria-hidden` på dekorative autoplay-videoer.

### T9. MIDDELS
- InteractiveQuiz: resultat annonseres ikke (`aria-live` mangler), ingen gruppe-semantikk, svak fokusindikator.
- Temasidens tag-filtre: aktiv tag vises kun med farge — `aria-current` + visuell markør.
- MedlemstilbudView: har `aria-pressed` på noen filtre (bra), men mangler liste-semantikk, `aria-expanded` på «Vis vilkår» og `aria-live` på treff-teller.
- AnsiennitetSjekk: hvit boks bruker temafarger → latent usynlig tekst i mørke moduser; CTA-tekstfarge må velges ut fra aksentens lyshet.
- Eksterne lenker (`target="_blank"`) varsler ikke «åpnes i ny fane».
- Gallery-karusellen kan ikke scrolles med tastatur — `tabIndex={0}` + region-rolle.
- Scrolly-ProgressBar: ren dekor — `aria-hidden="true"`.
- `lang="no"` → bør være `lang="nb"` (presist bokmål).

### T10. LAV
- ExpertPortrait: navn/rolle ligger i `aria-hidden` SVG og finnes ikke for skjermleser — legg sr-only-tekst.
- ShareButtons «Lenke kopiert!» mangler `role="status"`.
- Hamburger mangler `aria-controls`. AudioPlayer-tidsvisning på 2–2,4:1 kontrast.
- Alt-tekst-fallback er tittelen → dobbel opplesing ved lenkede kort; vurder tom alt.

### Verifisert OK
Gjennomført reduced-motion-vakt i nesten alle GSAP-animasjoner; norske aria-labels der de finnes; `:focus-visible`-stil definert globalt; riktig `aria-hidden` på dekorative SVG-er; Collage-lightbox har Escape og dialog-rolle (mangler bare fokushåndtering); native range-input i sliderne.

---

## YTELSE

### Y1. HØY — Forsidens LCP-bilde lazy-lastes
`DiscoverView.tsx:84-90` — ingen `priority` på toppkortene → målbart dårligere LCP på forsiden (artikkelsidene gjør det riktig).
**Fiks:** `priority` på de 2-3 første kortene.

### Y2. HØY — 3,3 MB GIF
`public/forkjopsrett/stalk.gif` (3,3 MB) + `winning.gif` (356 kB), vist via rå `<img>` uten dimensjoner → stor datamengde på mobil + layout-hopp.
**Fiks:** Konverter til kort, muted, loopende MP4/WebM + sett dimensjoner. (Løser samtidig tilgjengelighetsfunn T6 for GIF-ene.)

### Y3. HØY — Artikkel- og temasider server-rendres per besøk
Build viser `ƒ (Dynamic)` for `/artikler/[slug]` og `/tema/[slug]` — hver visning er en serverless-kjøring med høyere svartid, for innhold som er statisk cachebart.
**Fiks:** `generateStaticParams` fra en slug-spørring (cache-laget er allerede tag-basert).

### Y4. MIDDELS
- Typekit-CSS lastes render-blokkerende uten `preconnect` — forsinket første tegning + FOUT på titler.
- Forsidens video-kort: alle har `autoPlay` uansett synlighet + stor, uoptimalisert poster-URL (naturalSrc default 3840px).
- Collage-lightbox: rå img 1800px uten `auto=format`/quality.
- VideoSection: `preload` mangler (default `auto` laster videoer under folden ved sidelast).
- Død MagasinView-kode i forsidens JS-bundle (samme som F3).

### Y5. LAV
- Roboto vekt 300 lastes men brukes aldri.
- Ingen blur-placeholder noe sted (kun opplevd lasting, ikke CLS) — Sanity-LQIP er lett å hente.
- FRONTPAGE/ARTICLES-spørringer uten `[0...N]`-grense — uproblematisk med ~14 saker, sett grense ved neste utgave.

### Verifisert OK
`sizes` riktig satt 40+ steder; AVIF/WebP aktivert; Studio-bundelen (3,9 MB) korrekt isolert til `/studio`; GSAP importeres riktig; Spotify-embed lazy med fast høyde; OG-bildet prerendres statisk; `useCdn` + tag-basert revalidering riktig; eneste scroll-lytter er passiv; forsiden er statisk prerendret.

---

## SEO / AEO

### SE1. HØY — `/medlemstilbud` er foreldreløs
Mangler i sitemap (`sitemap.ts:17-20`), i llms.txt og i menyen (som lenker eksternt til tobb.no/fordeler i stedet — funn U1). Egen metadata mangler også openGraph/twitter (arver forsidens).
**Fiks:** Inn i sitemap + llms.txt + egen OG-blokk; bytt menylenken til intern.

### SE2. MIDDELS — Manglende strukturerte data
Tema-sidene har null JSON-LD (verken CollectionPage eller BreadcrumbList); ingen PodcastEpisode/VideoObject-typer.
**Fiks:** Breadcrumb/CollectionPage på temasider; podcast/video-typer når aktuelt.

### SE3. LAV
- `sitemap.ts`: `lastModified: now` på statiske sider signaliserer falsk endring; sitemap serveres i sin helhet også når siten er avindeksert (inkonsekvent med llms.txt som har sperre).
- `jsonld.ts:33-36`: TOBB som parentOrganization mangler `url`/`sameAs` — svakere entitetskobling for AI-søk.
- `lang="no"` → `lang="nb"` (konsistent med `nb-NO` i JSON-LD/OG).
- llms.txt mangler medlemsfordel- og tema-seksjoner.

### Verifisert OK
`metadataBase` + canonical på alle sider; konsekvent indekseringsbryter på tvers av robots/metadata/llms.txt; OG-bilde per artikkel med fallback-kjede; NewsArticle + BreadcrumbList + Organization/WebSite-JSON-LD; noIndex-artikler ekskludert fra sitemap; beskrivelser klippes på ordgrense.

---

## DESIGN, UX OG INNHOLD

### D1. HØY — Anti-AI-regelbrudd: pill-buttons
Kundens KRITISK-regel («unngå pill-buttons») brytes flere steder med ekte tekst-piller: `FullscreenMenu.tsx:191` («Les nå»), `AnsiennitetSjekk.tsx:141` (CTA med `rounded-full` + hover-scale — klassisk SaaS), `StoriesGrid.tsx:52,64` (filterpiller), `MedlemstilbudView.tsx:187` (region-chips), `StandardArticle.tsx:90,103` (tag-chips).
**Fiks:** Bruk det redaksjonelle språket som alt finnes (understrek-tabs som FilterTab i MedlemstilbudView er forbilledlig) eller firkantede etiketter.
*Nyansering:* Gradient-treffene i kodebasen er scrims (svart→transparent over foto for lesbarhet) — etablert redaksjonell praksis, ikke «AI-gradienter». Bør regnes som bevisst unntak.

### D2. MIDDELS — Tailwind-standardfarger i quiz
`InteractiveQuiz.tsx:170-173` — hardkodet `#22c55e`/`#ef4444` (generisk green-500/red-500) for riktig/galt — utenfor TOBB-paletten, nettopp estetikken reglene forbyr.
**Fiks:** TOBB-grønn `#74AA50` / magenta `#AA0061` eller theme-avledet.

### D3. MIDDELS — Fargekonstanter definert fire steder
globals.css, article/theme.ts, KoeLapp.tsx, opengraph-image.tsx + `'#003865'`-fallback inline i ~20 scrolly-filer.
**Fiks:** Ett tokens-modul, importer overalt.

### D4. MIDDELS — Hardkodet innhold som burde vært i Sanity
Footer (redaktørnavn, beskrivelse-duplikat), meny (NAV_LINKS, sosiale lenker), MedlemstilbudView (intro/innløsningstekst).
**Fiks:** Et lite `siteSettings`-dokument i Sanity.

### D5. LAV
- Tom forside hvis utgaven ikke har artikler — ingen melding (tema-/tilbudssidene har gode tomtilstander).
- `capitalize` på norske tema-titler gir «Stor Forbokstav På Hvert Ord» — unorsk.
- Mikrotekst `text-[9px]`/`text-[10px]` på grensen til ulesbart på mobil; 10-13px brukes vilkårlig om hverandre for samme etikett-konsept — definer 2-3 tokens.
- `ui/ArticleCard.tsx:79`: `font-display font-bold` — Gastromond finnes kun i Regular → faux-bold (død kode i dag, men en felle).
- To konkurrerende chip-design (ubrukt `ui/Tag` rounded-sm vs. rounded-full overalt ellers).

### Verifisert OK
Ingen engelske strenger i synlig UI eller aria-labels — alt bokmål; ingen dekorative fargegradienter; konsistent bruk av theme-systemet i artikler/scrolly.

---

## TYPESCRIPT OG LINT (kjørt direkte)

- `tsc --noEmit`: **0 feil.**
- ESLint: 2 errors (én i råinnholds-jsx i `content/` — irrelevant; én reell i `DisableDraftMode.tsx`, se F7) + 14 advarsler (ubrukte variabler/imports i `DiscoverView`, `scrollytelling/ProgressBar`, `IllustratedScene`, `sync-gronn-plattform.ts`; utdaterte eslint-disable-direktiver; `<img>`-advarsler på GIF-ene; useEffect-avhengighet i InteractiveQuiz).

---

## Metode og avgrensning

Statisk kodegjennomgang av hele `src/`, `scripts/`, config og innholdsoppsett, utført av seks parallelle granskinger (frontend, scrollytelling, Sanity/sikkerhet, tilgjengelighet, ytelse, SEO/design) + build/typesjekk/lint. Kontrastverdier er beregnet etter WCAG-formelen. **Anbefalt oppfølging:** manuell test med tastatur + VoiceOver i agent-browseren på dev (port 3100) etter at P1/P2-fiksene er gjort — særlig meny, forkjøpsrett-saken og medlemstilbud-filtrene.
