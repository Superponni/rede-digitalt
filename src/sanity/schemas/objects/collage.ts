import { defineType, defineField } from 'sanity'

export const collage = defineType({
  name: 'collage',
  title: 'Collage',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Valgfri overskrift over collagen',
    }),
    defineField({
      name: 'images',
      title: 'Bilder',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', title: 'Bildetekst', type: 'string' },
            { name: 'credit', title: 'Fotograf', type: 'string' },
            {
              name: 'alt',
              title: 'Alt-tekst',
              type: 'string',
              validation: (rule) => rule.required().error('Alt-tekst er påkrevd'),
            },
          ],
        },
      ],
      description: 'Bildene legges i overlappende lag. Best med 4–6 bilder.',
      validation: (rule) => rule.min(3).error('En collage trenger minst 3 bilder'),
    }),
  ],
  preview: {
    select: { title: 'title', images: 'images' },
    prepare({ title, images }) {
      return {
        title: title || `Collage (${images?.length || 0} bilder)`,
        subtitle: 'Collage (overlappende, klikkbar)',
      }
    },
  },
})
