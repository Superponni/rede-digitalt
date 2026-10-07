# Gi en ny person tilgang

For Asbjørn (eller den som er admin): slik gir du en kollega tilgang til å jobbe i Rede Digitalt, både med prompting og design. Tar ca. 20 minutter. Når du er ferdig, følger kollegaen [kom-i-gang.md](kom-i-gang.md).

Du trenger fra kollegaen: **e-postadressen** og **GitHub-brukernavnet** (opprettes gratis på github.com hvis kollegaen ikke har det).

---

## 1. Claude

Kollegaen trenger Claude med Claude Code (desktop-appen, fanen «Code»).
- Har Superponni et Team-abonnement: claude.ai → Innstillinger → Medlemmer → Inviter.
- Ellers: kollegaen trenger eget Pro- eller Max-abonnement.

## 2. GitHub — koden

1. Gå til **github.com/orgs/Superponni/people** → **Invite member** → skriv brukernavnet → **Member**.
2. Gå til **github.com/Superponni/rede-digitalt/settings/access** → **Add people** → velg kollegaen → rollen **Write**.
   (Medlemmer får bare lesetilgang som standard, så dette steget trengs for å kunne lagre endringer.)
3. Kollegaen må godta invitasjonen i e-posten.

## 3. Vercel — forhåndsvisninger og publisering

1. Gå til **vercel.com** → teamet **Superponni** → **Settings** → **Members** → **Invite**.
2. Skriv e-posten, velg rollen **Member** (eller **Developer**).
3. Hvorfor: uten medlemskap kan kollegaen ikke se forhåndsvisningslenkene, og Vercel kan blokkere publisering av endringer fra personer utenfor teamet.
4. NB: på Vercels betalte plan koster hvert medlem en plass (ca. 20 USD/mnd). Sjekk prisen når du inviterer.

## 4. Sanity — innholdet

**Invitasjon (for Studio):**
1. Gå til **sanity.io/manage** → prosjektet **Rede** (`tqfezovu`) → **Members** → **Invite members**.
2. Skriv e-posten og velg rollen **Editor**. Velg **Administrator** bare hvis kollegaen også skal endre prosjektinnstillinger.

**Nøkler (for Claude på kollegaens maskin):**
1. Samme sted: **API** → **Tokens** → **Add API token**.
2. Lag to:
   - Navn `Rede – <navn> skriv`, rettighet **Editor**
   - Navn `Rede – <navn> les`, rettighet **Viewer**
3. Nøkkelen vises **bare én gang** — kopier den med en gang.
4. Med egne nøkler per person kan du slette dem uten å påvirke din egen.

## 5. Send nøklene trygt

Kollegaen trenger disse fire linjene i fila `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=tqfezovu
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=<skrivenøkkelen fra steg 4>
SANITY_API_READ_TOKEN=<lesenøkkelen fra steg 4>
```

Send dem gjennom **1Password** (delt hvelv eller delingslenke). Ikke bruk Slack eller e-post.
`ANTHROPIC_API_KEY` trengs bare for å importere utgaver. Den skal **ikke** deles.

## 6. Fonter og Drive (sjekk, gjør trolig ingenting)

- **Adobe Fonts:** Gastromond lastes fra Adobe-pakken `ybg3phx`. Virker den lokalt hos deg, virker den også hos kollegaen. Skal dere teste **nye** Adobe-fonter, må kollegaen ha tilgang til Adobe-kontoen som eier pakken.
- **Google Drive:** kollegaen trenger tilgang til `Delte disker/Superponni/02 Prosjekter/TOBB/REDE/` bare hvis kollegaen skal jobbe med innhold fra trykket.

## 7. Melding til kollegaen

Send noe slikt:

> Du har fått invitasjoner til GitHub, Vercel og Sanity — godta dem. Nøklene ligger i 1Password («Rede – <navn>»).
> Åpne Claude-appen → Code, og skriv:
> *«Hent prosjektet github.com/Superponni/rede-digitalt til ~/Documents/Projects og sett det opp etter docs/kom-i-gang.md. Nøklene mine til .env.local limer jeg inn når du ber om dem.»*

## 8. Sjekk sammen (10 min)

- [ ] Nettsiden kjører hos kollegaen på `localhost:3100`, med riktig logo og font
- [ ] Studio virker på `localhost:3100/studio`, og kollegaen er logget inn
- [ ] Kollegaen lager en testgren med en liten endring, og forhåndsvisningslenken dukker opp i Vercel
- [ ] Dere har avtalt hvem som jobber med hva den første uka

## Når noen slutter

Fjern personen fra GitHub-organisasjonen, Vercel-teamet og Sanity-prosjektet, og **slett nøklene** personen hadde under Sanity → API → Tokens.
