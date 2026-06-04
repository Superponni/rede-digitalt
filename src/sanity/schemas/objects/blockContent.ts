import { defineType, defineArrayMember } from 'sanity'
import { BlockquoteStyle } from '../../components/BlockquoteStyle'

export const blockContent = defineType({
  title: 'Brødtekst',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Sitat', value: 'blockquote', component: BlockquoteStyle },
      ],
      lists: [
        { title: 'Punktliste', value: 'bullet' },
        { title: 'Nummerert', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Fet', value: 'strong' },
          { title: 'Kursiv', value: 'em' },
          { title: 'Understreket', value: 'underline' },
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
          {
            title: 'Intern lenke',
            name: 'internalLink',
            type: 'object',
            fields: [
              {
                title: 'Referanse',
                name: 'reference',
                type: 'reference',
                to: [{ type: 'article' }, { type: 'editorial' }],
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'inlineFactBox',
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          title: 'Bildetekst',
          name: 'caption',
          type: 'string',
        },
        {
          title: 'Fotograf',
          name: 'credit',
          type: 'string',
        },
        {
          title: 'Alt-tekst',
          name: 'alt',
          type: 'string',
          validation: (rule) => rule.required().error('Alt-tekst er påkrevd for tilgjengelighet'),
        },
      ],
    }),
  ],
})
