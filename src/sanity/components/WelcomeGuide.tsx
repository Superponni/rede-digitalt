'use client'

import { useState } from 'react'

/**
 * Velkomst-/veiviserskjerm som møter redaktøren når studioet åpnes.
 *
 * Registreres som en egen verktøyfane («Velkommen») i sanity.config.ts og
 * legges først, slik at studioet lander her i stedet for på en tom skjerm.
 * Ren inline-styling med TOBB-farger — ingen avhengigheter, robust over tid.
 *
 * Redaksjonell tone, ikke kort-grid: innholdet er allerede importert fra Drive
 * via en automatisk arbeidsflyt — redaktøren finpusser og publiserer.
 */

const MARINE = '#003865'
const MINT = '#F1F8F0'
const GULL = '#F6BE00'
const TEAL = '#487A7B'
const BLEK = '#cdd9cf' // hårfin skillelinje på mint-bakgrunn

type Steg = {
  tittel: string
  tekst: string
}

const innholdstyper: { navn: string; beskrivelse: string }[] = [
  {
    navn: 'Utgave',
    beskrivelse:
      'Selve magasinutgaven (f.eks. «Rede 2 2026»). Samler artiklene og styrer forsiden.',
  },
  {
    navn: 'Artikkel',
    beskrivelse:
      'Hver sak. Kan være en rik scrollytelling-historie eller en ren lesevisning, bygd av seksjoner.',
  },
  {
    navn: 'Leder',
    beskrivelse: 'Redaktørens leder for utgaven.',
  },
  {
    navn: 'Video & Podkast',
    beskrivelse:
      'Multimedia-innslag som kan ligge på forsiden og inne i artikler.',
  },
  {
    navn: 'Om-side',
    beskrivelse: 'Teksten på «Om Rede»-siden.',
  },
  {
    navn: 'Tag & Forfatter',
    beskrivelse: 'Gjenbrukbare byggeklosser du kobler til artikler.',
  },
]

const arbeidsflyt: Steg[] = [
  {
    tittel: 'Finn saken',
    tekst:
      'Gå til «Struktur»-fanen øverst og velg det du vil jobbe med — som regel en artikkel som allerede ligger klar.',
  },
  {
    tittel: 'Gå gjennom og finpuss',
    tekst:
      'Les korrektur, juster tekst, og bygg ut saken med seksjoner, bilder, video eller faktabokser. Alt lagres automatisk som utkast.',
  },
  {
    tittel: 'Forhåndsvis',
    tekst:
      'Trykk på øye-knappen øverst i dokumentet for å se nøyaktig hvordan saken blir for leseren.',
  },
  {
    tittel: 'Publiser',
    tekst:
      'Når du er fornøyd, trykk «Publish» nederst. Da går endringen live på nettsiden.',
  },
]

