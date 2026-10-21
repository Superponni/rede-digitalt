import { defineType, defineField } from 'sanity'

// Forsiden styres nesten helt av seg selv (se Forside.tsx). Det eneste som
// velges for hånd er de tre store sakene øverst og den store saken midt på. Singleton: ett dokument med
// fast id `frontPage`.
export const frontPage = defineType({
  name: 'frontPage',
  title: 'Forsiden',
  type: 'document',
  fields: [
    defineField({
      name: 'topArticles',
      title: 'Toppsaker (de tre store sakene øverst)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: (rule) => rule.max(3).unique(),
      description:
        'Velg opptil tre saker, i den rekkefølgen de skal stå (venstre mot høyre). Tomme plasser fylles automatisk: først saker merket «toppraden», så de nyeste i trykkrekkefølge.',
    }),
    defineField({
      name: 'featureArticle',
      title: 'Stor sak midt på siden (valgfri)',
      type: 'reference',
      to: [{ type: 'article' }],
      description:
        'Vises stort mellom to linjer, etter første rad med kort: tekst til venstre, bilde til høyre. Står feltet tomt, brukes neste sak i rekka.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Forsiden' }
    },
  },
})
