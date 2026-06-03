import { defineType, defineField } from 'sanity'
import { PreviewInput } from '@/sanity/components/PreviewInput'
import { HIDDEN_ALL_FIELDS_GROUP } from '@/sanity/lib/hideAllFields'

export const editorial = defineType({
  name: 'editorial',
  title: 'Leder',
  type: 'document',
  components: { input: PreviewInput },
  // Faner: innhold i «Leder», finnbarhet i «Deling & søk» (jf. artikkel/om-side).
  groups: [
    { name: 'innhold', title: 'Leder', default: true },
    { name: 'seo', title: 'Deling & søk' },
    HIDDEN_ALL_FIELDS_GROUP,
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      group: 'innhold',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'innhold',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'edition',
      title: 'Utgave',
      type: 'reference',
      group: 'innhold',
      to: [{ type: 'edition' }],
    }),
    defineField({
      name: 'author',
      title: 'Forfatter',
      type: 'reference',
      group: 'innhold',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publisert',
      type: 'datetime',
      group: 'innhold',
    }),
    defineField({
      name: 'heroImage',
      title: 'Bilde',
      type: 'image',
      group: 'innhold',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'teaserText',
      title: 'Teaser-tekst',
      type: 'text',
      group: 'innhold',
      rows: 3,
      description: 'Kort intro som vises på forsiden',
    }),
    defineField({
      name: 'fullText',
      title: 'Full tekst',
      type: 'blockContent',
      group: 'innhold',
    }),
    defineField({
      name: 'audioFile',
      title: 'Lydfil',
      type: 'file',
      group: 'innhold',
      options: { accept: 'audio/*' },
    }),
    defineField({
      name: 'videoFile',
      title: 'Videofil',
      type: 'file',
      group: 'innhold',
      options: { accept: 'video/*' },
    }),
    defineField({
      name: 'seo',
      title: 'Deling & søk',
      type: 'seo',
      group: 'seo',
      // Introtekst + visning styres av SeoField/SeoInput (se SeoFields.tsx).
    }),
  ],
  preview: {
    select: {
      title: 'title',
      editionTitle: 'edition.title',
    },
    prepare({ title, editionTitle }) {
      return {
        title,
        subtitle: editionTitle ? `Leder – ${editionTitle}` : 'Leder',
      }
    },
  },
})
