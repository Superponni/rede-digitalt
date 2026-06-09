import { defineType, defineField } from 'sanity'

/**
 * Køen (snik-slider) — interaktiv: du er den røde personen i køen, dra deg
 * fremover. All visuell logikk ligger i KoeSlider-komponenten; her er bare
 * antallet andre i køen redigerbart.
 */
export const koeSlider = defineType({
  name: 'koeSlider',
  title: 'Køen (snik-slider)',
  type: 'object',
  fields: [
    defineField({
      name: 'competitors',
      title: 'Antall andre i køen',
      type: 'number',
      initialValue: 29,
      validation: (r) => r.min(6).max(40),
    }),
  ],
  preview: {
    select: { competitors: 'competitors' },
    prepare({ competitors }) {
      return { title: 'Snik i køen', subtitle: `${competitors ?? 29} andre i køen` }
    },
  },
})
