/**
 * Lager forsidebilde for forkjøpsrett-saken: lys blå canvas (#D3E4F5) + den gule
 * nøkkel-illustrasjonen, sentrert med en liten skråstilling. Laster opp til Sanity
 * og PATCHER (ikke replace) utkastets heroImage — rører ikke teksten din.
 *
 *   node scripts/make-forkjopsrett-cover.mjs
 */
import sharp from 'sharp'
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const SIZE = 1600
const BG = '#D3E4F5'
const keyPath = path.join(root, 'public/forkjopsrett/icons/nokkel.svg')

// 1) Nøkkelen → PNG, skarp (høy density), litt skråstilt, gjennomsiktig bakgrunn
const keyBuf = await sharp(keyPath, { density: 320 })
  .resize({ width: 880 })
  .rotate(-8, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

// 2) Lys blå flate + nøkkel sentrert
const coverBuf = await sharp({
  create: { width: SIZE, height: SIZE, channels: 4, background: BG },
})
  .composite([{ input: keyBuf, gravity: 'center' }])
  .png()
  .toBuffer()

// Lagre en lokal kopi for referanse
const localPath = path.join(root, 'public/forkjopsrett/cover-forkjopsrett.png')
await sharp(coverBuf).toFile(localPath)
console.log('Lokal kopi:', localPath, `(${(coverBuf.length / 1024).toFixed(0)} KB)`)

// 3) Last opp til Sanity + patch utkastets heroImage (kun det feltet)
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'tqfezovu',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const asset = await client.assets.upload('image', coverBuf, {
  filename: 'forkjopsrett-cover.png',
  contentType: 'image/png',
})
console.log('Asset lastet opp:', asset._id)

const res = await client
  .patch('drafts.article-forkjopsrett')
  .set({
    heroImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: 'Gull-nøkkel på lys blå bakgrunn',
    },
  })
  .commit()

console.log('heroImage satt på:', res._id)
