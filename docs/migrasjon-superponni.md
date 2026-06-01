# Flytteplan: Rede Digitalt → Superponni-organisasjon

Fra privat/hobby-oppsett til organisasjonseid løsning klar for kundeovertakelse.

**Sist oppdatert:** 2026-06-01
**Strategi:** Flytt eksisterende tjenester (behold historikk/innhold). Ikke start friskt.

---

## 0. Dagens oppsett (kartlagt)

| Tjeneste | Nå | Skal til |
|----------|-----|----------|
| GitHub | `github.com/asbjorngr/rededemo` (privat konto) | `github.com/Superponni/rede-digitalt` (org) |
| Vercel | Prosjekt `rede-digitalt` i hobby-team `team_Vkuo7XJ…` | Superponni Vercel Team (Pro) |
| Sanity | projectId `tqfezovu`, dataset `production` | **Samme projectId**, eid av Superponni-org |
| Innhold (råmateriale) | `content/` lokalt på Mac (~1GB, gitignorert) | Delt Drive-mappe «Rede» |
| Live URL | `*.vercel.app` | Eget domene (TBD) |
| AI-pipeline | `scripts/import-edition.ts` + Anthropic-nøkkel (privat) | Forblir Superponnis engangsverktøy |

**Miljøvariabler** (`.env.local`):
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — trengs i build + runtime (live site)
- `NEXT_PUBLIC_SANITY_DATASET` — trengs i build + runtime
- `SANITY_API_WRITE_TOKEN` — **kun** for importskriptet, ikke for live site
- `ANTHROPIC_API_KEY` — **kun** for importskriptet, ikke for live site

> Merk: Live site leser kun offentlig data via Sanity CDN. Av env-variablene over er det bare de to `NEXT_PUBLIC_SANITY_*` som faktisk må ligge i Vercel for at siden skal fungere.

---

## 1. KJERNESPØRSMÅL: Hva er «sannheten»?

Dette er det viktigste å forstå før noe flyttes.

### Regelen
- **Drive-mappa = råkilde / arkiv.** Originale docx + bilder fra trykk. Dette er *input* til en **éngangs-seeding per artikkel** — ikke en levende kilde.
- **Sanity = fasit for alt publisert/levende innhold.** Idet en artikkel finnes i Sanity, er Sanity sannheten. All redigering skjer i Sanity, aldri i mappa.
- **Importen er IKKE en synk.** `scripts/import-edition.ts` kjører `sanity.create()` hver gang → den **lager nye dokumenter**, den oppdaterer ingenting. Kjøres den på nytt mot eksisterende innhold får du **duplikater**, ikke en oppdatering.

### Hvorfor dette er kritisk akkurat nå
Flyten har til nå vært enveis: `mappe → Sanity`. Idet kunde får redaktørsete og begynner å endre/godkjenne innhold i Sanity, kan vi **ikke** lenger pushe fra mappa uten å enten duplisere eller overskrive redaktørens arbeid. Etter go-live er retningen brutt: **Sanity er fasit, mappa er historikk.**

### Tiltak for å gjøre dette trygt
1. **Frys importflyten etter go-live.** Behandle `import-edition.ts` som arkivert verktøy. Det kjøres kun for å seede *helt nye* artikler/utgaver (f.eks. en framtidig Rede 3) som ennå ikke finnes i Sanity — aldri for å «oppdatere» eksisterende.
2. **(Valgfri herding) Gjør importen idempotent.** Bytt `sanity.create` → deterministiske `_id` (f.eks. `article-${slug}`) og «hopp over hvis finnes» som default; `createOrReplace` kun bak et eksplisitt `--force`-flagg. Da kan skriptet aldri duplisere eller overskrive ved uhell. Gitt at det er et engangsverktøy er minimumskravet å *dokumentere* regelen i selve skriptet.
3. **Dataset-backup som rutine.** Sanity har innebygd dokumenthistorikk, men ta i tillegg jevnlige eksporter:
   ```bash
   npx sanity dataset export production rede-backup-$(dato).tar.gz
   ```
   Særlig viktig rett før og rett etter overlevering.
4. **Ikke slett Drive-originalene.** Når bilder er importert ligger de i Sanity CDN (fasit for det siden viser), men behold originalene i Drive som arkiv.

---

## 2. Rekkefølge og avhengigheter

Rekkefølgen er bevisst. Sanity først (helt uavhengig, null risiko), så GitHub, så Vercel (må kobles til repoet på *ny* plassering), så domene, så innhold.

