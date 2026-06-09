import { defineType, defineField } from 'sanity'

/**
 * Køen (kølapp) — scroll-drevet: en fysisk kølapp der nummeret ditt ruller fra
 * X+1 ned mot 01 mens du scroller, til det er «din tur». All visuell logikk
 * ligger i KoeLapp-komponenten; her er bare antallet andre i køen redigerbart.
 */
export const koeSlider = defineType({
  name: 'koeSlider',
  title: 'Køen (kølapp)',
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
      return { title: 'Snik i køen (kølapp)', subtitle: `${competitors ?? 29} andre i køen` }
    },
  },
})
