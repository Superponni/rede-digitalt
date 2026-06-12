/**
 * Gjenbrukbart tema-script for standard-artikler (utrullingen).
 * Setter signaturfarge / fargemodus / topp-oppsett (+ valgfri undertittel) på
 * BÅDE publisert og utkast. Endrer ALDRI brødtekst. Idempotent.
 *
 * Bruk:
 *   node scripts/set-article-theme.mjs <slug> accent=teal mode=light hero=side
 *   node scripts/set-article-theme.mjs <slug> accent=blue mode=tinted hero=image-first subtitle="..."
 *   ... legg til --dry for å bare vise
 */
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const slug = args.find((a) => !a.includes('=') && a !== '--dry')
const kv = Object.fromEntries(
  args
    .filter((a) => a.includes('='))
    .map((a) => {
      const i = a.indexOf('=')
      return [a.slice(0, i), a.slice(i + 1)]
    })
)

const ACCENTS = ['navy', 'teal', 'purple', 'magenta', 'blue', 'green', 'gold']
const MODES = ['light', 'tinted', 'filled', 'dark']
const HEROS = ['image-first', 'heading-first', 'side', 'none']

function fail(msg) {
  console.error('❌', msg)
  process.exit(1)
}

if (!slug) fail('Mangler slug. Bruk: node scripts/set-article-theme.mjs <slug> accent= mode= hero=')
if (kv.accent && !ACCENTS.includes(kv.accent)) fail(`Ugyldig accent: ${kv.accent} (${ACCENTS})`)
if (kv.mode && !MODES.includes(kv.mode)) fail(`Ugyldig mode: ${kv.mode} (${MODES})`)
if (kv.hero && !HEROS.includes(kv.hero)) fail(`Ugyldig hero: ${kv.hero} (${HEROS})`)

const set = {}
if (kv.accent) set.accentColor = kv.accent
if (kv.mode) set.colorMode = kv.mode
if (kv.hero) set.heroLayout = kv.hero
if (kv.subtitle != null) set.subtitle = kv.subtitle

async function main() {
  const docs = await sanity.fetch(
    `*[_type=="article" && slug.current==$s]{_id,title,accentColor,colorMode,heroLayout,"hero":heroImage.asset._ref}`,
    { s: slug }
  )
  if (!docs.length) fail(`Fant ingen artikkel med slug «${slug}»`)

  const pub = docs.find((d) => !d._id.startsWith('drafts.')) || docs[0]
  console.log(`📄 ${pub.title}  [${slug}]`)
  console.log('   nå:  ', JSON.stringify({ accent: pub.accentColor, mode: pub.colorMode, hero: pub.heroLayout }))
  console.log('   ny:  ', JSON.stringify(set))
  const dims = pub.hero?.match(/-(\d+)x(\d+)-/)
  console.log('   hovedbilde:', pub.hero ? `${dims?.[1]}x${dims?.[2]}` : 'INGEN')

  if (DRY) return console.log('\n(dry — ingenting skrevet)')

  const tx = sanity.transaction()
  for (const d of docs) tx.patch(d._id, (p) => p.set(set))
  await tx.commit()
  console.log(`\n✅ Oppdatert ${docs.length} dok (publisert${docs.length > 1 ? ' + utkast' : ''}).`)
}

main().catch((e) => fail(e.message))
