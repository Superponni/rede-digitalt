# Kom i gang

For deg som skal jobbe i koden til Rede Digitalt — designer eller utvikler. Du trenger ikke kunne programmere: Claude Code gjør det tekniske, du styrer. Les hele siden én gang.

---

## 1. Tilganger du trenger

Be Asbjørn om disse. Kryss av når de er på plass.

- [ ] **Claude** — konto med Claude Code (desktop-appen, Code-fanen).
- [ ] **GitHub** — medlem av organisasjonen `Superponni`, med skrivetilgang til `Superponni/rede-digitalt`.
- [ ] **Vercel** — medlem av teamet `Superponni`. Trengs for å se forhåndsvisningslenker (kan kreve innlogging).
- [ ] **Sanity** — invitert til prosjektet `tqfezovu` (sanity.io/manage). Logg inn på rede.no/studio for å bekrefte.
- [ ] **Adobe Fonts** — Gastromond lastes fra Adobe-pakken `ybg3phx`. Hvis fonten ikke vises lokalt, må `localhost` legges til i pakkens domeneliste av den som eier Adobe-kontoen.
- [ ] **Google Drive** — tilgang til Superponnis delte disk, mappa `02 Prosjekter/TOBB/REDE/` (råmateriale fra journalist + trykk-PDF). Kun nødvendig hvis du jobber med innhold.

## 2. Oppsett på egen maskin (én gang)

Åpne Claude Code, og be den om: *«Sett opp rede-digitalt-prosjektet for meg etter docs/kom-i-gang.md»*. Den gjør stegene under. For referanse:

1. **Programmer:** Git, Node.js 24 (samme som Vercel bruker), og GitHub CLI (`gh`) — logg inn med `gh auth login`.
2. **Hent prosjektet** til en vanlig mappe, f.eks. `~/Documents/Projects/rede-digitalt`.
   **Aldri inni Google Drive** — Drive-synk ødelegger git-mappa.
   ```bash
   git clone https://github.com/Superponni/rede-digitalt.git
   ```
3. **Installer avhengigheter:** `npm install`
4. **Nøkler:** kopier `.env.example` til `.env.local` og fyll inn:
   - `SANITY_API_READ_TOKEN` — Viewer-token (Asbjørn deler, eller lag eget i sanity.io/manage → API → Tokens).
   - `SANITY_API_WRITE_TOKEN` — **ditt eget** Editor-token, navngitt med ditt navn (f.eks. «Rede – Kari»). Eget token per person, så det kan trekkes tilbake uten å påvirke andre. Trengs bare når Claude skal endre innhold via script.
   - `ANTHROPIC_API_KEY` — kun for importskriptet. Trengs normalt ikke av designer.
   - `.env.local` skal aldri committes (den er gitignorert).
5. **Start siden:** `npm run dev` → åpne **http://localhost:3100** (port 3100, ikke 3000). Studio: http://localhost:3100/studio.
   I Claude desktop-appen kan Claude starte den selv via `.claude/launch.json` («rede-dev»).

Ferdig når: forsiden vises lokalt med ekte saker og Gastromond-logoen ser riktig ut.

---

## 3. Hvordan vi jobber sammen

### Miljøene — det er ikke «én ball», men innholdet er felles

Det er to ting å holde fra hverandre: **koden** (hvordan siden ser ut og virker) og **innholdet** (sakene i Sanity).

| | Koden | Innholdet |
|---|---|---|
| **Lokalt** (din maskin, localhost:3100) | Din kopi. Bare du ser den. | Samme Sanity som rede.no |
| **Forhåndsvisning** (Vercel lager én lenke per gren) | Kopi av en gren, kan deles med andre | Samme Sanity som rede.no |
| **Produksjon** (rede.no) | `main`-grenen. Push til `main` = live etter ~2 min | Samme Sanity som rede.no |

Altså: **koden har tre trygge trinn. Innholdet har ett** — det finnes bare ett Sanity-datasett (`production`). Sikkerhetsnettet for innhold er **utkast**: endringer i Studio er utkast til noen trykker «Publiser». Publisert innhold er ute på rede.no innen ca. 1 minutt.

Vi har bevisst ikke eget test-datasett: da ville innholdet gli fra hverandre, og et magasin har ikke behov for det. Det betyr at **script som endrer innhold påvirker rede.no direkte** — derfor jobber vi på utkast (`drafts.<id>`) og publiserer først når saken er godkjent.

