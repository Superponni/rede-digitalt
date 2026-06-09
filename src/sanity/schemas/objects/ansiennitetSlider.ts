import { defineType, defineField } from 'sanity'

/**
 * Ansiennitet-slider — interaktivt grep: dra på antall år som medlem og se hvor
 * langt frem i køen du står. Bevisst kvalitativ (ingen falske presise tall).
 * Logikk + køvisualisering ligger i komponenten; her styres kun teksten.
 */
export const ansiennitetSlider = defineType({
  name: 'ansiennitetSlider',
  title: 'Ansiennitet-slider',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      initialValue: 'Hvor sterkt står du i køen?',
    }),
    defineField({
      name: 'intro',
      title: 'Ingress',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'maxYears',
      title: 'Maks antall år',
      type: 'number',
      initialValue: 40,
      validation: (rule) => rule.min(5).max(60),
    }),
    defineField({
      name: 'footnote',
      title: 'Fotnote',
      type: 'string',
      description: 'Liten kursiv linje under — presiserer at det er en illustrasjon.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Ansiennitet-slider', subtitle: 'Interaktiv «din plass i køen»' }
    },
  },
})
