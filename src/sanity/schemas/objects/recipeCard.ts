import { defineType, defineField } from 'sanity'

export const recipeCard = defineType({
  name: 'recipeCard',
  title: 'Oppskriftskort',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Undertittel',
      type: 'string',
      description: 'F.eks. "Annas sandwich-anbefaling"',
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt-tekst', type: 'string' },
      ],
    }),
    defineField({
      name: 'ingredients',
      title: 'Ingredienser',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'instructions',
      title: 'Fremgangsmate',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image' },
    prepare({ title, media }) {
      return { title: title || 'Oppskriftskort', media }
    },
  },
})
