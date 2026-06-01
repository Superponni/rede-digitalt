import { defineType, defineField } from 'sanity'
import { PreviewInput } from '@/sanity/components/PreviewInput'

export const editorial = defineType({
  name: 'editorial',
  title: 'Leder',
  type: 'document',
  components: { input: PreviewInput },
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'edition',
      title: 'Utgave',
      type: 'reference',
      to: [{ type: 'edition' }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publisert',
      type: 'datetime',
    }),
    defineField({
      name: 'heroImage',
      title: 'Bilde',
      type: 'image',
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
      rows: 3,
      description: 'Kort intro som vises på forsiden',
    }),
    defineField({
      name: 'fullText',
      title: 'Full tekst',
      type: 'blockContent',
    }),
    defineField({
      name: 'audioFile',
      title: 'Lydfil',
      type: 'file',
      options: { accept: 'audio/*' },
    }),
    defineField({
      name: 'videoFile',
      title: 'Videofil',
      type: 'file',
      options: { accept: 'video/*' },
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
