import type Anthropic from '@anthropic-ai/sdk'

// Delt SEO-ekspertise for innholdspipelinen. Reglene bor her slik at både
// import (nye artikler) og backfill (eksisterende) gir SAMME slags anbefaling.
//
// Grunnprinsipp (jf. .agents/seo-aeo-spesialist.md): finnbarhet ødelegger aldri
// stemmen. Anbefalingene er forslag redaktøren kan justere — ikke fasit.

export const SEO_GUIDANCE = `Du er SEO- og AEO-spesialist for et norsk magasin (bokmål, målgruppe unge voksne).

"metaDescription" (PÅKREVD): En søkebeskrivelse på 120–155 tegn, skrevet for å bli
funnet og klikket på i Google. Fang søkeintensjonen (hva folk faktisk lurer på),
si tydelig hva leseren får ut av saken, og inviter til klikk — uten clickbait.
IKKE bare gjenta teaseren eller første setning; en teaser er skrevet for flyt, en
søkebeskrivelse for søk. Naturlig norsk, ingen keyword-stuffing.

"metaTitle" (SELEKTIV — ofte null): Foreslå en alternativ søketittel KUN når den
redaksjonelle tittelen er uklar for søk: et ordspill, en metafor, eller mangler
søkbare ord (sted, tema, hva saken konkret handler om). Da: maks ~60 tegn, naturlig
norsk, behold den redaksjonelle stemmen — gjør den bare tydeligere for søk. Hvis
den redaksjonelle tittelen allerede er konkret og søkbar: returner null (da brukes
den redaksjonelle). Ikke bare gjenta eller omskrive tittelen for å fylle feltet.`

export interface SeoRecommendation {
  metaTitle: string | null
  metaDescription: string
}

// Rydd bort ev. ```json-innpakning og parse løst.
export function parseLooseJson<T>(text: string): T {
  let s = text.trim()
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  return JSON.parse(s) as T
}

interface RecommendationInput {
  title: string
  teaser?: string
  tags?: string[]
  bodyText?: string
}

// Standalone-anbefaling (brukes av backfill). Importen veaver guidancen inn i
// sitt eksisterende samle-kall i stedet for å gjøre et ekstra kall.
export async function generateSeoRecommendation(
  anthropic: Anthropic,
  input: RecommendationInput,
): Promise<SeoRecommendation> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `${SEO_GUIDANCE}

Svar KUN med gyldig JSON på formen {"metaTitle": string|null, "metaDescription": string}.

Redaksjonell tittel: ${input.title}
${input.tags?.length ? `Tema/tags: ${input.tags.join(', ')}` : ''}
${input.teaser ? `Teaser: ${input.teaser}` : ''}

Artikkeltekst (utdrag):
${(input.bodyText || '').substring(0, 5000)}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Uventet svartype fra Claude')

  const parsed = parseLooseJson<SeoRecommendation>(content.text)
  // Normaliser: tom streng → null for tittel.
  return {
    metaTitle: parsed.metaTitle && parsed.metaTitle.trim() ? parsed.metaTitle.trim() : null,
    metaDescription: (parsed.metaDescription || '').trim(),
  }
}
