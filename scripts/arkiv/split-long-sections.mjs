import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { randomBytes } from 'crypto'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

function key() {
  return randomBytes(6).toString('hex')
}

async function splitAlmaMater() {
  console.log('=== Splitting long sections in "Fransk finesse bak disken" ===\n')

  const doc = await client.fetch(
    '*[_type == "article" && title == "Fransk finesse bak disken"][0]{_id, sections}'
  )
  if (!doc) {
    console.log('Article not found')
    return
  }

  const sections = doc.sections
  const s6 = sections[6] // The long textWithImage with 17 blocks
  const gallery = sections[7] // The gallery with 4 images

  if (!s6 || s6._type !== 'textWithImage') {
    console.log('Section 6 is not textWithImage, aborting')
    return
  }

  const blocks = s6.text || []
  console.log(`Section 6 has ${blocks.length} text blocks`)
  console.log(`Gallery has ${(gallery?.images || []).length} images\n`)

  // Split into 3 parts:
  // Part 1: blocks 0-5 (Frankrike, boutique, møtet med Christina)
  // Part 2: blocks 6-8 (Tilbake i Trondheim, Sellanraa, YellowKorner)
  // Part 3: blocks 9-16 (Bak disken, ost, vin, anbefaling)

  const galleryImages = gallery?.images || []

  // Part 1: keep original image from s6, first 6 blocks
  const part1 = {
    ...s6,
    _key: key(),
    text: blocks.slice(0, 6),
    // Keep original image
  }

  // Part 2: use gallery image 0, blocks 6-8
  const part2 = {
    _type: 'textWithImage',
    _key: key(),
    text: blocks.slice(6, 9),
    backgroundColor: s6.backgroundColor,
    image: galleryImages[0] ? {
      _type: 'image',
      asset: galleryImages[0].asset,
      alt: galleryImages[0].alt || 'Alma Mater',
      caption: galleryImages[0].caption,
      photographer: galleryImages[0].photographer,
      hotspot: galleryImages[0].hotspot,
    } : undefined,
  }

  // Part 3: use gallery image 1, blocks 9-16
  const part3 = {
    _type: 'textWithImage',
    _key: key(),
    text: blocks.slice(9),
    backgroundColor: s6.backgroundColor,
    image: galleryImages[1] ? {
      _type: 'image',
      asset: galleryImages[1].asset,
      alt: galleryImages[1].alt || 'Alma Mater',
      caption: galleryImages[1].caption,
      photographer: galleryImages[1].photographer,
      hotspot: galleryImages[1].hotspot,
    } : undefined,
  }

  // Keep remaining gallery images (2+) in the gallery
  const remainingGallery = gallery ? {
    ...gallery,
    images: galleryImages.slice(2),
  } : null

  // Build new sections array
  const newSections = [
    ...sections.slice(0, 6),  // Sections 0-5 unchanged
    part1,                     // Split part 1 (with original image)
    part2,                     // Split part 2 (with gallery image)
    part3,                     // Split part 3 (with gallery image)
  ]

  // Only add gallery if it still has images
  if (remainingGallery && remainingGallery.images.length > 0) {
    newSections.push(remainingGallery)
  }

  console.log('New structure:')
  newSections.forEach((s, i) => {
    const textCount = (s.text || []).length
    const hasImg = s.image ? 'yes' : 'no'
    const galleryCount = (s.images || []).length
    console.log(`  [${i}] ${s._type} | text: ${textCount} | img: ${hasImg} | gallery: ${galleryCount}`)
  })

  console.log(`\nOld: ${sections.length} sections → New: ${newSections.length} sections`)

  await client.patch(doc._id).set({ sections: newSections }).commit()
  console.log('\nDone!')
}

// Also check and split other articles
async function splitKjepphest() {
  console.log('\n=== Checking "Gøy med kjepphest" ===\n')

  const doc = await client.fetch(
    '*[_type == "article" && title == "Gøy med kjepphest"][0]{_id, sections[]{_type, _key, text[]{_type, children[]{text}}, image, images, backgroundColor}}'
  )
  if (!doc) return

  doc.sections.forEach((s, i) => {
    const textCount = (s.text || []).length
    const hasImg = s.image ? 'yes' : 'no'
    const galleryCount = (s.images || []).length
    console.log(`  [${i}] ${s._type} | text: ${textCount} | img: ${hasImg} | gallery: ${galleryCount}`)
  })

  // Find long sections
  const longSections = doc.sections.filter(s => s._type === 'textWithImage' && (s.text || []).length > 8)
  if (longSections.length === 0) {
    console.log('  No long text sections found')
  } else {
    longSections.forEach(s => {
      const idx = doc.sections.indexOf(s)
      console.log(`  Section ${idx} has ${s.text.length} blocks — could split`)
    })
  }
}

async function splitForsvarsrunden() {
  console.log('\n=== Checking "Forsvarsrunden" ===\n')

  const doc = await client.fetch(
    '*[_type == "article" && title == "Forsvarsrunden"][0]{_id, sections[]{_type, _key, text[]{_type, children[]{text}}, image, images, backgroundColor}}'
  )
  if (!doc) return

  doc.sections.forEach((s, i) => {
    const textCount = (s.text || []).length
    const hasImg = s.image ? 'yes' : 'no'
    const galleryCount = (s.images || []).length
    console.log(`  [${i}] ${s._type} | text: ${textCount} | img: ${hasImg} | gallery: ${galleryCount}`)
  })

  const longSections = doc.sections.filter(s => s._type === 'textWithImage' && (s.text || []).length > 8)
  if (longSections.length === 0) {
    console.log('  No long text sections found')
  } else {
    longSections.forEach(s => {
      const idx = doc.sections.indexOf(s)
      console.log(`  Section ${idx} has ${s.text.length} blocks — could split`)
    })
  }
}

await splitAlmaMater()
await splitKjepphest()
await splitForsvarsrunden()
