# Frontend-lærdommer

Ting som har gått galt før, og regelen vi landet på. Les før du endrer bilder, animasjon eller layout.

## Bygg og deploy

- **Kjør `npm run build` før push.** En GSAP-endring uten `window`-sjekk virket i dev men brakk Vercel-bygget.
- Push til `main` = produksjon (rede.no) etter ~2 min. Andre grener = forhåndsvisningslenke.
- Dev-serveren kjører på **port 3100**.

## Bilder

Hjelpere i `src/sanity/lib/imageHelpers.ts` (`naturalSrc`, `coverSrc`, `focalPosition`, `imageDims`).

- **Fast boksformat** (kort, 3/4-ramme) → `coverSrc`: Sanity beskjærer rundt fokuspunktet.
- **Dynamisk boksformat** (grid som strekker seg, helskjerm) → `focalPosition` → CSS `object-position`.
- **Aldri begge samtidig** (dobbel beskjæring = mistet fokus).
- Be om full bredde (`naturalSrc`, standard 3840) og la `next/image` lage varianter. Hardkodet liten bredde ga kornete toppbilder.
- Toppbilde `image-first` er høydebegrenset (~74vh, maks 820px) så tittelen er over folden.
- Toppbilder beholder originalformat.
- Flere bilder i Sanity er nedskalert (f.eks. 2400 px). `scripts/audit-image-resolution.ts` finner dem; bytt med originaler når de finnes.

## Animasjon (GSAP + ScrollTrigger)

- **Ingen pin/scrub** på innholdsscener — det «snapper» når pinnen slipper. Bruk CSS `position: sticky` når noe skal stå i ro mens tekst scroller.
- **Stagger = total tid** (`stagger: { amount }`), ikke per element — SVG-er med hundrevis av deler blir ellers sekundlange.
- **Avsløring av inline-SVG: IntersectionObserver, ikke ScrollTrigger.** Tåler rask scrolling og at siden endrer høyde.
- Animer `transform`/`opacity`, ikke `left`/`width` (layout = hakking). Memoiser tunge elementer.
- Respekter «redusert bevegelse» (`usePrefersReducedMotion`).
- Bevegelse er koblet helt fra farge: `theme-config.ts` gir én rolig profil, fargen kommer fra `getArticleTheme`.

## Mobil og iOS

- **Aldri CSS `drop-shadow`-filter på illustrasjoner** — iOS Safari tegner en synlig lys firkant rundt.
- Halvtransparent tekst leses som lastefeil på mobil → nedtoning av inaktive steg kun på desktop.
- Illustrasjoner trenger definert boks (bredde + helst høyde, aspect-ratio fra viewBox), ellers renner de over teksten.
- Mobilmenyen skal aldri trenge scroll (målt mot 375×667).
- Elementer som er `hidden lg:flex` må ha en mobilvariant hvis innholdet bare finnes der.

## Farger og kontrast

- På lyse flater: sitater/kursiv i full brødtekstfarge. Dempet tekst minst 72 % på lys flate.
- Gull/grønn på full farget flate → mørk tekst (håndteres i `theme.ts`).
- Mange komponenter har fortsatt `#003865` hardkodet i stedet for token — kjent gjeld, ryddes ved redesign.

## Kvalitet

- Se på resultatet på **mobil og desktop** før noe kalles ferdig. Let aktivt etter feil (tomrom, kontrast, beskjæring, kollisjon) — ikke bekreftelses-skann.
- Visuell QA: bruk nettleseren i Claude-appen (agent-browser) mot localhost:3100 eller forhåndsvisningslenken. (`scripts/arkiv/qa-shots.py` er pensjonert.)
- Fiks årsaken, ikke symptomet.
- Restliste fra QA juni 2026: [../qa-rapport-2026-06-12.md](../qa-rapport-2026-06-12.md).
