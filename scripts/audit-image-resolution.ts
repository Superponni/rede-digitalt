/**
 * Leser ut dimensjonene på alle hovedbilder (article.heroImage,
 * editorial.heroImage, expertPortrait) fra Sanity og flagger lavoppløselige.
 * Read-only — ingen skriving.
 *
 * Terskler (lengste kant):
 *   - Heldekkende topp (image-first/heading-first): bør være ≥ 2400px
 *   - Andre (side/portrett/kort): bør være ≥ 1600px
 */
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  perspective: 'published',
})

type Dim = { width: number; height: number }
type ImgInfo = { filename?: string; dimensions?: Dim } | null

function longEdge(d?: Dim) {
  return d ? Math.max(d.width, d.height) : 0
}

function verdict(longest: number, fullBleed: boolean): string {
  const min = fullBleed ? 2400 : 1600
  if (longest === 0) return '—'
  if (longest < min) return `⚠️  LAV (bør ≥ ${min})`
  return '✓ ok'
}

async function main() {
  const articles: {
    title: string
    slug?: { current: string }
    heroLayout?: string
    hero?: ImgInfo
    portrait?: ImgInfo
  }[] = await sanity.fetch(`*[_type=="article"]|order(title asc){
    title, slug, heroLayout,
    "hero": heroImage.asset->{ "filename": originalFilename, "dimensions": metadata.dimensions },
    "portrait": expertPortrait.asset->{ "filename": originalFilename, "dimensions": metadata.dimensions }
  }`)

  const editorials: { title: string; hero?: ImgInfo }[] = await sanity.fetch(`*[_type=="editorial"]{
    title, "hero": heroImage.asset->{ "filename": originalFilename, "dimensions": metadata.dimensions }
  }`)

  console.log('\n=== ARTIKLER — hovedbilde ===\n')
  const flagged: string[] = []
  for (const a of articles) {
    const fullBleed = a.heroLayout === 'image-first' || a.heroLayout === 'heading-first' || !a.heroLayout
    const le = longEdge(a.hero?.dimensions)
    const v = verdict(le, fullBleed)
    const dim = a.hero?.dimensions ? `${a.hero.dimensions.width}×${a.hero.dimensions.height}` : 'ingen'
    console.log(`${v.startsWith('⚠') ? '⚠️ ' : '   '}${(a.slug?.current || a.title).padEnd(34)} [${(a.heroLayout || 'image-first').padEnd(13)}] ${dim.padEnd(11)} ${v}`)
    if (v.startsWith('⚠')) flagged.push(`${a.slug?.current} (hovedbilde ${dim})`)

    // Ekspert-/portrettbilde der det finnes
    if (a.portrait?.dimensions) {
      const ple = longEdge(a.portrait.dimensions)
      const pv = verdict(ple, false)
      const pdim = `${a.portrait.dimensions.width}×${a.portrait.dimensions.height}`
      console.log(`   ${''.padEnd(34)}  portrett:    ${pdim.padEnd(11)} ${pv}`)
      if (pv.startsWith('⚠')) flagged.push(`${a.slug?.current} (portrett ${pdim})`)
    }
  }

  console.log('\n=== LEDER — hovedbilde ===\n')
  for (const e of editorials) {
    const le = longEdge(e.hero?.dimensions)
    const v = verdict(le, true)
    const dim = e.hero?.dimensions ? `${e.hero.dimensions.width}×${e.hero.dimensions.height}` : 'ingen'
    console.log(`${v.startsWith('⚠') ? '⚠️ ' : '   '}${e.title.padEnd(34)} ${dim.padEnd(11)} ${v}`)
    if (v.startsWith('⚠')) flagged.push(`leder "${e.title}" (${dim})`)
  }

  console.log('\n=== OPPSUMMERING ===')
  if (flagged.length === 0) {
    console.log('✓ Ingen lavoppløselige hovedbilder funnet.')
  } else {
    console.log(`⚠️  ${flagged.length} bilde(r) bør re-lastes i høyere oppløsning:`)
    flagged.forEach((f) => console.log('   •', f))
  }
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
