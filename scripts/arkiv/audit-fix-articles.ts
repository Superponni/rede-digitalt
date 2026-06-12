/**
 * Tekstopprydding mot trykksaken (Rede 2 2026): retter tittel + standfirst (teaser)
 * og fjerner de innledende DUPLIKAT-blokkene som importen la i body (print-tittel
 * som h2 + gjentatt standfirst). Print = korrekturlest fasit.
 *
 * Trimmer kun den SAMMENHENGENDE innledende rekken av blokker hvis tekst starter
 * med en kjent duplikat-frase ⇒ idempotent (etter første kjøring matcher ikke
 * den ekte brødteksten, og ingenting trimmes). Patcher publisert + utkast.
 * --dry skriver ingenting.
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

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Fix {
  slug: string
  title?: string
  teaser: string
  dropLeading: string[] // innledende blokker som starter med disse fjernes
}

const FIXES: Fix[] = [
  {
    slug: 'ole-elias',
    title: 'Ta vare på medlemskapet ditt',
    teaser:
      'Ole Elias Jensås fikk TOBB-medlemskap overført fra sin mor for noen år siden, og med det god ansiennitet.',
    dropLeading: ['Husk medlemskapet ditt', 'Ole Elias Jensås fikk TOBB-medlemskap'],
  },
  {
    slug: 'curlingfeber-pa-hoeggen',
    teaser:
      'Som eneste skole i Norge tilbyr Hoeggen skole curling som valgfag. Hver fredag fylles Leangen ishall av ivrige ungdommer med kost og stein, og interessen er større enn noen gang.',
    dropLeading: ['Curlingfeber på Hoeggen', 'Som eneste skole i Norge tilbyr'],
  },
  {
    slug: 'medlem-nummer-80000',
    title: 'Medlem nr. 80 000!',
    teaser:
      'Han heter Vidar og er snart ett år. Foreldrene hans fikk nylig gleden av å melde ham inn som medlem nummer 80 000, akkurat på TOBBs 80-årsdag.',
    dropLeading: ['Medlem nummer 80 000', 'Medlem nr. 80 000', 'Han heter Vidar og er snart ett år'],
  },
  {
    slug: 'farvel-til-tort-inneklima',
    teaser:
      'For et par uker siden satt min kone i stua og ante fred og ingen fare, da det plutselig begynte å dryppe fra taket. Dette var dessverre ikke blod, slik tilfellet ville vært i en skrekkfilm. Det var vann.',
    dropLeading: [
      'FARVEL TIL TØRT INNEKLIMA',
      'Farvel til tørt inneklima',
      'For et par uker siden satt min kone',
      'Dette var dessverre ikke blod',
    ],
  },
]

const norm = (s: string) => s.trim().toLowerCase()
const blockText = (b: any): string =>
  b?._type === 'block' && Array.isArray(b.children)
    ? b.children.map((c: any) => c.text || '').join('')
    : ''

function trimLeadingDups(body: any[], dropLeading: string[]): { body: any[]; removed: number } {
  const drops = dropLeading.map(norm)
  let cut = 0
  while (cut < body.length) {
    const t = norm(blockText(body[cut]))
    if (t && drops.some((d) => t.startsWith(d))) cut++
    else break
  }
  return { body: body.slice(cut), removed: cut }
}

async function main() {
  console.log(DRY ? '🔍 DRY-RUN (skriver ingenting)\n' : '✍️  Rydder tekst mot print\n')

  for (const fix of FIXES) {
    const docs = await sanity.fetch(
      `*[_type=="article" && slug.current==$s]{ _id, title, body }`,
      { s: fix.slug }
    )
    if (!docs.length) {
      console.log(`⚠️  ${fix.slug}: fant ingen dokument – hoppet over`)
      continue
    }

    for (const d of docs) {
      const isDraft = d._id.startsWith('drafts.')
      const { body, removed } = trimLeadingDups(d.body || [], fix.dropLeading)
      const set: Record<string, any> = { teaser: fix.teaser, body }
      if (fix.title) set.title = fix.title

      console.log(`📄 ${fix.slug}${isDraft ? ' (utkast)' : ''}`)
      if (fix.title) console.log(`   tittel → «${fix.title}»  (var «${d.title}»)`)
      console.log(`   teaser → «${fix.teaser.slice(0, 70)}…»`)
      console.log(`   body: fjernet ${removed} innledende duplikat-blokk(er) (${(d.body || []).length} → ${body.length})`)

      if (!DRY) await sanity.patch(d._id).set(set).commit()
    }
    console.log('')
  }

  console.log(DRY ? '(dry — ingenting skrevet)' : '✅ Ferdig.')
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