export function WelcomeGuide() {
  const [lukket, setLukket] = useState(false)

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        background: MINT,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '72px 32px 96px',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          color: MARINE,
        }}
      >
        {/* Topp */}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: TEAL,
            fontWeight: 600,
          }}
        >
          Redaksjonsverktøy
        </p>
        <h1
          style={{
            margin: '10px 0 0',
            fontSize: 46,
            lineHeight: 1.04,
            fontWeight: 700,
            color: MARINE,
            maxWidth: 560,
          }}
        >
          Velkommen til Rede&nbsp;Digitalt
        </h1>
        <p
          style={{
            margin: '20px 0 0',
            fontSize: 19,
            lineHeight: 1.55,
            maxWidth: 600,
            color: '#234',
          }}
        >
          Dette er redaksjonsverktøyet der den digitale utgaven av Rede bygges.
          Det meste av innholdet er allerede hentet inn for deg — din jobb er å
          finpusse og publisere.
        </p>

        {/* Hvor innholdet kommer fra */}
        <Seksjon tittel="Hvor innholdet kommer fra">
          <p style={brodtekst}>
            Du begynner sjelden på blanke ark. Journalistene leverer tekst og
            bilder i Drive, og en{' '}
            <strong style={{ color: MARINE }}>automatisk arbeidsflyt</strong>{' '}
            henter inn råmaterialet og gjør det om til ferdige{' '}
            <strong style={{ color: MARINE }}>artikkelutkast</strong> her inne.
            Utkastene ligger altså klare til gjennomgang.
          </p>
          <p style={{ ...brodtekst, marginTop: 14 }}>
            Du kan selvsagt også lage noe helt nytt selv — for eksempel en video
            eller en sak som ikke kom fra Drive. Da starter du bare et nytt
            dokument med <strong style={{ color: MARINE }}>+</strong>-knappen.
          </p>
        </Seksjon>

        {/* Din jobb i studioet — redaksjonell nummerert liste */}
        <Seksjon tittel="Din jobb i studioet">
          <ol
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {arbeidsflyt.map((steg, i) => (
              <li
                key={steg.tittel}
                style={{
                  display: 'flex',
                  gap: 20,
                  padding: '18px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${BLEK}`,
                }}
              >
                <span
                  style={{
                    flex: '0 0 auto',
                    fontSize: 30,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: GULL,
                    width: 34,
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3
                    style={{
                      margin: '2px 0 4px',
                      fontSize: 17,
                      fontWeight: 700,
                      color: MARINE,
                    }}
                  >
                    {steg.tittel}
                  </h3>
                  <p style={{ ...brodtekst, fontSize: 15 }}>{steg.tekst}</p>
                </div>
              </li>
            ))}
          </ol>
        </Seksjon>

        {/* Innholdstypene — redaksjonell definisjonsliste */}
        <Seksjon tittel="Innholdstypene">
          <dl style={{ margin: 0 }}>
            {innholdstyper.map((t, i) => (
              <div
                key={t.navn}
                style={{
                  display: 'flex',
                  gap: 24,
                  padding: '14px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${BLEK}`,
                  alignItems: 'baseline',
                }}
              >
                <dt
                  style={{
                    flex: '0 0 150px',
                    fontSize: 16,
                    fontWeight: 700,
                    color: MARINE,
                  }}
                >
                  {t.navn}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.5,
                    color: '#334',
                  }}
                >
                  {t.beskrivelse}
                </dd>
              </div>
            ))}
          </dl>
        </Seksjon>

        {/* Bra å vite — én rolig fargeblokk, ikke kort */}
        <div
          style={{
            marginTop: 52,
            background: MARINE,
            color: '#fff',
            borderRadius: 6,
            padding: '28px 30px',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: 19,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Bra å vite
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Punkt tekst="Du kan ikke ødelegge noe. Alt lagres som utkast, og ingenting publiseres uten at du trykker «Publish»." />
            <Punkt tekst="Det som er publisert her, er fasiten — det er dette leserne ser. Råmaterialet ligger trygt i Drive." />
            <Punkt tekst="Står du fast? Den fyldige «les meg»-en ligger i prosjektmappen i Drive, og Superponni hjelper deg gjerne." />
          </div>
        </div>

        {/* Avslutning */}
        {!lukket && (
          <div
            style={{
              marginTop: 36,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 15, color: '#334' }}>
              Klar til å begynne? Gå til{' '}
              <strong style={{ color: MARINE }}>Struktur</strong>-fanen øverst.
            </span>
            <button
              type="button"
              onClick={() => setLukket(true)}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: `1px solid ${TEAL}`,
                color: TEAL,
                borderRadius: 4,
                padding: '8px 14px',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Skjul tipset
            </button>
          </div>
        )}

        <p
          style={{
            marginTop: 56,
            fontSize: 12.5,
            color: '#789',
            borderTop: `1px solid ${BLEK}`,
            paddingTop: 18,
          }}
        >
          Rede Digitalt — TOBBs medlemsmagasin · bygget av Superponni
        </p>
      </div>
    </div>
  )
}

const brodtekst: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.6,
  color: '#334',
}

function Seksjon({
  tittel,
  children,
}: {
  tittel: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginTop: 50 }}>
      <h2
        style={{
          margin: '0 0 14px',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: TEAL,
        }}
      >
        {tittel}
      </h2>
      {children}
    </section>
  )
}

function Punkt({ tekst }: { tekst: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span
        style={{
          marginTop: 7,
          flex: '0 0 auto',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: GULL,
        }}
      />
      <span style={{ fontSize: 14.5, lineHeight: 1.55 }}>{tekst}</span>
    </div>
  )
}
