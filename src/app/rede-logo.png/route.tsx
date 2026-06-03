import { ImageResponse } from 'next/og'

// Rede-logoen som bilde, til strukturerte data (Organization.logo) og deling.
// «Rede» settes i Georgia serif — prosjektets egen erklærte fallback for
// display-fonten Gastromond (se globals.css: `--font-display`), som lastes via
// Adobe Fonts og ikke kan bakes inn her av lisenshensyn. Lys mint bakgrunn med
// navy ordmerke gjør at logoen leser godt i Googles hvite kunnskapspaneler.

export const dynamic = 'force-static'

const NAVY = '#003865'
const GOLD = '#F6BE00'
const MINT = '#F1F8F0'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: MINT,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ color: NAVY, fontSize: 240, lineHeight: 1, fontWeight: 400 }}>
          Rede
        </div>
        <div style={{ width: 200, height: 10, backgroundColor: GOLD, marginTop: 28 }} />
        <div
          style={{
            marginTop: 28,
            color: NAVY,
            opacity: 0.7,
            fontSize: 34,
            letterSpacing: 14,
            textTransform: 'uppercase',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          TOBB
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  )
}
