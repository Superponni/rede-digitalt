import { ImageResponse } from 'next/og'
import { siteDescription } from '@/lib/site'

// Merket standard-delebilde for hele siden. Brukes på forside, tema- og om-sider
// — og som fallback på artikler uten eget bilde. Artikler med hovedbilde
// overstyrer dette med selve fotoet (se generateMetadata i artikkel-siden).
// Selvstendig (ingen eksterne fonter/bilder) → kan ikke feile ved deling.

export const alt = 'Rede – Et magasin for TOBB-medlemmer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const NAVY = '#003865'
const GOLD = '#F6BE00'
const MINT = '#F1F8F0'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: NAVY,
          padding: '72px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 64, height: 6, backgroundColor: GOLD }} />
          <div
            style={{
              marginLeft: 20,
              color: MINT,
              fontSize: 22,
              letterSpacing: 8,
              textTransform: 'uppercase',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            TOBB
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: MINT, fontSize: 200, lineHeight: 1, fontWeight: 400 }}>
            Rede
          </div>
          <div
            style={{
              marginTop: 24,
              color: GOLD,
              fontSize: 34,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            {siteDescription}
          </div>
        </div>

        <div
          style={{
            color: MINT,
            opacity: 0.6,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          Et magasin for TOBB-medlemmer
        </div>
      </div>
    ),
    size,
  )
}
