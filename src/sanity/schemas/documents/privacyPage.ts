import { defineType, defineField } from 'sanity'

// Personvernerklæringen på /personvern. Singleton — det finnes kun ett
// dokument (fast _id «privacyPage»), opprettet via scripts/seed-privacy-page.ts.
// Redaktøren kan finpusse ordlyden fritt herfra; «Sist oppdatert» på siden
// følger dokumentets _updatedAt automatisk.
export const privacyPage = defineType({
  name: 'privacyPage',
  title: 'Personvern',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      initialValue: 'Personvern',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Ingress',
      type: 'text',
      rows: 4,
      description: 'Kort innledning som vises rett under tittelen.',
    }),
    defineField({
      name: 'body',
      title: 'Innhold',
      type: 'blockContent',
      description: 'Selve personvernteksten. Bruk H2 for seksjonsoverskrifter.',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: title || 'Personvern', subtitle: 'Personvernerklæring' }
    },
  },
})
