# Feature-saker (scrollytelling)

Hvordan en feature-sak bygges eller redesignes. Metoden ble utviklet på «Gøy med kjepphest» (pilot) og «Fransk finesse bak disken», begge live. I Studio heter typen «Feature» (intern verdi er fortsatt `scrollytelling`).

> Feature-uttrykket skal videreutvikles i redesignet høsten 2026. Prinsippene under er det vi har landet så langt.

## Retning

Editorial, ikke «interaktiv demo». Referanse: joshuas.io/cask-001.

- **Rene bilder som puster** — nesten aldri tekst oppå foto.
- **Emfase med farget flate, ikke mørklagt foto** → `statementPanel` (signatursitat på farge).
- **Trykket styrer tekstmengden** — trim bort docx-avsnitt som ikke står i trykket.
- **Variasjon mellom saker er bevisst** (anti-AI): samme kvalitetsløft, ulik karakter.
- **Alt skal kunne leses smooth nedover.** Asbjørn har forkastet: pinnede/scroll-scrubbede scener (de «snapper»), horisontal scroll, klikk-gallerier og fane-velgere. Spenning skapes med bilder, rytme og animerte illustrasjoner — ikke navigasjon.
- Det filmatiske helskjerm-coveret (`heroSection`) er feature-signaturen og beholdes.

## Byggeklosser — når brukes hva

| Behov | Kloss |
|---|---|
| Brødtekst med ett bilde | `textWithImage` (stående foto: `imageRatio: 'natural'`). Mellomtitler = `h3`-blokker i teksten (klossen har ikke eget tittelfelt). Første tekstseksjon får stor «lede»-behandling — legg ingressen der. |
| Signatursitat | `statementPanel` |
| 4–5 stående bilder | `collage` (to forskjøvede kolonner, lett rotasjon, naturlig format, klikk for å forstørre). Ikke 6+. |
| Blandede/liggende bilder | `gallery` med `layout: 'montage'` (orienteringssmart, kutter ikke motiv). `carousel` for rolige serier. |
| Rent pustende helbilde | `fullscreenParallax` **uten** tekst (med tekst blir bildet mørklagt — unngå) |
| Avsluttende sitat | `pullQuote` (minimal) |
| Turformat / stopp | `numberedStop` (har bildetekstfelt) |
| Fakta | `factBox` — men narrativ tekst hører hjemme i `textWithImage` |
| Illustrert/forklarende sak | `illustratedCover`, `illustratedScene` (+ `animateIllustration`), `stickyVei`, `koeSlider` m.fl. — bygget for forkjøpsrett-saken |

Fasit for hvilke klosser som finnes: `src/sanity/schemas/objects/` og `SECTION_MAP` i `src/components/scrollytelling/ScrollytellingRenderer.tsx`.

## Steg for steg

1. **Finn trykksidene** via sidespeil/innholdsfortegnelse (PDF-side = trykkside / 2 + 1).
2. **Hent dagens struktur** fra Sanity (temp-script med `@sanity/client`, `useCdn: false`): `_id`, `sections` med `_key`, `_type`, bilde-referanser.
3. **Gap-analyse** trykk vs. digital: tekstmengde, bildeutvalg, tekst-på-bilde, tekstavvik.
4. **Bygg på utkast** (`drafts.<id>` med `createOrReplace`) — aldri rett på publisert. Asbjørn ser det i Studio → Presentation.
5. **Bilder:** last opp manglende med `client.assets.upload('image', createReadStream(sti))`. Gjenbruk eksisterende asset via `originalFilename` så du ikke laster opp duplikater. Finn riktig råfil ved å lage kontaktark (se [trykk-avstemming.md](trykk-avstemming.md)).
6. **Bildetekster og fotokreditt** fra trykket — sett, ikke gjettet.
7. **Publiser** når Asbjørn har godkjent: i Studio, eller `transaction().createOrReplace(publisert).delete(utkastId)`.

**Nye byggeklosser?** Da er rekkefølgen: kode live på rede.no **først**, så publiser innholdet. Ellers blir seksjonen blank.

## Lærdommer

- Fritt-flytende, absolutt-posisjonerte bilder med overlapp skjuler bildetekster og kutter ansikter → bruk kolonner.
- Skygger på bilder drar mot SaaS-stil → flate bilder eller svært diskré skygge.
- Liggende bilder i stående collage-slott blir beskåret → bruk `gallery` montage.
- På lyse flater må sitater/kursiv ha full brødtekstfarge; dempet grå blir uleselig.
- Rydd avstander ved årsaken (seksjons-padding som stables), ikke ved å justere én seksjon.
- Når Asbjørn redigerer et utkast i Studio, **slutt å kjøre seed-scriptet** for saken — det overskriver endringene hans.
