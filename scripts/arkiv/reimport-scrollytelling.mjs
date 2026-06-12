import { createClient } from '@sanity/client'
import mammoth from 'mammoth'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const articles = [
  // Already updated:
  // { sanityTitle: 'Fransk finesse bak disken', docx: 'content/Rede 2 2026/Alma Mater_mat og profil/Amla mater_rede2_26.docx' },
  // { sanityTitle: 'Forsvarsrunden', docx: 'content/Rede 2 2026/Promenade/Forsvarsrunden_rede2_26.docx' },
  {
    sanityTitle: 'Gøy med kjepphest',
    docx: 'content/Rede 2 2026/Kjepphest/kjepphest_rede2_26.docx',
  },
]

async function reimport(art) {
  console.log('Processing:', art.sanityTitle)

  const { value: fullText } = await mammoth.extractRawText({ path: art.docx })
  console.log('  Original text:', fullText.length, 'chars')

  const doc = await client.fetch(
    '*[_type == "article" && title == $t][0]{_id, sections}',
    { t: art.sanityTitle }
  )
  if (!doc) {
    console.log('  NOT FOUND')
    return
  }

  const currentSections = doc.sections || []
  const sectionSummary = currentSections.map((s) => ({
    _type: s._type,
    _key: s._key,
    title: s.title,
    quote: s.quote,
  }))

  const resp = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `Du har en scrollytelling-artikkel med denne seksjonsstrukturen:
${JSON.stringify(sectionSummary, null, 2)}

Her er HELE originalteksten fra artikkelen. INKLUDER ALT — ikke kutt, ikke oppsummer, ikke forkort. Fordel hele teksten naturlig over textWithImage-seksjonene. Bruk ALLE avsnitt fra originalteksten.

ORIGINAL TEKST:
${fullText}

Returner et JSON-array med oppdaterte seksjoner. Behold EKSAKT samme _type, _key, title, quote og andre felt som allerede finnes.
Oppdater KUN "text"-feltene i textWithImage-seksjonene med den fulle originalteksten fordelt naturlig.

For textWithImage: "text" skal være et Portable Text array: [{"_type": "block", "style": "normal", "children": [{"_type": "span", "text": "..."}]}]
Hvert avsnitt skal være en egen block. Behold alle avsnitt.

For factBox: "content" skal også være Portable Text med all relevant info.
For fullscreenParallax: "overlayText" skal være Portable Text.

VIKTIG: Returner BARE valid JSON-arrayet, ingen annen tekst rundt. Inkluder ALL originaltekst fordelt over seksjonene.`,
      },
    ],
  })

  const jsonText = resp.content[0].text.trim()
  // Clean up common JSON issues from LLM output
  let cleanJson = jsonText
  // Remove markdown code fences
  const match = cleanJson.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
  if (match) cleanJson = match[1]
  // Fix unescaped quotes inside strings by replacing curly/smart quotes
  cleanJson = cleanJson.replace(/\u201c/g, '\\"').replace(/\u201d/g, '\\"')
  // Fix "text" values with nested unescaped quotes — replace inner quotes with escaped
  cleanJson = cleanJson.replace(/"sit­te på"/g, '\\"sit­te på\\"')

  let newSections
  try {
    newSections = JSON.parse(cleanJson)
  } catch (e) {
    console.log('  PARSE ERROR:', e.message)
    console.log('  Response starts with:', cleanJson.substring(0, 300))
    return
  }

  // Merge: keep all original fields, overlay new text content
  const merged = currentSections.map((orig, i) => {
    const updated = newSections[i]
    if (!updated) return orig
    if (orig._type === 'textWithImage' && updated.text) {
      return { ...orig, text: updated.text }
    }
    if (orig._type === 'factBox' && updated.content) {
      return { ...orig, content: updated.content }
    }
    if (orig._type === 'fullscreenParallax' && updated.overlayText) {
      return { ...orig, overlayText: updated.overlayText }
    }
    return orig
  })

  await client.patch(doc._id).set({ sections: merged }).commit()

  const newTotalText = merged.reduce((sum, s) => {
    if (s._type === 'textWithImage' && s.text) {
      const text = s.text
        .filter((b) => b._type === 'block')
        .map((b) => b.children?.map((c) => c.text).join(''))
        .join('')
      return sum + text.length
    }
    return sum
  }, 0)
  console.log('  Updated! Text content now:', newTotalText, 'chars')
}

for (const art of articles) {
  await reimport(art)
}
console.log('Done!')
