/**
 * Import-script for medlemstilbud.
 *
 * Leser utkastet i content/medlemstilbud-utkast.json (uttrukket fra trykk-PDF)
 * og oppretter ett `memberOffer`-dokument per tilbud i Sanity.
 *
 * Kilde til sannhet: Sanity er fasit. Dette er et engangs-seedingverktøy.
 * Det bruker deterministiske _id (memberOffer-<slug>) og HOPPER OVER tilbud
 * som allerede finnes, slik at re-kjøring aldri overskriver redaktørens arbeid.
 *
 * Tørrkjør (ingen skriving):
 *   npx tsx scripts/import-member-offers.ts --dry-run
 *
 * Kjør (trygt — hopper over eksisterende):
 *   npx tsx scripts/import-member-offers.ts
 *
 * Tving overskriving (BRUK MED OMHU — sletter redaksjonelle endringer):
 *   npx tsx scripts/import-member-offers.ts --force
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

const DRY_RUN = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

interface RawOffer {
  businessName: string
  category: string
  regions: string[]
  discountSummary: string | null
  discountDetails: string | null
  shortDescription: string | null
  website: string | null
  phone: string | null
  locations: string[]
  howToRedeem: string | null
  hasLogo: boolean
  relatedArticleHint: string | null
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/&/g, ' og ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Best-effort kobling av tilbud → eksisterende artikkel via hint.
async function findArticleId(hint: string): Promise<string | null> {
  const q = `*[_type == "article" && title match $m][0]._id`
  const id = await sanity.fetch<string | null>(q, { m: `*${hint}*` })
  return id ?? null
}

async function main() {
  const file = path.join(process.cwd(), 'content', 'medlemstilbud-utkast.json')
  const offers: RawOffer[] = JSON.parse(fs.readFileSync(file, 'utf-8'))

  console.log(
    `\nMedlemstilbud-import — ${offers.length} tilbud ${
      DRY_RUN ? '(TØRRKJØRING)' : FORCE ? '(FORCE)' : '(trygt)'
    }\n`,
  )

  // Sjekk hvilke _id som allerede finnes
  const ids = offers.map((o) => `memberOffer-${slugify(o.businessName)}`)
  const existing: string[] = DRY_RUN
    ? []
    : await sanity.fetch(`*[_id in $ids]._id`, { ids })
  const existingSet = new Set(existing)

  let created = 0
  let skipped = 0
  let linked = 0

  for (const o of offers) {
    const slug = slugify(o.businessName)
    const _id = `memberOffer-${slug}`

    if (existingSet.has(_id) && !FORCE) {
      console.log(`  ⏭  hopper over (finnes): ${o.businessName}`)
      skipped++
      continue
    }

    let relatedArticle: { _type: 'reference'; _ref: string } | undefined
    if (o.relatedArticleHint && !DRY_RUN) {
      const articleId = await findArticleId(o.relatedArticleHint)
      if (articleId) {
        relatedArticle = { _type: 'reference', _ref: articleId }
        linked++
      }
    }

    const doc = {
      _id,
      _type: 'memberOffer',
      businessName: o.businessName,
      slug: { _type: 'slug', current: slug },
      category: o.category,
      regions: o.regions ?? [],
      discountSummary: o.discountSummary ?? undefined,
      shortDescription: o.shortDescription ?? undefined,
      discountDetails: o.discountDetails ?? undefined,
      howToRedeem: o.howToRedeem ?? undefined,
      website: o.website ?? undefined,
      phone: o.phone ?? undefined,
      locations: o.locations ?? [],
      featured: false,
      ...(relatedArticle ? { relatedArticle } : {}),
    }

    if (DRY_RUN) {
      console.log(`  ✓ ville opprettet: ${o.businessName}  [${o.category}]`)
      created++
      continue
    }

    await sanity.createOrReplace(doc)
    console.log(
      `  ✓ ${FORCE && existingSet.has(_id) ? 'oppdatert' : 'opprettet'}: ${o.businessName}`,
    )
    created++
  }

  console.log(
    `\nFerdig. ${created} ${DRY_RUN ? 'ville blitt opprettet' : 'opprettet/oppdatert'}, ${skipped} hoppet over, ${linked} koblet til artikkel.\n`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
