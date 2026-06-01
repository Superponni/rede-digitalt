import { defineType, defineField } from 'sanity'

export const gallery = defineType({
  name: 'gallery',
  title: 'Galleri',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Valgfri overskrift over galleriet',
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
              validation: (rule) =>
                rule.required().error('Alt-tekst er påkrevd'),
            },
          ],
        },
      ],
      validation: (rule) => rule.min(2).error('Et galleri trenger minst 2 bilder'),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Grid', value: 'grid' },
          { title: 'Karusell', value: 'carousel' },
          { title: 'Masonry', value: 'masonry' },
        ],
      },
      initialValue: 'grid',
    }),
    defineField({
      name: 'transition',
      title: 'Overgang',
      type: 'string',
      options: {
        list: [
          { title: 'Ingen', value: 'none' },
          { title: 'Crossfade', value: 'crossfade' },
        ],
      },
      initialValue: 'none',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Bakgrunnsfarge',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      images: 'images',
    },
    prepare({ title, images }) {
      return {
        title: title || `Galleri (${images?.length || 0} bilder)`,
        subtitle: title ? `Galleri (${images?.length || 0} bilder)` : 'Galleri',
      }
    },
  },
})
