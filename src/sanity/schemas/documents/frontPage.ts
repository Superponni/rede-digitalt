import { defineType, defineField } from 'sanity'

// Forsiden styres nesten helt av seg selv (se Forside.tsx). Det eneste som
// velges for hånd er den store saken øverst — og eventuelt en stor sak til
// lenger ned. Singleton: ett dokument med fast id `frontPage`.
export const frontPage = defineType({
  name: 'frontPage',
  title: 'Forsiden',
  type: 'document',
  fields: [
    defineField({
      name: 'heroArticle',
      title: 'Forsidesak (den store saken øverst)',
      type: 'reference',
      to: [{ type: 'article' }],
      description:
        'På utgivelsesdagen: magasinets forsidesak. Kommer det en viktig sak senere, velger du den her i stedet. Står feltet tomt, brukes den nyeste saken.',
    }),
    defineField({
      name: 'secondArticle',
      title: 'Stor sak nr. 2 (valgfri)',
      type: 'reference',
      to: [{ type: 'article' }],
      description:
        'Vises stort midt på forsiden, mellom radene med fargede kort. La stå tom for å droppe den.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Forsiden' }
    },
  },
})
