import { defineType, defineField } from 'sanity'

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero-seksjon',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt-tekst', type: 'string' },
        { name: 'credit', title: 'Fotograf', type: 'string' },
      ],
    }),
    defineField({
      name: 'video',
      title: 'Bakgrunnsvideo',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Valgfri — erstatter bildet som bakgrunn',
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Undertittel',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({ title, media }) {
      return { title: title || 'Hero-seksjon', subtitle: 'Hero', media }
    },
  },
})
