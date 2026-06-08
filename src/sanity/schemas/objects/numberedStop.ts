import { defineType, defineField } from 'sanity'

export const numberedStop = defineType({
  name: 'numberedStop',
  title: 'Nummerert stopp',
  type: 'object',
  fields: [
    defineField({
      name: 'stopNumber',
      title: 'Nummer',
      type: 'number',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Tekst',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt-tekst', type: 'string' },
        { name: 'caption', title: 'Bildetekst', type: 'string' },
        { name: 'photographer', title: 'Fotograf', type: 'string' },
      ],
    }),
  ],
  preview: {
    select: { stopNumber: 'stopNumber', title: 'title' },
    prepare({ stopNumber, title }) {
      return { title: `#${stopNumber || '?'} ${title || ''}` }
    },
  },
})
