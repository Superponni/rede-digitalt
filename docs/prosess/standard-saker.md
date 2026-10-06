# Standardsaker

Hvordan en standardsak får riktig uttrykk. Verktøykassen er bygget; en ny sak krever normalt **ingen kode**, bare valg i Studio.

> Reglene for standardsaker skal revideres i redesignet høsten 2026. Dette dokumentet beskriver dagens system — oppdater det når nye regler er vedtatt.

## Trykkets DNA (Rede 2 2026)

Hver sak har **én signaturfarge** fra TOBB-paletten, og én av fire topp-oppskrifter:
- **A** hvit/lys flate + farget tittel + stort bilde
- **B** full farget flate, lite eller intet bilde
- **C** mørk flate + ren typografi (kåseri)
- **D** farget flate + bildecollage

Flere saker har bevisst **ikke** toppbilde.

## Verktøykassen (felt i Studio)

| Felt | Valg | Merknad |
|---|---|---|
| `accentColor` (signaturfarge) | navy, teal, purple, magenta, blue, green, gold | |
| `colorMode` (bakgrunn) | `light` (mint + farget tittel), `canvas` (lys blå som forsiden), `tinted` (lys tone av signaturfargen), `filled` (full farge), `dark` (marineblå, lys tekst) | `tinted` er det trykket bruker mest |
| `heroLayout` (topp) | `image-first`, `heading-first`, `side`, `none`, `portrait` | `portrait` = rundt foto av kilde med navn buet rundt (`portraitName`/`portraitRole`) |
| `subtitle` | | |

Fargelogikken bor i `src/components/article/theme.ts` (`getArticleTheme`). Samme to felt (`accentColor` + `colorMode`) styrer også feature-saker og artikkelbunnen.

Gull og grønn er lyse farger: på `filled` snur teksten automatisk til mørk for kontrast.

## Låste designvalg

- Toppbildet beholder **alltid originalformatet** (ingen beskjæring).
- Venstrestilt **kun** ved `side`; ellers midtstilt.
- Bevegelse er lett scroll-reveal (`Reveal.tsx`), respekterer «redusert bevegelse», og brukes ikke på alt. Les bevegelsen ut fra trykket: halv side tittel ⇒ stort tittel-øyeblikk, fullbredde foto ⇒ parallax, faktaboks ⇒ glir inn.
- Alle artikler deler samme bunn (`ArticleOutro`): «Les også», tema-lenke, deling, tilbake til magasinet. Ikke lag egne bunner per type.

## Arbeidsflyt per sak

1. Les PDF-oppslaget (se [trykk-avstemming.md](trykk-avstemming.md)).
2. Sjekk Sanity-teksten mot trykket — ofte er den allerede riktig, ikke anta at alt må skrives om.
3. Foreslå farge + modus + topp ut fra trykket → Asbjørn godkjenner.
4. Sett feltene i Studio, eller med et lite script (patch både publisert og utkast hvis begge finnes).
5. Verifiser lokalt, så på rede.no, mobil + desktop.

## Typiske grep fra Rede 2 2026

- Ekspertintervju uten reportasjefoto → `portrait`-topp med kildens portrett.
- To saker på samme oppslag i trykket ble enten slått sammen (Sommerfordeler) eller splittet (bank/megler) — følg trykket, Asbjørn avgjør.
- Kåseri → `dark`, ingen bilde (`heroLayout: none`).
- Vektorillustrasjoner fra InDesign kan ikke hentes ut av PDF-en — be om eksport fra designeren som laget trykket.
