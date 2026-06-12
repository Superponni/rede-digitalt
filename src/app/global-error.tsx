'use client'

/**
 * Siste skanse: fanger feil i selve root-layouten. Rendres helt uten appens
 * CSS (global-error erstatter root-layouten), så all styling er inline.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="nb">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
          backgroundColor: '#F1F8F0',
          color: '#003865',
          fontFamily: 'Georgia, serif',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'normal', margin: 0 }}>
          Noe gikk galt
        </h1>
        <p style={{ maxWidth: '28rem', lineHeight: 1.6, opacity: 0.75 }}>
          Vi klarte ikke å vise siden akkurat nå. Prøv igjen om et øyeblikk.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '24px',
            padding: '12px 28px',
            border: '1px solid #003865',
            background: 'transparent',
            color: '#003865',
            font: 'inherit',
            fontSize: '0.8rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Prøv igjen
        </button>
        <a
          href="/"
          style={{
            marginTop: '20px',
            color: '#003865',
            fontSize: '0.8rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Til forsiden
        </a>
      </body>
    </html>
  )
}
