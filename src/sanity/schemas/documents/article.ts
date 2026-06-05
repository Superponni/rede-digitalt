import { defineType, defineField } from 'sanity'
import { PreviewInput } from '@/sanity/components/PreviewInput'
import { HIDDEN_ALL_FIELDS_GROUP } from '@/sanity/lib/hideAllFields'

export const article = defineType({
  name: 'article',
  title: 'Artikkel',
  type: 'document',
  components: { input: PreviewInput },
  // Faner i toppen av dokumentet (samme mønster som om-siden): selve innholdet
  // i «Artikkel», finnbarhet i «Deling & søk» — lett tilgjengelig for redaktør.
  groups: [
    { name: 'innhold', title: 'Innhold', default: true },
    { name: 'seo', title: 'Deling & søk' },
    HIDDEN_ALL_FIELDS_GROUP,
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      group: 'innhold',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Undertittel',
      type: 'string',
      group: 'innhold',
      hidden: ({ parent }) => parent?.type !== 'standard',
      description: 'Vises i kursiv rett under tittelen (valgfri)',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'innhold',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Artikkeltype',
      type: 'string',
      group: 'innhold',
      options: {
        list: [
          { title: 'Feature', value: 'scrollytelling' },
          { title: 'Standard', value: 'standard' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
      description:
        'Feature: ligger øverst på forsiden og har mer animasjon. Standard: pen lesevisning. Begge styrer farge likt (signaturfarge + fargemodus under).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'accentColor',
      title: 'Signaturfarge',
      type: 'string',
      group: 'innhold',
      options: {
        list: [
          { title: 'Marineblå', value: 'navy' },
          { title: 'Teal', value: 'teal' },
          { title: 'Lilla', value: 'purple' },
          { title: 'Magenta', value: 'magenta' },
          { title: 'Blå', value: 'blue' },
          { title: 'Grønn', value: 'green' },
          { title: 'Gull', value: 'gold' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'navy',
      description: 'Fargen som preger tittel, sitater og faktabokser — som i trykksaken',
    }),
    defineField({
      name: 'colorMode',
      title: 'Fargemodus',
      type: 'string',
      group: 'innhold',
      options: {
        list: [
          { title: 'Lys mint-bakgrunn + farget tittel', value: 'light' },
          { title: 'Lys tonet bakgrunn (signaturfargen)', value: 'tinted' },
          { title: 'Full farget bakgrunn', value: 'filled' },
          { title: 'Mørk (marineblå flate, lys tekst)', value: 'dark' },
        ],
        layout: 'radio',
      },
      initialValue: 'light',
      description:
        'Styrer bakgrunn og metning — som i trykksaken. På feature-saker bestemmer dette flaten bak alt innholdet (helskjerm-coveret øverst ligger alltid over hovedbildet).',
    }),
    defineField({
      name: 'heroLayout',
      title: 'Topp-oppsett',
      type: 'string',
      group: 'innhold',
      options: {
        list: [
          { title: 'Bilde øverst (fullbredde)', value: 'image-first' },
          { title: 'Tittel først, bilde under', value: 'heading-first' },
          { title: 'Tittel og bilde ved siden', value: 'side' },
          { title: 'Ingen bilde (kun farge + tittel)', value: 'none' },
          { title: 'Rundt ekspertportrett (navn buet rundt)', value: 'portrait' },
        ],
        layout: 'radio',
      },
      initialValue: 'image-first',
      hidden: ({ parent }) => parent?.type !== 'standard',
      description: 'Mangler bildet, vises tittel-toppen uansett',
    }),
    defineField({
      name: 'experts',
      title: 'Eksperter / kilder (med portrett)',
      type: 'array',
      group: 'innhold',
      of: [{ type: 'expertSource' }],
      validation: (Rule) => Rule.max(3),
      description:
        'Legg til ekspert-/kildefoto HER (ikke som hovedbilde), maks 3. Hver vises som et rundt portrett med navn buet over og rolle buet under – i samme størrelse uansett om saken også har et hovedbilde/illustrasjon. Med flere portretter skaleres de ned til én rad. Ved topp-oppsett «Rundt ekspertportrett» er de toppen av saken. Har saken ikke noe hovedbilde, brukes første ekspert også som forsidebilde.',
      hidden: ({ parent }) => parent?.type !== 'standard',
    }),
    defineField({
      name: 'edition',
      title: 'Utgave',
      type: 'reference',
      group: 'innhold',
      to: [{ type: 'edition' }],
    }),
    defineField({
      name: 'author',
      title: 'Forfatter',
      type: 'reference',
      group: 'innhold',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publisert',
      type: 'datetime',
      group: 'innhold',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'innhold',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hovedbilde',
      type: 'image',
      group: 'innhold',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
        },
        {
          name: 'credit',
          title: 'Fotograf',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero-video',
      type: 'file',
      group: 'innhold',
      options: { accept: 'video/*' },
      description: 'Loopende video som vises i stedet for hovedbilde på forsidekort',
    }),
    defineField({
      name: 'teaser',
      title: 'Teaser',
      type: 'text',
      group: 'innhold',
      rows: 2,
      description: 'Kort intro for forsiden (1-2 setninger)',
    }),
    defineField({
      name: 'estimatedReadTime',
      title: 'Lesetid (minutter)',
      type: 'number',
      group: 'innhold',
    }),
    defineField({
      name: 'audioFile',
      title: 'Lydfil',
      type: 'file',
      group: 'innhold',
      options: { accept: 'audio/*' },
      description: 'MP3-opplesning av artikkelen',
    }),
    defineField({
      name: 'sections',
      title: 'Seksjoner',
      type: 'array',
      group: 'innhold',
      of: [
        { type: 'heroSection' },
        { type: 'textWithImage' },
        { type: 'fullscreenParallax' },
        { type: 'pullQuote' },
        { type: 'videoSection' },
        { type: 'audioSection' },
        { type: 'factBox' },
        { type: 'gallery' },
        { type: 'collage' },
        { type: 'statementPanel' },
        { type: 'stickyPortrait' },
        { type: 'recipeCard' },
        { type: 'countUpFact' },
        { type: 'numberedStop' },
        { type: 'interactiveQuiz' },
      ],
      hidden: ({ parent }) => parent?.type !== 'scrollytelling',
      description: 'Byggeklosser for feature-artikler',
    }),
    defineField({
      name: 'body',
      title: 'Brødtekst',
      type: 'blockContent',
      group: 'innhold',
      hidden: ({ parent }) => parent?.type !== 'standard',
      description: 'Brødtekst for standard-artikler',
    }),
    defineField({
      name: 'seo',
      title: 'Deling & søk',
      type: 'seo',
      group: 'seo',
      // Introtekst + visning styres av SeoField/SeoInput (se SeoFields.tsx).
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      media: 'heroImage',
    },
    prepare({ title, type, media }) {
      return {
        title,
        subtitle: type === 'scrollytelling' ? '📜 Feature' : '📄 Standard',
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Publiseringsdato',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
