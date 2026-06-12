/**
 * Fjerner foreldreløse felt fra seksjonsobjekter i alle dokumenter.
 *
 * Bakgrunn: per-seksjon `backgroundColor` og `transition` ble fjernet fra
 * skjemaet da scrolly gikk over til standardartiklenes accentColor + colorMode.
 * Gamle dokumenter bærer fortsatt verdiene, så Studio viser «Ukjente felter
 * funnet» (se feature-artikler). Frontend overskriver uansett backgroundColor
 * ved rendering (ScrollytellingRenderer) og leser aldri transition — så å
 * fjerne dem endrer INGENTING visuelt. Det rydder bare bort død data + advarsel.
 *
 * Trygghet:
 *  - Rører kun felt med navn i ORPHAN_FIELDS, og kun på objekter hvis _type er
 *    en kjent seksjonstype (SECTION_TYPES). Ingenting annet røres.
 *  - Idempotent: dokumenter uten foreldreløse felt hoppes over.
 *  - --dry skriver ingenting, bare rapporterer hva som ville blitt fjernet.
 *  - Skriver til samme _id som finnes (utkast og/eller publisert hver for seg).
 */
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const DRY = process.argv.includes('--dry')

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

// Seksjonstypene som finnes i scrolly/feature-artikler (SECTION_MAP i frontend).
const SECTION_TYPES = new Set([
  'heroSection',
  'textWithImage',
  'fullscreenParallax',
  'pullQuote',
  'videoSection',
  'audioSection',
  'factBox',
  'gallery',
  'stickyPortrait',
  'recipeCard',
  'countUpFact',
  'numberedStop',
  'interactiveQuiz',
])

// Feltene som er fjernet fra skjemaet og skal renses bort fra dataene.
const ORPHAN_FIELDS = ['backgroundColor', 'transition']

/* eslint-disable @typescript-eslint/no-explicit-any */
type Node = Record<string, any>

interface Removal {
  type: string
  field: string
  value: any
}

/**
 * Går rekursivt gjennom et tre. Når et objekt har et seksjons-_type fjernes
 * foreldreløse felt fra DET objektet. Returnerer liste over hva som ble fjernet
 * (muterer treet på stedet for enkelhets skyld — vi jobber på en hentet kopi).
 */
function strip(node: any, removals: Removal[]): void {
  if (Array.isArray(node)) {
    node.forEach((n) => strip(n, removals))
    return
  }
  if (node && typeof node === 'object') {
    if (typeof node._type === 'string' && SECTION_TYPES.has(node._type)) {
      for (const field of ORPHAN_FIELDS) {
        if (field in node) {
          removals.push({ type: node._type, field, value: node[field] })
          delete node[field]
        }
      }
    }
    // Gå videre nedover uansett (seksjoner kan i teorien nestes).
    for (const value of Object.values(node)) strip(value, removals)
  }
}

async function main() {
  console.log(DRY ? '🔍 DRY-RUN (skriver ingenting)\n' : '✍️  Skriver til Sanity\n')

  // Hent ALLE dokumenter (token gir rå-perspektiv inkl. utkast).
  const docs: Node[] = await sanity.fetch('*[!(_type match "sanity.*")]')

  let touched = 0
  let totalRemoved = 0

  for (const doc of docs) {
    const removals: Removal[] = []
    strip(doc, removals)
    if (removals.length === 0) continue

    touched++
    totalRemoved += removals.length
    const byField = removals.reduce<Record<string, number>>((acc, r) => {
      acc[r.field] = (acc[r.field] || 0) + 1
      return acc
    }, {})
    console.log(`📄 ${doc._id}  (${doc._type})`)
    console.log(
      `   fjerner: ${Object.entries(byField)
        .map(([f, n]) => `${f}×${n}`)
        .join(', ')}`
    )

    if (!DRY) {
      await sanity.createOrReplace(doc as any)
      console.log('   ✓ lagret')
    }
  }

  console.log(
    `\n${DRY ? '🔍' : '✅'} ${touched} dokument(er) berørt, ${totalRemoved} felt ${
      DRY ? 'ville blitt fjernet' : 'fjernet'
    }.`
  )
  if (touched === 0) console.log('   Ingenting å rydde — alt er allerede rent.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
