import { defineType, defineField } from 'sanity'

export const factBox = defineType({
  name: 'factBox',
  title: 'Faktaboks',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Innhold',
      type: 'blockContent',
    }),
    defineField({
      name: 'icon',
      title: 'Ikon',
      type: 'string',
      description: 'Valgfri visuell markør (emoji eller tekst)',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return { title: title || 'Faktaboks', subtitle: 'Fakta' }
    },
  },
})