```
Fase 0  Forberedelse + backup        (ingen nedetid)
Fase 1  Sanity → org                 (uavhengig, samme projectId)
Fase 2  GitHub → org                 (transfer + evt. rename)
Fase 3  Vercel → team               (transfer + reconnect Git)   ← mest skjøre steg
Fase 4  Eget domene                  (krever DNS-tilgang)
Fase 5  Innhold → Drive + regler
Fase 6  Verifisering + opprydding
```

**Største risiko:** Koblingen Vercel ↔ GitHub. Når repoet flyttes til org må Vercel GitHub-appen installeres på Superponni-orgen og prosjektet kobles til repoet på nytt. Derfor: GitHub **før** Vercel.

---

## Fase 0 — Forberedelse (gjør før noe flyttes)

- [ ] Bekreft at `main` er ren og pushet (`git status`, `git push`).
- [ ] Sikkerhetskopier env-verdier et trygt sted (passordhvelv), ikke bare i `.env.local`.
- [x] Ta full Sanity-backup som sikkerhetsnett (2026-06-01):
      `rede-backup-pre-migrasjon.tar.gz` (390 MB, 28 dok + 82 assets) — ligger i
      `~/Documents/Projects/` (utenfor repoet). Flytt til Drive «Rede» når den finnes.
- [ ] Opprett de tre org-kontoene:
  - [ ] **GitHub-organisasjon** «Superponni»
  - [ ] **Vercel Team** «Superponni» (Pro-plan for flere medlemmer/roller/domene)
  - [x] **Sanity-organisasjon** «Superponni» (org-ID `oo6Gx1isw`)
- [ ] Avklar med deg selv: hvilket **domene** og hvem styrer **DNS**? (blokkerer Fase 4)

---

## Fase 1 — Sanity til organisasjon (gjør først, tryggest)  ✅ GJORT 2026-06-01

Flytting av et Sanity-prosjekt til en org **beholder samme `projectId` (`tqfezovu`) og dataset**. Ingen kode endres, ingen env endres, ingen re-import, ingen nedetid.

- [x] sanity.io/manage → prosjekt `tqfezovu` → flyttet til **Superponni** (org-ID `oo6Gx1isw`).
- [x] Verifisert: `projectId` fortsatt `tqfezovu`; API-lesing OK (13 artikler, 9 tags, 1 utgave); innhold intakt.
- [ ] **Inviter kunde-medlemmer** med riktig rolle — **UTSATT til alt er klart (rett før overlevering):**
  - Asbjørn / Superponni: **Administrator**
  - TOBB-redaktør (lager/redigerer innhold): **Editor**
  - TOBB-godkjenner (vedlikehold/godkjenning): **Editor** (eller egendefinert «publisher»-rolle på Growth-plan)
  - *Mangler:* e-postadresser til TOBB-redaktør + -godkjenner.
- [ ] Flytt fakturering til org-eierskap hvis dere oppgraderer plan (nå: Free).
- [x] API-token `SANITY_API_WRITE_TOKEN` overlever flyttingen — ingen endring nødvendig.

> **CORS:** Eksisterende origins følger med. Husk å legge til det nye domenet i Fase 4 (Settings → API → CORS origins), ellers vil `/studio` på nytt domene ikke fungere.

---

## Fase 2 — GitHub til organisasjon  ✅ GJORT 2026-06-01

- [x] GitHub: repo `asbjorngr/rededemo` → **Transfer ownership** → Superponni. Historikk intakt, gammel URL redirigeres.
- [x] Gitt nytt navn `rede-digitalt` for konsistens.
- [x] Asbjørn er org-owner.
- [x] Lokal remote oppdatert til `https://github.com/Superponni/rede-digitalt.git` + pushet ventende commits.

---

## Fase 3 — Vercel til team  ✅ GJORT 2026-06-01

Gjort **etter** GitHub-transfer, slik at vi koblet mot repoet på endelig plassering.

- [x] Opprettet Vercel Team «Superponni» (slug `superponni`, orgId `team_Jl8QNwJr2GW8R04unnJRWQXb`).
- [x] Flyttet prosjektet til teamet. **Env-variabler fulgte med** (verifisert på `rededemo`: begge `NEXT_PUBLIC_SANITY_*` + skrivetoken på alle miljøer).
- [x] Vercel GitHub-app installert på Superponni-org; Git koblet til `Superponni/rede-digitalt`.
- [x] Verifisert: tom commit pushet → **grønn produksjons-deploy** (`...-superponni.vercel.app`, Ready ~1m). Live `https://rededemo.vercel.app` svarer HTTP 200 med ekte Sanity-innhold.

