/**
 * Engangs-jobb: SEO-anbefalinger + opprydding for eksisterende artikler.
 *
 * Hva den gjør, per artikkel (publisert OG ev. utkast):
 *   1. Genererer en søkebeskrivelse (alltid) og selektiv søketittel via Claude
 *      — kun i TOMME felter, så redaktørens egne valg aldri overskrives.
 *   2. Rydder det gamle topp-nivå-feltet `ogDescription` (vises ellers som
 *      «Unknown field» i Studio etter at seo-objektet overtok).
 *
 * Trygg å kjøre på nytt (idempotent): hopper over artikler som allerede har
 * søkebeskrivelse, og rører aldri felter som er fylt ut.
 *
 * Tørrkjør (ingen skriving, bare vis hva som ville skjedd):
 *   npx tsx scripts/seo-anbefalinger.ts --dry-run
 *
 * Kjør:
 *   npx tsx scripts/seo-anbefalinger.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@sanity/client'
import Anthropic from '@anthropic-ai/sdk'
import { generateSeoRecommendation } from './lib/seo-prompt'

const DRY_RUN = process.argv.includes('--dry-run')

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ArticleDoc {
  _id: string
  title: string
  slug?: string
  teaser?: string
  ogDescription?: string
  seo?: { metaTitle?: string; metaDescription?: string; [k: string]: unknown }
  body?: any[]
  sections?: any[]
  tags?: { title?: string }[]
}

// Trekk ut lesbar tekst fra brødtekst (Portable Text) + scrollytelling-seksjoner
// så Claude får ekte kontekst, ikke bare tittel/teaser.
function extractText(doc: ArticleDoc): string {
  const parts: string[] = []
  if (Array.isArray(doc.body)) {
    for (const b of doc.body) {
      if (b?._type === 'block' && Array.isArray(b.children)) {
        parts.push(b.children.map((c: any) => c?.text || '').join(''))
      }
    }
  }
  if (Array.isArray(doc.sections)) {
    const textKeys = ['title', 'subtitle', 'text', 'overlayText', 'quote', 'content', 'intro', 'caption']
    for (const s of doc.sections) {
      for (const k of textKeys) {
        if (typeof s?.[k] === 'string') parts.push(s[k])
      }
    }
  }
  return parts.join('\n\n').trim()
}

function baseId(id: string): string {
  return id.replace(/^drafts\./, '')
}

async function main() {
  console.log(`\n🔎 SEO-anbefalinger ${DRY_RUN ? '(TØRRKJØRING — ingen skriving)' : ''}\n`)

  // perspective: 'raw' → både publiserte (article-x) og utkast (drafts.article-x)
  // som separate dokumenter, slik at vi kan rydde/patche begge.
  const docs = await sanity.fetch<ArticleDoc[]>(
    `*[_type == "article"]{
      _id, title, "slug": slug.current, teaser, ogDescription, seo, body, sections,
      tags[]->{ title }
    }`,
    {},
    { perspective: 'raw' },
  )

  // Grupper publisert + utkast sammen, så vi genererer anbefaling ÉN gang per
  // artikkel og bruker den på begge variantene.
  const groups = new Map<string, ArticleDoc[]>()
  for (const d of docs) {
    const key = baseId(d._id)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(d)
  }

  let touched = 0
  let cleaned = 0
  let skipped = 0

  for (const [key, variants] of groups) {
    const title = variants[0].title || key
    const needsDescription = variants.some((v) => !v.seo?.metaDescription)

    let rec: { metaTitle: string | null; metaDescription: string } | null = null
    if (needsDescription) {
      // Bruk den varianten med mest innhold som kontekst (ofte utkastet).
      const richest = [...variants].sort((a, b) => extractText(b).length - extractText(a).length)[0]
      try {
        rec = await generateSeoRecommendation(anthropic, {
          title: richest.title,
          teaser: richest.teaser,
          tags: (richest.tags || []).map((t) => t.title).filter(Boolean) as string[],
          bodyText: extractText(richest),
        })
      } catch (err) {
        console.log(`   ⚠️  "${title}": AI-anbefaling feilet (${(err as Error).message}) — hopper over tekst, rydder kun`)
      }
    }

    for (const v of variants) {
      const isDraft = v._id.startsWith('drafts.')
      const existingSeo = v.seo || {}
      const newSeo: Record<string, unknown> = { ...existingSeo }
      const changes: string[] = []

      if (rec) {
        if (!newSeo.metaDescription && rec.metaDescription) {
          newSeo.metaDescription = rec.metaDescription
          changes.push('beskrivelse')
        }
        if (!newSeo.metaTitle && rec.metaTitle) {
          newSeo.metaTitle = rec.metaTitle
          changes.push('søketittel')
        }
      }

      const removeLegacy = v.ogDescription != null

      if (changes.length === 0 && !removeLegacy) {
        skipped++
        continue
      }

      const label = isDraft ? `${title} [utkast]` : title
      const actions = [
        ...changes.map((c) => `+${c}`),
        ...(removeLegacy ? ['ryddet ogDescription'] : []),
      ].join(', ')
      console.log(`   ${DRY_RUN ? '○' : '✓'} ${label}: ${actions}`)
      if (rec?.metaTitle && changes.includes('søketittel')) {
        console.log(`       søketittel: «${rec.metaTitle}»`)
      }

      if (changes.length > 0) touched++
      if (removeLegacy) cleaned++

      if (!DRY_RUN) {
        const patch = sanity.patch(v._id)
        if (changes.length > 0) patch.set({ seo: newSeo })
        if (removeLegacy) patch.unset(['ogDescription'])
        await patch.commit({ autoGenerateArrayKeys: false })
      }
    }
  }

  console.log(
    `\n📊 ${groups.size} artikler · ${touched} fikk anbefaling · ${cleaned} ryddet · ${skipped} uendret`,
  )
  console.log(
    DRY_RUN
      ? '\nℹ️  Tørrkjøring — ingenting ble skrevet. Kjør uten --dry-run for å lagre.\n'
      : '\n✅ Ferdig. Alt er FORSLAG — juster fritt i Studio under «Deling & søk».\n',
  )
}

main().catch((err) => {
  console.error('Feil:', err)
  process.exit(1)
})
