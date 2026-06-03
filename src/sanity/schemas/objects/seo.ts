import { defineType, defineField } from 'sanity'
import { SeoField, SeoInput } from '@/sanity/components/SeoFields'

// Lett redaktørverktøy for finnbarhet. Alle feltene er VALGFRIE overstyringer —
// frontend fyller automatisk inn fornuftige standarder (tittel → artikkeltittel,
// beskrivelse → ingress/teaser, delebilde → hovedbilde). Redaktøren rører kun
// disse når hun bevisst vil avvike. Ingen keyword-felter, ingen «SEO-score» —
// det presser mot generisk tekst og bryter med den redaksjonelle stemmen.
//
// Egne komponenter (SeoField/SeoInput) fjerner objektets fieldset-ramme +
// overskrift og legger introteksten øverst. Se SeoFields.tsx.
export const seo = defineType({
  name: 'seo',
  title: 'Deling & søk',
  type: 'object',
  components: { field: SeoField, input: SeoInput },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Tittel i Google og ved deling (valgfri)',
      type: 'string',
      description: 'Vises i Google-treffet, i nettleserfanen og når lenken deles.',
      validation: (rule) =>
        rule.max(70).warning('Lengre enn ~60 tegn kan bli kuttet i Google.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Beskrivelse i Google og ved deling (valgfri)',
      type: 'text',
      rows: 3,
      description: 'Den korte teksten under tittelen i Google og ved deling.',
      validation: (rule) =>
        rule.max(170).warning('Lengre enn ~155 tegn kan bli kuttet.'),
    }),
    defineField({
      name: 'shareImage',
      title: 'Delebilde (valgfri)',
      type: 'image',
      options: { hotspot: true },
      description: 'Bildet som vises når lenken deles i Slack, Messenger, LinkedIn osv.',
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
