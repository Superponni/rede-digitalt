# Rede Digitalt

Digital magasinplattform for TOBBs medlemsmagasin **Rede**. Bygges av Superponni for å transformere print-innhold til moderne, engasjerende digital innholdsopplevelse med scrollytelling, video og podcast.

**URL:** Demo på Vercel (rede-demo.vercel.app eller lignende)
**Målgruppe:** Unge voksne (18-30), åpen for alle uten innlogging
**Språk:** Norsk bokmål

## Tech stack

| Komponent | Valg |
|-----------|------|
| Frontend | Next.js 14+ (App Router, TypeScript, Tailwind CSS) |
| CMS | Sanity v3 (headless) |
| Hosting | Vercel |
| Animasjoner | GSAP + ScrollTrigger (kjerne), Framer Motion (mikrointeraksjoner) |
| Bilder | Sanity CDN + next/image (AVIF, blur placeholder) |
| Video | Placeholder/Mux, Sanity assets |
| Podcast | Spotify oEmbed |

## TOBB Brand

**Farger:**
- Primær: `#003865` (mørk marineblå)
- Bakgrunn: `#F1F8F0` (lys mint)
- Gull: `#F6BE00`
- Grønn: `#74AA50`
- Teal: `#487A7B`
- Magenta: `#AA0061`
- Lilla: `#6B3077`
- Blå: `#0047BB`

**Fonter:**
- Display: Gastromond Regular (logo, store titler)
- Hovedfont: Depot New Light/Bold (brødtekst)
- Sekundær: Varela Round Regular (headings)
- Web fallback: Roboto / system fonts

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
| `/supabase-cli` | - | Ikke relevant (vi bruker Sanity, ikke Supabase) |
| Claude API | Innholdsstrateg, Sanity-arkitekt | AI-pipeline for innholdstransformasjon |

## Anti-AI-design (KRITISK)

Løsningen MÅ IKKE se AI-generert ut. Les seksjon 8 i `docs/brief.md` og frontend-ux-lead agenten for detaljer. Kort oppsummert:

**UNNGÅ:** Gradienter, glassmorphism, symmetriske grids, pill-buttons, generisk SaaS-estetikk.
**GJØR:** Asymmetri, variasjon, editorial layout, TOBBs faktiske farger, innholdsdrevet design.

## Innholdsstruktur

Utgave: **Rede 2 2026** (i `content/Rede 2 2026/`)

Artikler (~14 stk):
- Kjepphest, Hit Padel, Høyt&Lavt, Trondheim Kino, Alma Mater (mat/profil)
- Promenade (Forsvarsrunden), Støtte til lag og foreninger (curling)
- Medlem case (Ole Elias), Medlem nr 80000 (forkjøpsrett)
- Grønn Plattform, Bank og megler, Trygghet rundt boligselskapsmodellen
- Kåseri (taklekkasje)

Hver mappe inneholder: docx (tekst) + bilder (jpg/jpeg/png/webp)
Designfil-mappen: InDesign-filer og disposisjonsprint (PDF)

## Mappestruktur

```
rede-digitalt/
  CLAUDE.md              # Denne filen
  .agents/               # Agent-rollekort
  docs/
    brief.md             # Original prosjektbrief
    brand/               # TOBB profilmanual
    sketches/            # Forside-skisser (desktop + mobil)
  content/
    Rede 2 2026/         # Råmateriale for MVP-utgaven
  src/                   # Next.js-app (opprettes ved init)
```

## Arbeidsregler

- **Norsk bokmål** i all UI-tekst og innhold
- **Aldri skriv kode uten å ha lest eksisterende kode først**
- **Kartlegg alle states før implementasjon**
- **Aldri lapp-på-lapp** — redesign hvis noe er fundamentalt feil
- **Ikke foreslå optimaliseringer uten måledata**
- **Commits:** Korte, meningsfulle commits. Push til Vercel etter hver meningsfull endring.
- **Token-strategi:** Aldri les bilder inn i kontekst. Prosesser artikler én om gangen.
- **Bruker (Asbjørn) tar alle redaksjonelle valg** — agentene foreslår, han godkjenner.

## MVP-scope (deadline: torsdag 16. april 2026)

**Må fungere:**
- Forside med innholdsmiks (hero, kort, podcast, video, leder)
- 2-3 scrollytelling-artikler med full behandling
- 3-5 standard artikler (pen lesevisning)
- Leder-visning (tekst, evt. uten lyd/video)

**Kan vente:**
- Arkiv/tema-sider
- Søk
- Om Rede-side
- Analytics

**Kutteprioritering hvis tid er knapp:**
1. Standard-artikler kuttes først
2. Enklere forside er OK
3. Heller 1 perfekt scrollytelling enn 3 halvgode
