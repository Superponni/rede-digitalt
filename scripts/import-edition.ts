/**
 * Import-script for Rede-utgaver (manifest-drevet)
 *
 * Leser docx-filer, analyserer med Claude, laster opp bilder,
 * og oppretter alt innhold i Sanity.
 *
 * VIKTIG — kilde til sannhet:
 *   Dette er et ENGANGS-seedingverktøy, ikke en synk. Sanity er fasit for
 *   alt publisert/levende innhold. Drive-mappa er journalistens råarkiv som
 *   vi kun LESER — vi skriver aldri tilbake til den.
 *   Skriptet bruker deterministiske _id og HOPPER OVER artikler som allerede
 *   finnes i Sanity, slik at en re-kjøring aldri dupliserer eller overskriver
 *   redaktørens arbeid. Se docs/migrasjon-superponni.md.
 *
 * Hvilken utgave? Velges via et manifest i scripts/editions/. Manifestet er
 * oversettelseslaget mellom journalistens (rotete) Drive-navn og Sanity, og
 * er det eneste «våre» — selve råfilene rører vi aldri.
 *
 * Tørrkjør (validér manifest mot innholdsmappa, ingen Sanity/Claude):
 *   npx tsx scripts/import-edition.ts --edition=2-2026 --dry-run
 *
 * Kjør (trygt, hopper over eksisterende):
 *   npx tsx scripts/import-edition.ts --edition=2-2026
 *
 * Tving overskriving av eksisterende artikler (BRUK MED OMHU — ødelegger
 * redaksjonelle endringer i Sanity):
 *   npx tsx scripts/import-edition.ts --edition=2-2026 --force
 *
 * Målrettet re-import av ÉN artikkel (trygt — rører ikke de andre):
 *   npx tsx scripts/import-edition.ts --edition=2-2026 --force --only=gronn-plattform
 *
 * Pek på innholdsmappe i delt Drive (basemappe over utgavemappene):
 *   REDE_CONTENT_DIR="/sti/til/REDE/Rede 2026" npx tsx scripts/import-edition.ts --edition=2-2026
 *   eller eksakt utgavemappe: --content="/sti/til/Rede 2 2026"
 *   eller eksplisitt manifest: --manifest="/sti/til/manifest.json"
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@sanity/client'
import mammoth from 'mammoth'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

// --- Config ---

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Tving overskriving av eksisterende artikler (default: hopp over).
const FORCE = process.argv.includes('--force')

// Tørrkjøring: valider manifest + at filene finnes (i Drive/lokalt) uten å
// kontakte Sanity eller Claude. Trygt å kjøre når som helst.
const DRY_RUN = process.argv.includes('--dry-run')

// Begrens til én artikkel (slug). Sammen med --force gir dette en målrettet
// re-import av kun den artikkelen, uten å røre de andre i Sanity.
const ONLY = (() => {
  const a = process.argv.find((x) => x.startsWith('--only='))
  return a ? a.split('=').slice(1).join('=') : undefined
})()

function argValue(flag: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`${flag}=`))
  return a ? a.split('=').slice(1).join('=') : undefined
}

// --- Article definitions ---

interface ArticleDef {
  folder: string
  docxFiles: string[]
  title: string
  type: 'scrollytelling' | 'standard'
  imageDir?: string
  slug: string
  tags: string[]
}

interface EditionManifest {
  edition: {
    id: string
    title: string
    number: number
    year: number
    publishedAt: string
  }
  editionFolder: string
  tags: string[]
  articles: ArticleDef[]
}

// --- Velg utgave via manifest ---
//   --edition=2-2026   → scripts/editions/rede-2-2026.json
//   --manifest=<sti>   → eksplisitt manifestfil
const editionArg = argValue('--edition') ?? '2-2026'
const manifestPath = path.resolve(
  argValue('--manifest') ??
    path.join(process.cwd(), 'scripts', 'editions', `rede-${editionArg}.json`)
)

if (!fs.existsSync(manifestPath)) {
  console.error(`❌ Fant ikke manifest: ${manifestPath}`)
  console.error('   Bruk --edition=<nr-år> (f.eks. 2-2026) eller --manifest=<sti>.')
  process.exit(1)
}

const MANIFEST: EditionManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
const EDITION = MANIFEST.edition
const ARTICLES: ArticleDef[] = MANIFEST.articles
const TAG_LIST: string[] = MANIFEST.tags

// Innholdsmappe (journalistens råmateriale). Oppløsning:
//   1. --content="<eksakt utgavemappe>"             (overstyrer alt)
//   2. REDE_CONTENT_DIR=<basemappe> + editionFolder  (f.eks. Drive «…/Rede 2026»)
//   3. lokal content/<editionFolder>                 (fallback)
const contentArg = argValue('--content')
const CONTENT_DIR = path.resolve(
  contentArg ??
    (process.env.REDE_CONTENT_DIR
      ? path.join(process.env.REDE_CONTENT_DIR, MANIFEST.editionFolder)
      : path.join(process.cwd(), 'content', MANIFEST.editionFolder))
)

// --- Helpers ---

async function readDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath })
  return result.value
}

async function findImages(dir: string): Promise<string[]> {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir)
  return files
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map((f) => path.join(dir, f))
    .slice(0, 8) // Max 8 bilder per artikkel for å spare tid/plass
}

async function uploadImage(
  filePath: string,
  filename: string
): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } }> {
  const buffer = fs.readFileSync(filePath)
  const asset = await sanity.assets.upload('image', buffer, {
    filename,
    contentType: filePath.toLowerCase().endsWith('.png')
      ? 'image/png'
      : 'image/jpeg',
  })
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
  }
}

function textToPortableText(text: string) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return paragraphs.map((p) => {
    // Detect headings (short lines, no period at end)
    const isHeading =
      p.length < 80 &&
      !p.endsWith('.') &&
      !p.endsWith(',') &&
      !p.startsWith('–') &&
      !p.startsWith('"') &&
      !p.startsWith('«')

    return {
      _type: 'block',
      _key: randomKey(),
      style: isHeading ? 'h2' : 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: randomKey(),
          text: p.replace(/\n/g, ' '),
          marks: [],
        },
      ],
    }
  })
}

function randomKey(): string {
  return Math.random().toString(36).substring(2, 10)
}

// --- AI Analysis ---

async function analyzeArticle(
  text: string,
  title: string,
  type: 'scrollytelling' | 'standard',
  imageCount: number
): Promise<{
  teaser: string
  ogDescription: string
  estimatedReadTime: number
  sections?: Array<{
    _type: string
    [key: string]: unknown
  }>
}> {
  const sectionPrompt =
    type === 'scrollytelling'
      ? `
Lag også en sections-array for scrollytelling. Bruk disse seksjonstypene:
- heroSection: {_type: "heroSection", title: string, subtitle?: string, titlePosition: "center"|"bottomLeft"|"bottomRight", imageIndex: number}
- textWithImage: {_type: "textWithImage", text: string, imageIndex: number, imagePosition: "left"|"right", imageSize: "small"|"medium"|"large"}
- fullscreenParallax: {_type: "fullscreenParallax", overlayText: string, imageIndex: number, overlayPosition: "left"|"center"|"right", darkenOverlay: number}
- pullQuote: {_type: "pullQuote", quote: string, attribution?: string, style: "large"|"decorated"|"minimal"}
- factBox: {_type: "factBox", title: string, content: string, style: "highlight"|"sidebar"|"fullWidth"}
- gallery: {_type: "gallery", imageIndices: number[], layout: "grid"|"carousel"|"masonry"}

Det er ${imageCount} bilder tilgjengelig (indeks 0-${imageCount - 1}).
Bruk imageIndex for å referere til bilder. Første bilde (indeks 0) bør brukes i hero.
Lag 5-8 seksjoner med god variasjon. Varier overganger.`
      : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Analyser denne norske magasinartikkelen og gi meg:

1. "teaser": En kort, engasjerende teaser på 1-2 setninger (norsk bokmål)
2. "ogDescription": En SEO-vennlig beskrivelse på maks 160 tegn
3. "estimatedReadTime": Estimert lesetid i minutter
${sectionPrompt}

Svar KUN med gyldig JSON, ingen annen tekst.

Tittel: ${title}

Tekst:
${text.substring(0, 6000)}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  // Parse JSON from response (handle potential markdown wrapping)
  let jsonStr = content.text.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  return JSON.parse(jsonStr)
}

// --- Build Sanity sections from AI output ---

function buildSections(
  aiSections: Array<{ _type: string; [key: string]: unknown }>,
  uploadedImages: Array<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } }>
) {
  return aiSections.map((section) => {
    const key = randomKey()

    switch (section._type) {
      case 'heroSection':
        return {
          _type: 'heroSection',
          _key: key,
          title: section.title,
          subtitle: section.subtitle,
          titlePosition: section.titlePosition || 'center',
          transition: 'none',
          image: uploadedImages[section.imageIndex as number] || uploadedImages[0],
        }

      case 'textWithImage':
        return {
          _type: 'textWithImage',
          _key: key,
          text: textToPortableText(section.text as string),
          imagePosition: section.imagePosition || 'right',
          imageSize: section.imageSize || 'medium',
          transition: 'crossfade',
          image: uploadedImages[section.imageIndex as number] || uploadedImages[1],
        }

      case 'fullscreenParallax':
        return {
          _type: 'fullscreenParallax',
          _key: key,
          overlayText: textToPortableText(section.overlayText as string),
          overlayPosition: section.overlayPosition || 'center',
          darkenOverlay: section.darkenOverlay || 40,
          transition: 'crossfade',
          backgroundImage: uploadedImages[section.imageIndex as number] || uploadedImages[0],
        }

      case 'pullQuote':
        return {
          _type: 'pullQuote',
          _key: key,
          quote: section.quote,
          attribution: section.attribution,
          style: section.style || 'large',
          transition: 'crossfade',
        }

      case 'factBox':
        return {
          _type: 'factBox',
          _key: key,
          title: section.title,
          content: textToPortableText(section.content as string),
          style: section.style || 'highlight',
          transition: 'none',
        }

      case 'gallery':
        return {
          _type: 'gallery',
          _key: key,
          layout: section.layout || 'grid',
          transition: 'crossfade',
          images: ((section.imageIndices as number[]) || []).map((idx) => {
            const img = uploadedImages[idx]
            return {
              ...img,
              _key: randomKey(),
              alt: 'Bilde fra artikkelen',
            }
          }),
        }

      default:
        console.warn(`  ⚠ Ukjent seksjonstype: ${section._type}`)
        return null
    }
  }).filter(Boolean)
}

// --- Dry-run: valider manifest mot innholdsmappa ---

async function dryRun() {
  console.log('🔎 Tørrkjøring — validerer manifest mot innholdsmappa (ingen Sanity/Claude).\n')
  console.log(`📄 Manifest: ${manifestPath}`)
  console.log(`📂 Innholdsmappe: ${CONTENT_DIR}\n`)

  let problems = 0

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`❌ Finner ikke innholdsmappa: ${CONTENT_DIR}`)
    console.error('   Sjekk REDE_CONTENT_DIR / --content, og at Drive er montert.')
    process.exit(1)
  }

  for (const article of ARTICLES) {
    console.log(`📝 ${article.title}  (${article.type})  →  ${article.folder}`)

    const folderPath = path.join(CONTENT_DIR, article.folder)
    if (!fs.existsSync(folderPath)) {
      problems++
      console.log(`   ✗ MAPPE MANGLER: ${article.folder}\n`)
      continue
    }

    for (const docx of article.docxFiles) {
      const ok = fs.existsSync(path.join(folderPath, docx))
      if (!ok) problems++
      console.log(`   ${ok ? '✓' : '✗'} docx: ${docx}`)
    }

    if (article.imageDir) {
      const dir = path.join(folderPath, article.imageDir)
      if (!fs.existsSync(dir)) {
        problems++
        console.log(`   ✗ bildemappe MANGLER: ${article.imageDir}`)
      } else {
        const imgs = await findImages(dir)
        console.log(`   ✓ bildemappe: ${article.imageDir} (${imgs.length} bilder lest, maks 8 brukes)`)
      }
    }

    const direct = await findImages(folderPath)
    if (direct.length) console.log(`   · ${direct.length} løse bilder direkte i mappa`)
    console.log('')
  }

  console.log(
    problems === 0
      ? '✅ Tørrkjøring OK — alle filer i manifestet ble funnet.'
      : `⚠️  Tørrkjøring fant ${problems} problem(er) — rett manifest eller sjekk Drive-navn.`
  )
  if (problems > 0) process.exit(1)
}

// --- Main import ---

async function main() {
  if (DRY_RUN) {
    await dryRun()
    return
  }

  console.log(`🚀 Starter import av ${EDITION.title}\n`)

  console.log(
    FORCE
      ? '⚠️  --force aktiv: eksisterende artikler vil OVERSKRIVES\n'
      : 'ℹ️  Trygg modus: eksisterende artikler hoppes over (bruk --force for å overskrive)\n'
  )
  console.log(`📄 Manifest: ${manifestPath}`)
  console.log(`📂 Innholdsmappe: ${CONTENT_DIR}\n`)

  // 1. Create edition (deterministisk _id → gjenbrukes ved re-kjøring)
  console.log('📖 Oppretter utgave...')
  const edition = await sanity.createIfNotExists({
    _id: EDITION.id,
    _type: 'edition',
    title: EDITION.title,
    number: EDITION.number,
    year: EDITION.year,
    publishedAt: EDITION.publishedAt,
  })
  console.log(`   ✓ Utgave: ${edition._id}\n`)

  // 2. Create tags
  console.log('🏷️  Oppretter tags...')
  const tagMap: Record<string, string> = {}
  for (const tagName of TAG_LIST) {
    const existing = await sanity.fetch(
      `*[_type == "tag" && title == $title][0]._id`,
      { title: tagName }
    )
    if (existing) {
      tagMap[tagName] = existing
      console.log(`   ✓ ${tagName} (eksisterer)`)
    } else {
      const tag = await sanity.create({
        _type: 'tag',
        title: tagName,
        slug: { _type: 'slug', current: tagName },
      })
      tagMap[tagName] = tag._id
      console.log(`   ✓ ${tagName}`)
    }
  }
  console.log('')

  // 3. Import articles
  for (const article of ARTICLES) {
    // Målrettet re-import: hopp over alt unntatt valgt slug.
    if (ONLY && article.slug !== ONLY) continue

    console.log(`📝 ${article.title} (${article.type})`)

    // Deterministisk _id slik at re-kjøring treffer samme dokument.
    const articleId = `article-${article.slug}`

    // Sanity er fasit: ikke rør artikler som allerede finnes (med mindre
    // --force). Sjekkes FØR bildeopplasting for å unngå foreldreløse assets.
    if (!FORCE) {
      const exists = await sanity.fetch(`*[_id == $id][0]._id`, {
        id: articleId,
      })
      if (exists) {
        console.log(`   ⏭  Finnes i Sanity (${articleId}) — hopper over\n`)
        continue
      }
    }

    // Read docx
    let fullText = ''
    for (const docx of article.docxFiles) {
      const docxPath = path.join(CONTENT_DIR, article.folder, docx)
      if (fs.existsSync(docxPath)) {
        const text = await readDocx(docxPath)
        fullText += text + '\n\n'
      } else {
        console.warn(`   ⚠ Finner ikke: ${docxPath}`)
      }
    }
    fullText = fullText.trim()

    if (!fullText) {
      console.warn(`   ⚠ Ingen tekst funnet, hopper over`)
      continue
    }

    // Find and upload images
    const uploadedImages: Array<{
      _type: 'image'
      asset: { _type: 'reference'; _ref: string }
    }> = []

    if (article.imageDir) {
      const imageDir = path.join(CONTENT_DIR, article.folder, article.imageDir)
      const imagePaths = await findImages(imageDir)
      console.log(`   📷 ${imagePaths.length} bilder funnet`)

      for (const imgPath of imagePaths) {
        try {
          const filename = path.basename(imgPath)
          console.log(`   ↑ ${filename}`)
          const img = await uploadImage(imgPath, filename)
          uploadedImages.push(img)
        } catch (err) {
          console.error(`   ✗ Feil ved opplasting: ${(err as Error).message}`)
        }
      }
    }

    // Also check for images directly in the article folder
    const directImages = await findImages(
      path.join(CONTENT_DIR, article.folder)
    )
    const newDirectImages = directImages.filter(
      (img) =>
        !uploadedImages.length ||
        !article.imageDir ||
        !img.includes(article.imageDir)
    )
    for (const imgPath of newDirectImages.slice(0, 3)) {
      try {
        const filename = path.basename(imgPath)
        console.log(`   ↑ ${filename} (direkte)`)
        const img = await uploadImage(imgPath, filename)
        uploadedImages.push(img)
      } catch (err) {
        console.error(`   ✗ Feil: ${(err as Error).message}`)
      }
    }

    // AI analysis
    console.log(`   🤖 Analyserer med Claude...`)
    let analysis
    try {
      analysis = await analyzeArticle(
        fullText,
        article.title,
        article.type,
        uploadedImages.length
      )
      console.log(`   ✓ Teaser: "${analysis.teaser.substring(0, 60)}..."`)
    } catch (err) {
      console.error(`   ✗ AI-analyse feilet: ${(err as Error).message}`)
      analysis = {
        teaser: fullText.substring(0, 150) + '...',
        ogDescription: article.title,
        estimatedReadTime: Math.ceil(fullText.split(/\s+/).length / 200),
      }
    }

    // Build Sanity document
    const doc: Record<string, unknown> & { _id: string; _type: string } = {
      _id: articleId,
      _type: 'article',
      title: article.title,
      slug: { _type: 'slug', current: article.slug },
      type: article.type,
      edition: { _type: 'reference', _ref: edition._id },
      publishedAt: EDITION.publishedAt,
      tags: article.tags.map((t) => ({
        _type: 'reference',
        _ref: tagMap[t],
        _key: randomKey(),
      })),
      teaser: analysis.teaser,
      // Søkebeskrivelse legges i seo-objektet (redaktør-fanen «Deling & søk»).
      seo: { _type: 'seo', metaDescription: analysis.ogDescription },
      estimatedReadTime: analysis.estimatedReadTime,
    }

    // Hero image
    if (uploadedImages.length > 0) {
      doc.heroImage = {
        ...uploadedImages[0],
        alt: article.title,
      }
    }

    // Content: sections for scrollytelling, body for standard
    if (article.type === 'scrollytelling' && analysis.sections) {
      doc.sections = buildSections(analysis.sections, uploadedImages)
      console.log(`   ✓ ${(doc.sections as unknown[]).length} seksjoner`)
    } else {
      doc.body = textToPortableText(fullText)
    }

    // Create document. Trygg modus har allerede verifisert at den ikke finnes,
    // så create() er nok; --force overskriver bevisst med createOrReplace.
    const created = FORCE
      ? await sanity.createOrReplace(doc)
      : await sanity.create(doc)
    console.log(`   ✓ ${FORCE ? 'Skrev (force)' : 'Opprettet'}: ${created._id}\n`)
  }

  console.log('✅ Import ferdig!')
}

main().catch((err) => {
  console.error('❌ Import feilet:', err)
  process.exit(1)
})