**Viktige merknader / feller (lært under utførelse):**
- **Vercel-prosjektnavnet er `rededemo`**, ikke `rede-digitalt` (arvet fra opprinnelig repo-navn). GitHub-repo + lokal mappe heter `rede-digitalt`. Live-URL er `rededemo.vercel.app`. *Valgfri opprydding:* rename Vercel-prosjektet til `rede-digitalt` — men det endrer `.vercel.app`-subdomenet. Mindre viktig siden eget domene kommer (Fase 4).
- **Ikke bruk `vercel link --yes --project <navn>`** hvis navnet ikke matcher eksakt — `--yes` *oppretter* et nytt tomt prosjekt i stedet for å feile. Skjedde her (lagde et duplikat `rede-digitalt`-prosjekt koblet til samme repo); måtte slettes i UI. Riktig: link uten `--yes`, eller bruk eksakt prosjektnavn `rededemo`.
- ~~**`SANITY_API_WRITE_TOKEN` ligger i Vercel**~~ ✅ LØST 2026-06-01: fjernet fra Vercel + rotert i Sanity (gammelt token revokert, nytt «Rede import»/Editor kun i lokal `.env.local`). Live-siden bruker den ikke.
- **Preview-miljøet** mangler env-vars hvis prosjektet noen gang re-seedes; `rededemo` har dem allerede på alle tre miljøer, så ikke et problem nå.

---

## Fase 4 — Eget domene  *(krever avklaring + DNS-tilgang)*

> **Åpent valg:** Hvilket domene? (`rede.tobb.no` / Superponni-subdomene / eget). Hvem styrer DNS?

- [ ] Legg til domenet i Vercel-prosjektet (Settings → Domains).
- [ ] Sett opp DNS hos domeneeier (CNAME/A iht. Vercels instruks).
- [ ] Vent på SSL/verifisering.
- [ ] **Legg domenet til i Sanity CORS** (Settings → API → CORS origins) — ellers virker ikke `/studio` + preview på nytt domene.
- [ ] Oppdater evt. `metadataBase`/OG-URL i koden hvis domenet er hardkodet noe sted.

---

## Fase 5 — Innhold til Drive + regler

`content/` er gitignorert, så **live site er ikke avhengig av mappa** — den brukes bare av importskriptet.

- [ ] Opprett delt Drive-mappe «Rede» (delt drive, ikke privat konto).
- [ ] Flytt `content/`-materialet (docx + bilder + designfiler) dit.
- [ ] Hvis importskriptet skal kunne kjøres igjen for ny utgave: enten
  - hold en lokal synket kopi (Google Drive desktop) og pek `CONTENT_DIR` dit, eller
  - gjør `CONTENT_DIR` til et argument/env-variabel i stedet for hardkodet sti.
- [ ] Dokumentér i Drive-mappa: «Dette er råarkiv. Fasit for publisert innhold er Sanity.»

---

## Fase 6 — Verifisering og opprydding

- [ ] Live site fungerer på nytt domene (forside + en scrollytelling + en standard-artikkel).
- [ ] `/studio` fungerer, kunde-redaktør kan logge inn og redigere.
- [ ] Ny deploy trigges automatisk fra `Superponni/rede-digitalt`.
- [ ] Sanity-innhold uendret (samme projectId, ingen duplikater).
- [ ] **Behold de gamle private repo/Vercel-prosjektene i ~1 uke** som fallback — ikke slett før alt er verifisert.
- [ ] **Rotér hemmeligheter** ved overlevering (god praksis): ny `SANITY_API_WRITE_TOKEN`; Anthropic-nøkkel forblir Superponnis og deles ikke.
- [ ] Oppdater `CLAUDE.md` + docs med nye URLer, org-navn og «Sanity = fasit»-policyen.

---

## Åpne punkter (trenger avklaring fra Asbjørn)

1. **Domene:** hvilket, og hvem styrer DNS?
2. **Kunde-medlemmer i Sanity:** navn/e-post + om «godkjenner» trenger egen rolle utover Editor.
3. **Planvalg/kostnad:** Vercel Pro + evt. Sanity Growth (for flere medlemmer/roller/SSO).
