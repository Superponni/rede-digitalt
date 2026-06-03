import { defineType, defineField } from 'sanity'

// Lett redaktørverktøy for finnbarhet. Alle feltene er VALGFRIE overstyringer —
// frontend fyller automatisk inn fornuftige standarder (tittel → artikkeltittel,
// beskrivelse → ingress/teaser, delebilde → hovedbilde). Redaktøren rører kun
// disse når hun bevisst vil avvike. Ingen keyword-felter, ingen «SEO-score» —
// det presser mot generisk tekst og bryter med den redaksjonelle stemmen.
export const seo = defineType({
  name: 'seo',
  title: 'Deling & søk',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Tittel i Google og ved deling (valgfri)',
      type: 'string',
      description:
        'Endrer ikke selve artikkeloverskriften. Tom = artikkeltittelen brukes.',
      validation: (rule) =>
        rule.max(70).warning('Lengre enn ~60 tegn kan bli kuttet i Google.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Beskrivelse i Google og ved deling (valgfri)',
      type: 'text',
      rows: 3,
      description:
        'Den korte teksten under tittelen. Tom = ingressen/teaseren brukes.',
      validation: (rule) =>
        rule.max(170).warning('Lengre enn ~155 tegn kan bli kuttet.'),
    }),
    defineField({
      name: 'shareImage',
      title: 'Delebilde (valgfri)',
      type: 'image',
      options: { hotspot: true },
      description: 'Bildet som vises når lenken deles. Tom = hovedbildet brukes.',
      fields: [
        {
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'noIndex',
      title: 'Skjul fra Google',
      type: 'boolean',
      initialValue: false,
      description: 'Slå på hvis siden ikke skal dukke opp i Google. Normalt av.',
    }),
  ],
})
