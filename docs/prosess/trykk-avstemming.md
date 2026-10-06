# Avstemming mot trykket

Metoden for å få tekst, bilder og bildetekster på rede.no til å stemme med den trykte utgaven. Utviklet etter at bildetekster lagt inn «med skjønn» havnet på feil bilder i to saker — og kunden fant det. Brukt på alle 14 saker i Rede 2 2026.

## 1. Finn oppslaget

PDF-side = trykkside / 2 + 1 (trykk s. 4 → PDF 3, s. 26 → PDF 14). Innholdsfortegnelsen står på PDF-side 2.

## 2. Hent teksten billig

```bash
pdftotext -layout "utgave.pdf" ut.txt
awk 'BEGIN{RS="\f"} NR==<pdfside>' ut.txt
```

Bildetekster står ofte i egne «Bildetekster»-bokser, nummerert `01.` `02.` `03.`. Løse bildetekster (uten nummer) står rett ved bildet sitt.

## 3. Se på siden — kan ikke hoppes over

Les PDF-siden som bilde (Claude: `Read` med `pages: "N"`). Koblingen nummer → foto finnes bare i layouten, ikke i teksten. **Uten å se siden gjetter du.**

## 4. Sammenlign motiv mot motiv

Hent hvert bilde som ligger i Sanity, i lav oppløsning:

```
https://cdn.sanity.io/images/tqfezovu/production/<ref uten "image-", med . før filendelsen>?w=350&q=50&fm=jpg
```

Bruk `curl` til nedlasting (Python `urllib` har gitt 404/SSL-feil).

Mange bilder (f.eks. 38 råfiler)? Lag miniatyrer (`sips -Z 320`), legg dem i en midlertidig mappe under `public/tmp-*/`, lag en enkel HTML-side som kontaktark og se på den i nettleseren — én skjerm i stedet for 38 bildelesninger. Slett mappa etterpå.

## 5. Skriv tilbake med script

`@sanity/client` + `client.patch(id).set({...})`. Nyttige stier:
- `sections[_key=="x"].images[_key=="y"].caption`
- `body[_key=="z"].caption`
- `.insert('after', 'body[_key=="k"]', [...])` for nye bilder

Kjør med `node --env-file=.env.local scripts/tmp/<script>.mjs`. Jobb på utkast når endringen er stor. Slett scriptet etterpå.

## Feller

- **Bildeteksten kan være ordrett riktig og likevel feil** — den står på feil foto.
- **Noen «bildetekster» i Sanity er brødtekst fra trykket** som er flyttet. Da mangler setningen i brødteksten.
- **Sanity kan ha bilder som ikke er i trykket** (importen tok inntil 8 fra mappa). De skal ut.
- **Trykket kan ha bilder som mangler i Sanity.** Sjekk råmappa i Drive — den lokale `content/`-mappa er et gammelt øyeblikksbilde.
- **Toppbilder har ikke bildetekstfelt**, og skal ikke ha det (Asbjørns valg, sept. 2026). Bildetekst fra trykket på toppbildet utelates.
- **Fotokreditt** ligger ofte bare i trykklayouten og må legges inn manuelt.
