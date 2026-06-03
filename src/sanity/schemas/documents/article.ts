import { defineType, defineField } from 'sanity'
import { PreviewInput } from '@/sanity/components/PreviewInput'

export const article = defineType({
  name: 'article',
  title: 'Artikkel',
  type: 'document',
  components: { input: PreviewInput },
  // Faner i toppen av dokumentet (samme mønster som om-siden): selve innholdet
  // i «Artikkel», finnbarhet i «Deling & søk» — lett tilgjengelig for redaktør.
  groups: [
    { name: 'innhold', title: 'Artikkel', default: true },
    { name: 'seo', title: 'Deling & søk' },
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
          { title: 'Scrollytelling', value: 'scrollytelling' },
          { title: 'Standard', value: 'standard' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
      validation: (rule) => rule.required(),
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
      name: 'scrollyTheme',
      title: 'Scrollytelling-tema',
      type: 'string',
      group: 'innhold',
      options: {
        list: [
          { title: 'Varm / intim (gylne, mørke toner)', value: 'warm' },
          { title: 'Dokumentarisk / rolig (grønn/teal)', value: 'documentary' },
          { title: 'Leken / energisk (lilla)', value: 'playful' },
        ],
        layout: 'radio',
      },
      hidden: ({ parent }) => parent?.type !== 'scrollytelling',
      description: 'Styrer stemningen: aksentfarger og hvordan animasjonene føles (rolig vs. energisk). Ikke bakgrunnsfargen — den settes i feltet under.',
    }),
    defineField({
      name: 'scrollyBackground',
      title: 'Bakgrunnsfarge',
      type: 'string',
      group: 'innhold',
      options: {
        list: [
          { title: 'Mørk marineblå', value: '#003865' },
          { title: 'Magenta', value: '#AA0061' },
          { title: 'Lilla', value: '#6B3077' },
          { title: 'Teal', value: '#048A7B' },
        ],
        layout: 'radio',
      },
      initialValue: '#003865',
      hidden: ({ parent }) => parent?.type !== 'scrollytelling',
      description: 'Bakgrunnsfarge for hele scrollytelling-artikkelen',
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
        { type: 'stickyPortrait' },
        { type: 'recipeCard' },
        { type: 'countUpFact' },
        { type: 'numberedStop' },
        { type: 'interactiveQuiz' },
      ],
      hidden: ({ parent }) => parent?.type !== 'scrollytelling',
      description: 'Byggeklosser for scrollytelling-artikler',
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
      description:
        'Valgfritt. Overstyr hvordan artikkelen ser ut i Google og ved deling. Tom = utledes automatisk fra tittel, ingress og hovedbilde.',
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
        subtitle: type === 'scrollytelling' ? '📜 Scrollytelling' : '📄 Standard',
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
