import { defineType, defineField } from 'sanity'

export const videoSection = defineType({
  name: 'videoSection',
  title: 'Video-seksjon',
  type: 'object',
  fields: [
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: { accept: 'video/*' },
    }),
    defineField({
      name: 'url',
      title: 'Video-URL',
      type: 'url',
      description: 'Alternativ: YouTube/Vimeo-URL',
    }),
    defineField({
      name: 'caption',
      title: 'Bildetekst',
      type: 'string',
    }),
    defineField({
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      initialValue: false,
      description: 'Spill automatisk (uten lyd) når synlig',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Full bredde', value: 'fullWidth' },
          { title: 'Innrammet', value: 'contained' },
        ],
        layout: 'radio',
      },
      initialValue: 'contained',
    }),
  ],
  preview: {
    select: {
      caption: 'caption',
    },
    prepare({ caption }) {
      return { title: caption || 'Video-seksjon', subtitle: 'Video' }
    },
  },
})