### Grener — når må man bruke det?

En gren er en parallell kopi av koden. Hver gren som pushes til GitHub får automatisk sin egen forhåndsvisningslenke på Vercel.

- **Små rettelser** (en skrivefeil, en farge, en avstand): rett på `main` er greit.
- **Alt som er større eller tar mer enn én økt** — nye fonter, ny forside, nye regler for standardsaker, nye byggeklosser: **egen gren**. Da kan det vises fram via forhåndsvisningslenken, og ingenting går ut på rede.no ved et uhell. Når det er godkjent, slås grenen sammen med `main` (via en pull request på GitHub — Claude ordner det).
- **Navngiving:** `design/fonter`, `design/forside`, `feat/<noe>`, `fix/<noe>`.
- **Før du starter for dagen:** be Claude hente siste versjon (`git pull`). Hent også `main` inn i grenen din jevnlig, så den ikke glir for langt fra.
- **Avtal hvem som eier hva.** Den største risikoen er at to personer endrer de samme filene samtidig (f.eks. forsiden). Si fra i chatten før du går løs på et område.

### Når koden endrer hva Sanity kan lagre (skjemaendringer)

Studio ligger inni nettsiden (`/studio`), så en gren har sitt eget Studio med sine felt — men lagrer i det **samme** datasettet som rede.no.

- **Legge til** felt eller byggeklosser: trygt. rede.no ignorerer felt den ikke kjenner.
- **Gi nytt navn til eller slette** felt som er i bruk: ikke gjør det uten en plan for å flytte eksisterende data. Ellers forsvinner innhold fra rede.no.
- **Rekkefølge ved nye byggeklosser:** koden må være live på rede.no **før** innhold som bruker dem publiseres. Ellers blir seksjonen blank på rede.no.
- Nye felt som styrer logikk (farge, modus, oppsett osv.) må legges i `STEGA_SKIP_FIELDS` i `src/sanity/lib/live.ts`, ellers virker de ikke i forhåndsvisningen. Se [teknisk/sanity-og-innhold.md](teknisk/sanity-og-innhold.md).

### Før noe går til `main`

1. `npm run build` må gå grønt lokalt (Vercel-bygget har brukket på ting som virket i dev).
2. Sett på resultatet i nettleseren på **både mobil og desktop**.
3. Korte, meningsfulle commits på norsk (`feat(forside): …`, `fix(artikkel): …`).

---

## 4. Hvor ting ligger i koden

| Hva | Hvor |
|---|---|
| Farger, fonter (designtokens) | `src/app/globals.css` (`@theme`), `src/app/fonts.ts`, `src/app/layout.tsx` (Adobe Fonts) |
| Fargelogikk per artikkel | `src/components/article/theme.ts` |
| Forsiden | `src/components/forside/` (rendres fra `src/app/(site)/page.tsx`) |
| Standardsaker | `src/components/article/` (`StandardArticle.tsx`, `PortableTextRenderer.tsx`) |
| Feature-saker (scrollytelling) | `src/components/scrollytelling/` (+ `sections/`) — orkester: `ScrollytellingRenderer.tsx` |
| Meny, header, footer | `src/components/layout/` |
| Sanity-skjemaer (hva redaktøren kan fylle ut) | `src/sanity/schemas/` (`documents/`, `objects/`) |
| Spørringer mot Sanity | `src/sanity/lib/queries.ts` |
| Studio-meny og oppsett | `src/sanity/structure.ts`, `sanity.config.ts` |
| Script (import m.m.) | `scripts/` — ferdigkjørte engangsscript i `scripts/arkiv/` |

## 5. Tommelfingerregler

- **Norsk bokmål** i all tekst som vises.
- **Anti-AI-design:** ingen gradienter, glassmorphism, pill-knapper, symmetriske SaaS-grid. Se [design/designsystem.md](design/designsystem.md).
- **Les eksisterende kode før du endrer.** Redesign heller enn å lappe.
- **Ikke les mange råbilder inn i Claude-samtalen** (spiser kontekst). Lag miniatyrer/kontaktark når bilder skal vurderes.
- **Redaksjonelle valg tas av Asbjørn.**
