# Arkiv — ferdigkjørte engangs-scripts

Disse scriptene gjorde en bestemt jobb én gang (migreringer, opprydding,
opplasting av bestemte saker, seeding av forkjøpsrett-saken osv.) og er
fullført. De beholdes for historikk/referanse, men kjøres ikke som del av
normal drift.

Aktive verktøy ligger ett nivå opp i `scripts/`:

- `import-edition.ts` — `npm run import` (manifest-drevet utgaveimport)
- `import-member-offers.ts` — import av medlemstilbud
- `export-article-text.mjs` — eksporter artikkeltekst
- `audit-image-resolution.ts` — sjekk bildeoppløsning
- `lib/`, `editions/`, `assets/` — delt kode og data
