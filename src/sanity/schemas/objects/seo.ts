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
      title: 'Søketittel (valgfri)',
      type: 'string',
      description:
        'Tittelen som vises i Google-treff og i fanen. La stå tom for å bruke artikkeltittelen. Hold den under ~60 tegn så den ikke kuttes.',
      validation: (rule) =>
        rule.max(70).warning('Lengre enn ~60 tegn kan bli kuttet i Google.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Søkebeskrivelse (valgfri)',
      type: 'text',
      rows: 3,
      description:
        'Den korte teksten under tittelen i Google og ved deling. La stå tom for å bruke ingressen/teaseren. Ideelt 120–155 tegn.',
      validation: (rule) =>
        rule.max(170).warning('Lengre enn ~155 tegn kan bli kuttet.'),
    }),
    defineField({
      name: 'shareImage',
      title: 'Delebilde (valgfri)',
      type: 'image',
      options: { hotspot: true },
      description:
        'Bildet som vises når lenken deles i Slack, Messenger, LinkedIn osv. La stå tom for å bruke hovedbildet.',
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
      description:
        'Slå på hvis denne siden IKKE skal dukke opp i søkemotorer (f.eks. utkast eller intern info). Normalt av.',
    }),
  ],
})
