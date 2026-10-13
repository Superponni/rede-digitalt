import { defineType, defineField } from 'sanity'

export const edition = defineType({
  name: 'edition',
  title: 'Utgave',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'number',
      title: 'Nummer',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'År',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publisert',
      type: 'datetime',
    }),
    defineField({
      name: 'coverImage',
      title: 'Forsidebilde',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'articleOrder',
      title: 'Sakenes rekkefølge (som på trykk)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      description:
        'Dra sakene i samme rekkefølge som i det trykte magasinet. Forsiden viser kortene i denne rekkefølgen. Saker som ikke står i lista, kommer til slutt (nyeste først).',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      number: 'number',
      year: 'year',
      media: 'coverImage',
    },
    prepare({ title, number, year, media }) {
      return {
        title: title || `Rede nr ${number} ${year}`,
        media,
      }
    },
  },
})
