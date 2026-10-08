# Rede Digitalt

Digital magasinplattform for TOBBs medlemsmagasin **Rede**. Bygges av Superponni for å transformere print-innhold til moderne, engasjerende digital innholdsopplevelse med scrollytelling, video og podcast.

**URL:** https://rede.no (produksjon, `main`-grenen). Studio: https://rede.no/studio
**Målgruppe:** Unge voksne (18-30), åpen for alle uten innlogging
**Språk:** Norsk bokmål

## Start her

**Les `docs/README.md` før du gjør endringer.** Der ligger arbeidsprosessene og lærdommene fra prosjektet:

- `docs/kom-i-gang.md` — oppsett, tilganger, miljøer, grener og hvordan vi jobber sammen
- `docs/prosess/` — ny utgave, avstemming mot trykk, standardsaker, feature-saker
- `docs/teknisk/` — Sanity/innhold/publisering, frontend-lærdommer
- `docs/design/designsystem.md` — farger, fonter, verktøykasse, låste designprinsipper

Flere personer jobber i prosjektet (Asbjørn + designer). Oppdater dokumentene i `docs/` når noe nytt læres eller besluttes — det er slik kunnskapen deles mellom oss.

## Tech stack

| Komponent | Valg |
|-----------|------|
| Frontend | Next.js 16 (App Router, TypeScript, Tailwind CSS 4), React 19 |
| CMS | Sanity (Studio innebygd på `/studio`), prosjekt `tqfezovu`, datasett `production` |
| Hosting | Vercel (team Superponni, prosjekt `rede-digitalt`). Push til `main` = produksjon |
| Animasjoner | GSAP + ScrollTrigger, Lenis (smooth scroll) |
| Bilder | Sanity CDN + next/image |
| Podcast | Spotify-embed |

Dev-server: `npm run dev` → http://localhost:3100 (port 3100, ikke 3000).

## TOBB Brand

**Farger:**
- Primær: `#003865` (mørk marineblå)
- Bakgrunn: `#F1F8F0` (lys mint), forside `#D3E4F5` (canvas)
- Gull: `#F6BE00`
- Grønn: `#74AA50`
- Teal: `#487A7B`
- Magenta: `#AA0061`
- Lilla: `#6B3077`
- Blå: `#0047BB`

**Fonter (merkevare):**
- Logo: Gastromond (kun ordmerket) — Adobe Fonts
- Titler og mellomtitler: Eczar (Regular / Bold)
- Ingress, teasere: Bitter (bildetekst står i Roboto)
- Sitater og aksenter: Instrument Serif
- Brødtekst og etiketter: Roboto (reserve for Depot New, som ikke er lagt inn på nett)

Profil/fonter er under redesign høsten 2026 — se `docs/design/designsystem.md` for gjeldende tilstand.

## Agent-team

Prosjektet har 7 spesialiserte agenter. Les rollekortene i `.agents/`:

| Agent | Fil | Ansvar |
|-------|-----|--------|
| Art Director | `.agents/art-director.md` | Visuell visjon, mottak av mockups, designtokens, art direction per artikkel |
| Sanity-arkitekt | `.agents/sanity-architect.md` | Skjemaer, GROQ, Studio, AI-pipeline |
| Innholdsstrateg | `.agents/content-strategist.md` | Redaksjonelle valg, seksjonsstruktur, teksttilpasning |
| Frontend/UX-lead | `.agents/frontend-ux-lead.md` | Next.js-app, designsystem, forside, responsivt |
| Animatør | `.agents/animator.md` | GSAP ScrollTrigger, seksjonsanimasjoner, wow-faktor |
| QA-agent | `.agents/qa-agent.md` | Visuell QA, anti-AI-sjekk, performance, tilgjengelighet |
| SEO- og AEO-spesialist | `.agents/seo-aeo-spesialist.md` | Finnbarhet i søk + AI-svarmotorer, schema, Search Console |

## Skills (verktøy agentene bruker)

| Skill | Brukes av | Hva den gjør |
|-------|-----------|--------------|
| `/design-to-code` | Art Director, Frontend | Tar mockup/screenshot → genererer pixel-presis kode |
| Claude API | Innholdsstrateg, Sanity-arkitekt | AI-pipeline i importskriptet |

## Anti-AI-design (KRITISK)

Løsningen MÅ IKKE se AI-generert ut. Les seksjon 8 i `docs/brief.md` og `docs/design/designsystem.md`. Kort oppsummert:

**UNNGÅ:** Gradienter, glassmorphism, symmetriske grids, pill-buttons, generisk SaaS-estetikk.
**GJØR:** Asymmetri, variasjon, editorial layout, TOBBs faktiske farger, innholdsdrevet design.

## Innhold

- **Den trykte utgaven er fasit for tekst og bildevalg** — ikke docx, ikke råmappa. Designet på nett er fritt.
- **Sanity** er fasit for alt publisert innhold. Det finnes ett datasett: lokalt, forhåndsvisning og rede.no viser samme innhold. Script som endrer innhold påvirker rede.no direkte — jobb på utkast.
- **Alle saker importeres til Sanity som utkast (`drafts.<id>`). Ingen sak får status som publisert før redaktør har godkjent den.** Claude publiserer aldri på eget initiativ. Importen skriver bare utkast (også ny utgave og nye tags).
- **Råmateriale** (docx, bilder, trykk-PDF) ligger i Superponnis delte Drive: `02 Prosjekter/TOBB/REDE/Rede <år>/Rede <nr> <år>/`. Vi leser, skriver aldri dit. Lokal `content/` (gitignorert) er et gammelt øyeblikksbilde.
- Utgaver importeres med manifest i `scripts/editions/` — se `docs/prosess/ny-utgave.md`.

## Mappestruktur

```
rede-digitalt/
  CLAUDE.md              # Denne filen
  .agents/               # Agent-rollekort
  docs/                  # Start i docs/README.md
    prosess/             # Arbeidsprosesser
    teknisk/             # Sanity, frontend-lærdommer
    design/              # Designsystem
    brief.md, brand/, sketches/
  scripts/               # Import + verktøy (engangsscript i scripts/arkiv/)
  src/
    app/                 # Ruter ((site)/ = nettsiden, studio/ = Sanity Studio)
    components/          # forside/, article/, scrollytelling/, layout/ …
    sanity/              # Skjemaer, spørringer, Studio-oppsett
```

## Arbeidsregler

- **Norsk bokmål** i all UI-tekst og innhold
- **Aldri skriv kode uten å ha lest eksisterende kode først**
- **Kartlegg alle states før implementasjon**
- **Aldri lapp-på-lapp** — redesign hvis noe er fundamentalt feil
- **Ikke foreslå optimaliseringer uten måledata**
- **Grener:** små rettelser kan gå rett på `main`; større arbeid (redesign, nye fonter, nye byggeklosser) på egen gren med forhåndsvisningslenke. Se `docs/kom-i-gang.md`.
- **Før push til `main`:** `npm run build` grønt, sett på mobil + desktop.
- **Commits:** Korte, meningsfulle commits på norsk.
- **Token-strategi:** Ikke les råbilder inn i kontekst i bulk — lag miniatyrer/kontaktark. Prosesser artikler én om gangen.
- **Bruker (Asbjørn) tar alle redaksjonelle valg** — agentene foreslår, han godkjenner.
- **Ikke kall noe ferdig** før det er verifisert visuelt (innhold: på rede.no, ikke bare lokalt).
