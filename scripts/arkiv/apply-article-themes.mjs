import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// ----- Article themes -----
// Each theme defines colors per section type, creating unique visual character.

const THEMES = {
  // Alma Mater / Fransk finesse — warm, intimate, emosjonell
  warm: {
    name: 'Varm / intim',
    hero: { backgroundColor: '#1a1008' }, // Near-black warm
    textWithImage: [
      { backgroundColor: '#1a1a10' }, // Dark warm charcoal
      { backgroundColor: '#003865' }, // Navy (contrast break)
      { backgroundColor: '#1a1008' }, // Back to warm dark
      { backgroundColor: '#0d1f30' }, // Dark blue-grey
    ],
    pullQuote: { backgroundColor: '#003865' }, // Navy — gold text pops
    factBox: { backgroundColor: '#1a1008' },
    fullscreenParallax: { backgroundColor: '#000' },
    gallery: { backgroundColor: '#1a1008' },
  },

  // Forsvarsrunden — documentary, calm, reise/utforsking
  documentary: {
    name: 'Dokumentarisk / rolig',
    hero: { backgroundColor: '#0a2520' }, // Dark forest teal
    textWithImage: [
      { backgroundColor: '#0a2520' }, // Forest teal
      { backgroundColor: '#003845' }, // Deep petrol
      { backgroundColor: '#0d2818' }, // Dark green
      { backgroundColor: '#003845' }, // Repeat
    ],
    pullQuote: { backgroundColor: '#487A7B' }, // TOBB teal
    factBox: { backgroundColor: '#0a2520' },
    fullscreenParallax: { backgroundColor: '#000' },
    gallery: { backgroundColor: '#0d2818' },
  },

  // Kjepphest — leken, energisk, fargerik
  playful: {
    name: 'Leken / energisk',
    hero: { backgroundColor: '#1a0828' }, // Dark purple
    textWithImage: [
      { backgroundColor: '#1a0828' }, // Purple-dark
      { backgroundColor: '#2a0a3a' }, // Deeper purple
      { backgroundColor: '#003865' }, // Navy (break)
      { backgroundColor: '#1a0828' }, // Back to purple
    ],
    pullQuote: { backgroundColor: '#6B3077' }, // TOBB purple
    factBox: { backgroundColor: '#2a0a3a' },
    fullscreenParallax: { backgroundColor: '#000' },
    gallery: { backgroundColor: '#1a0828' },
  },
}

// Map article titles to themes
const ARTICLE_THEMES = [
  { title: 'Fransk finesse bak disken', theme: 'warm' },
  { title: 'Forsvarsrunden', theme: 'documentary' },
  { title: 'Gøy med kjepphest', theme: 'playful' },
]

async function applyTheme(articleTitle, themeName) {
  const theme = THEMES[themeName]
  if (!theme) {
    console.log(`  Unknown theme: ${themeName}`)
    return
  }

  console.log(`\nProcessing: "${articleTitle}" → ${theme.name}`)

  const doc = await client.fetch(
    '*[_type == "article" && title == $t][0]{_id, sections}',
    { t: articleTitle }
  )
  if (!doc) {
    console.log('  NOT FOUND in Sanity')
    return
  }

  const sections = doc.sections || []
  console.log(`  Found ${sections.length} sections`)

  // Track section type counters for rotating colors
  const counters = {}

  const updated = sections.map((section) => {
    const type = section._type

    // Initialize counter for this type
    if (!counters[type]) counters[type] = 0

    let themeData = null

    if (type === 'heroSection') {
      themeData = theme.hero
    } else if (type === 'pullQuote') {
      themeData = theme.pullQuote
    } else if (type === 'factBox') {
      themeData = theme.factBox
    } else if (type === 'fullscreenParallax') {
      themeData = theme.fullscreenParallax
    } else if (type === 'gallery') {
      themeData = theme.gallery
    } else if (type === 'textWithImage') {
      const colors = theme.textWithImage
      themeData = colors[counters[type] % colors.length]
    }

    counters[type] = (counters[type] || 0) + 1

    if (themeData) {
      return { ...section, ...themeData }
    }
    return section
  })

  // Summarize changes
  const changes = sections.reduce((acc, s, i) => {
    if (updated[i].backgroundColor !== s.backgroundColor) {
      acc.push(`  ${s._type}[${i}]: ${s.backgroundColor || 'default'} → ${updated[i].backgroundColor}`)
    }
    return acc
  }, [])

  if (changes.length === 0) {
    console.log('  No color changes needed')
    return
  }

  console.log(`  Applying ${changes.length} color changes:`)
  changes.forEach((c) => console.log(c))

  await client.patch(doc._id).set({ sections: updated }).commit()
  console.log('  ✓ Updated!')
}

// Run
console.log('=== Applying article themes ===\n')
for (const { title, theme } of ARTICLE_THEMES) {
  await applyTheme(title, theme)
}
console.log('\n=== Done! ===')
