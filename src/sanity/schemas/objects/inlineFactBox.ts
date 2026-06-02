import { defineType, defineField } from 'sanity'

/**
 * Inline-faktaboks for standard-artikler.
 * Innrammet boks i brødtekstflyten med valgfri egen tittel og kulepunkter.
 * Bevisst enklere enn scrollytelling-`factBox` (ingen bakgrunnsfarge/overgang/stil)
 * — redaktøren skal kun forholde seg til tittel + innhold.
 */
export const inlineFactBox = defineType({
  name: 'inlineFactBox',
  title: 'Faktaboks',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Valgfri. Står det tomt, vises «Faktaboks».',
    }),
    defineField({
      name: 'content',
      title: 'Innhold',
      description: 'Kort, oppsummert info. Bruk gjerne kulepunkter.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Punktliste', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Fet', value: 'strong' },
              { title: 'Kursiv', value: 'em' },
            ],
            annotations: [
              {
                title: 'Lenke',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                    validation: (rule) =>
                      rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
                  },
                  {
                    title: 'Åpne i ny fane',
                    name: 'blank',
                    type: 'boolean',
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
      ],
      validation: (rule) => rule.required().min(1).error('Faktaboksen må ha innhold'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return { title: title || 'Faktaboks', subtitle: 'Faktaboks' }
    },
  },
})
