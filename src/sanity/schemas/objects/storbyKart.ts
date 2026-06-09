import { defineType, defineField } from 'sanity'

/**
 * Storby-kart — Norge-silhuett + by-prikker som lyser opp (Trondheim som puls-
 * senter). Byene/geografien ligger i komponenten; her er bare teksten redigerbar.
 */
export const storbyKart = defineType({
  name: 'storbyKart',
  title: 'Storby-kart',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Stikktittel', type: 'string', initialValue: 'Hele landet' }),
    defineField({ name: 'title', title: 'Tittel', type: 'string', initialValue: 'Og ikke bare i Trondheim' }),
    defineField({ name: 'intro', title: 'Ingress', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: 'Storby-kart', subtitle: title || '' }
    },
  },
})
