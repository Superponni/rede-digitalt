import { defineType, defineField } from 'sanity'

export const statementPanel = defineType({
  name: 'statementPanel',
  title: 'Statement-panel',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Tekst',
      type: 'text',
      rows: 3,
      description: 'Kort, kraftig setning på en heldekkende fargeflate — erstatter tekst oppå mørklagt foto',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Kilde',
      type: 'string',
      description: 'Valgfri — hvem sa dette',
    }),
    defineField({
      name: 'frame',
      title: 'Vis ramme',
      type: 'boolean',
      initialValue: true,
      description: 'Tynn dekorramme rundt teksten (editorial/etikett-motiv)',
    }),
    defineField({
      name: 'size',
      title: 'Høyde',
      type: 'string',
      options: {
        list: [
          { title: 'Bånd', value: 'band' },
          { title: 'Full skjerm', value: 'full' },
        ],
      },
      initialValue: 'band',
    }),
  ],
  preview: {
    select: { quote: 'quote' },
    prepare({ quote }) {
      return {
        title: quote ? `«${quote.slice(0, 55)}…»` : 'Statement-panel',
        subtitle: 'Statement-panel (farget flate)',
      }
    },
  },
})
