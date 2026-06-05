import { defineType, defineField } from 'sanity'
import { PreviewInput } from '@/sanity/components/PreviewInput'
import { HIDDEN_ALL_FIELDS_GROUP } from '@/sanity/lib/hideAllFields'

export const editorial = defineType({
  name: 'editorial',
  title: 'Leder',
  type: 'document',
  components: { input: PreviewInput },
  // Faner: innhold i «Leder», finnbarhet i «Deling & søk» (jf. artikkel/om-side).
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
    // Samme topp- og farge-verktøykasse som standard-artikler (jf. article.ts):
    // signaturfarge + fargemodus + topp-oppsett, slik at lederen kan settes opp
    // akkurat som en standard-artikkel.
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
      description: 'Styrer bakgrunn og metning — som i trykksaken.',
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
      description: 'Mangler bildet, vises tittel-toppen uansett',
    }),
    defineField({
      name: 'portraitName',
      title: 'Ekspertnavn (buet over portrettet)',
      type: 'string',
      group: 'innhold',
      description:
        'Vises ved «Rundt ekspertportrett», eller som lite badge oppå andre topp-oppsett når ekspertportrett-bildet er satt.',
      hidden: ({ parent }) => parent?.heroLayout !== 'portrait' && !parent?.expertPortrait,
    }),
    defineField({
      name: 'portraitRole',
      title: 'Rolle/firma (buet under portrettet)',
      type: 'string',
      group: 'innhold',
      description:
        'Vises ved «Rundt ekspertportrett», eller som lite badge oppå andre topp-oppsett når ekspertportrett-bildet er satt.',
      hidden: ({ parent }) => parent?.heroLayout !== 'portrait' && !parent?.expertPortrait,
    }),
    defineField({
      name: 'expertPortrait',
      title: 'Ekspertportrett (lite, buet navn)',
      type: 'image',
      group: 'innhold',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt-tekst', type: 'string' }],
      description:
        'Valgfritt. Vises som et lite rundt portrett-badge med navn buet rundt, oppå det vanlige topp-oppsettet. (Ved topp-oppsett «Rundt ekspertportrett» brukes dette som det store portrettet.)',
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
      name: 'heroImage',
      title: 'Bilde',
      type: 'image',
      group: 'innhold',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'teaserText',
      title: 'Teaser-tekst',
      type: 'text',
      group: 'innhold',
      rows: 3,
      description: 'Kort intro som vises på forsiden',
    }),
    defineField({
      name: 'fullText',
      title: 'Full tekst',
      type: 'blockContent',
      group: 'innhold',
    }),
    defineField({
      name: 'audioFile',
      title: 'Lydfil',
      type: 'file',
      group: 'innhold',
      options: { accept: 'audio/*' },
    }),
    defineField({
      name: 'videoFile',
      title: 'Videofil',
      type: 'file',
      group: 'innhold',
      options: { accept: 'video/*' },
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
      editionTitle: 'edition.title',
    },
    prepare({ title, editionTitle }) {
      return {
        title,
        subtitle: editionTitle ? `Leder – ${editionTitle}` : 'Leder',
      }
    },
  },
})
