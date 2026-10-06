# Ny utgave: fra trykk til rede.no

Oppskriften for å få en ny papirutgave over på rede.no. Bygget på erfaringene fra Rede 2 2026, der mye måtte rettes i etterkant.

**Grunnregel: den trykte utgaven er fasit for tekst og bildevalg.** Word-filene (docx) er ofte en lengre «director's cut» med ordavvik; råmappa har flere bilder enn trykket. Begge deler ga feil sist — noen av dem fant kunden.

---

## 0. Før du starter

- [ ] **Trykk-PDF** for utgaven (den endelige, med tekstlag) — legges i utgavemappa i Drive.
- [ ] **Sidespeil** (xlsx) — hvilken sak står på hvilke sider.
- [ ] **Journalistens mappe** i Drive: `Delte disker/Superponni/02 Prosjekter/TOBB/REDE/Rede <år>/Rede <nr> <år>/` — én undermappe per sak med docx + bilder.
- [ ] Originalbilder i **full oppløsning** (be fotograf om originaler hvis mappa bare har nedskalerte, f.eks. 2048 px).

**Drive-felle:** mapper som bare ligger i skyen (skyikon, 0 B) viser ikke innholdet sitt før de er lastet ned. Ikke konkluder med at noe mangler før mappa er lastet ned lokalt.

## 1. Kartlegg trykket

- Innholdsfortegnelsen står normalt på PDF-side 2.
- PDF-en er lagt som **oppslag** (to trykksider per PDF-side): **PDF-side = trykkside / 2 + 1** (s. 10 → PDF 6). Sjekk at det stemmer for den nye PDF-en.
- Lag en liste: sak → trykksider → PDF-side → type (standard/feature) → antall bilder i trykket.
- Tekst hentes billig med `pdftotext -layout utgave.pdf ut.txt` og `awk 'BEGIN{RS="\f"} NR==<pdfside>' ut.txt`. Hvis PDF-en mangler tekstlag, må sidene leses visuelt.

## 2. Manifest

Lag `scripts/editions/rede-<nr>-<år>.json` (kopier strukturen fra `rede-2-2026.json`). Manifestet kobler journalistens rotete filnavn (`wetransfer_…`, `Vendom_rede2_26.docx`) til slug, tittel, type og tags. Det er det eneste «vårt» — vi skriver aldri i journalistens mapper.

## 3. Import

```bash
npx tsx scripts/import-edition.ts --edition=<nr>-<år> --dry-run
```
Prøvekjøring: validerer manifestet mot mappa uten å røre Sanity. Kjør til den er ren.

```bash
REDE_CONTENT_DIR="…/REDE/Rede <år>" npx tsx scripts/import-edition.ts --edition=<nr>-<år>
```

> ⚠️ **Kjent svakhet (per oktober 2026):** importen oppretter sakene som **publiserte** dokumenter (`article-<slug>`), ikke utkast. De ligger dermed på rede.no innen ~1 minutt — før de er sjekket. Den leser også tekst fra docx (ikke trykket), tar inntil 8 vilkårlige bilder fra mappa, og får **aldri** med bildetekster eller fotokreditt. Importen bør tilpasses før neste utgave (utkast i stedet for publisert, tekst og bildevalg fra trykket). Sjekk om det er gjort før du kjører.

Importen er trygg å kjøre flere ganger: den hopper over saker som finnes. `--force --only=<slug>` overskriver én sak — og ødelegger redaksjonelle endringer i den. Se [../teknisk/sanity-og-innhold.md](../teknisk/sanity-og-innhold.md).

## 4. Avstem hver sak mot trykket

Én sak om gangen. Følg [trykk-avstemming.md](trykk-avstemming.md):
- Tekst: ordlyd og mengde som i trykket. Ikke ta med docx-avsnitt som ikke står i trykket (unntak: digitale tillegg som faktaboks/quiz — Asbjørn avgjør).
- Bilder: de som står i trykket, i full oppløsning. Bilder som ikke er i trykket fjernes.
- Bildetekster + fotokreditt: legges inn ved å **se** på trykksiden og sammenligne bilde mot bilde. Aldri skjønn.

## 5. Gi sakene uttrykk

- **Standardsaker:** farge, bakgrunn og topp-oppsett fra verktøykassen — se [standard-saker.md](standard-saker.md). Krever ingen kode.
- **Feature-saker:** bygges som utkast med byggeklossene — se [feature-saker.md](feature-saker.md). Variasjon mellom saker er bevisst.
- Foreslå, la Asbjørn velge.

## 6. Forside og utgave

- Utgaven (`edition-<nr>-<år>`) opprettes av importen. Sjekk tittel, nummer, dato og forsidebilde i Studio.
- **«Plassering på forsiden»** på hver sak: `top` = toppraden (de 3 nyeste med `top` vises), `regular` = vanlig rad. Typen (feature/standard) styrer **ikke** plasseringen.
- `menuFeatured` = saken som vises som stort kort i menyen.
- `publishedAt` styrer rekkefølgen.

## 7. Publiser og verifiser

- Asbjørn publiserer i Studio (eller vi publiserer et godkjent utkast via script).
- Ute på rede.no innen ~1–2 minutter. Ingen kode-deploy nødvendig — **unntatt** når saken bruker nye byggeklosser: da må koden være live først.
- Verifiser på **rede.no** (ikke bare lokalt), mobil og desktop.

## Sjekkliste per sak

- [ ] Tekst stemmer med trykket (tittel, ingress, brødtekst, mellomtitler, sitater)
- [ ] Byline: forfatter + fotograf («Tekst & Foto» når samme person)
- [ ] Bildeutvalg = trykket, full oppløsning, fokuspunkt satt der motivet krever det
- [ ] Bildetekster på riktig bilde (sett, ikke gjettet)
- [ ] Farge/modus/topp valgt og godkjent
- [ ] Tags + plassering på forsiden
- [ ] Sjekket på rede.no, mobil + desktop
