import { defineType, defineField } from 'sanity'
import { TagIcon } from '@sanity/icons'

// Faste valglister. Disse MÅ matche strengene i src/lib/medlemstilbud.ts
// (kategorifarger + regionsrekkefølge), ellers mister kortet farge/sortering.
const CATEGORIES = [
  'Bygg & hjem',
  'Tjenester & helse',
  'Sport & friluft',
  'Kultur & underholdning',
  'Bank & finans',
  'Hotell & reise',
  'Mat & drikke',
]

const REGIONS = [
  'Trondheim',
  'Hele Trøndelag',
  'Nasjonalt/nett',
  'Innherred',
  'Stjørdal',
  'Steinkjer',
  'Verdal',
  'Namsos',
  'Rørvik',
  'Kolvereid',
]

export const memberOffer = defineType({
  name: 'memberOffer',
  title: 'Medlemstilbud',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'businessName',
      title: 'Bedrift',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'businessName', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description:
        'Annonsørens logo (helst PNG/SVG med gjennomsiktig bakgrunn). Mangler logo, vises bedriftens initialer i kategorifargen.',
      options: { hotspot: false },
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: { list: CATEGORIES, layout: 'dropdown' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'regions',
      title: 'Sted / region',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: REGIONS },
      description: 'Hvor gjelder tilbudet? Velg ett eller flere.',
    }),
    defineField({
      name: 'discountSummary',
      title: 'Rabatt-merke',
      type: 'string',
      description:
        'Kort blikkfang på kortet, f.eks. «30 %», «25 kr», «2 for 1». Hold det kort.',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Kort beskrivelse',
      type: 'string',
      description: 'Én setning om hva bedriften tilbyr.',
    }),
    defineField({
      name: 'discountDetails',
      title: 'Vilkår og detaljer',
      type: 'text',
      rows: 4,
      description: 'Full beskrivelse av rabatten og vilkårene.',
    }),
    defineField({
      name: 'howToRedeem',
      title: 'Slik får du tilbudet',
      type: 'text',
      rows: 2,
      description:
        'Hvordan utløses rabatten? F.eks. «Vis medlemsbevis» eller «Bestill via tobb.no». La stå tom for å bruke standardteksten.',
    }),
    defineField({
      name: 'website',
      title: 'Nettside',
      type: 'string',
      description: 'F.eks. www.bedrift.no (uten https:// er greit).',
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
    }),
    defineField({
      name: 'locations',
      title: 'Avdelinger / adresser',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'For bedrifter med flere utsalg (f.eks. tannlege med flere klinikker).',
    }),
    defineField({
      name: 'relatedArticle',
      title: 'Koblet artikkel',
      type: 'reference',
      to: [{ type: 'article' }],
      description:
        'Har partneren en egen sak i Rede? Da vises «Les saken» på kortet.',
    }),
    defineField({
      name: 'featured',
      title: 'Fremhevet',
      type: 'boolean',
      description: 'Løft dette tilbudet øverst i sin kategori.',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Kategori',
      name: 'categoryAsc',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'businessName', direction: 'asc' },
      ],
    },
    {
      title: 'Bedrift (A–Å)',
      name: 'businessAsc',
      by: [{ field: 'businessName', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'businessName',
      subtitle: 'category',
      media: 'logo',
    },
  },
})
