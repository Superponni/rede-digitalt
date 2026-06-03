import { defineType, defineField } from 'sanity'

export const textWithImage = defineType({
  name: 'textWithImage',
  title: 'Tekst med bilde',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Tekst',
      type: 'blockContent',
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt-tekst', type: 'string' },
        { name: 'credit', title: 'Fotograf', type: 'string' },
        { name: 'caption', title: 'Bildetekst', type: 'string' },
      ],
    }),
    defineField({
      name: 'imagePosition',
      title: 'Bildeplassering',
      type: 'string',
      options: {
        list: [
          { title: 'Venstre', value: 'left' },
          { title: 'Høyre', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({
      name: 'imageSize',
      title: 'Bildestørrelse',
      type: 'string',
      options: {
        list: [
          { title: 'Liten', value: 'small' },
          { title: 'Medium', value: 'medium' },
          { title: 'Stor', value: 'large' },
        ],
      },
      initialValue: 'medium',
    }),
  ],
  preview: {
    select: {
      media: 'image',
    },
    prepare({ media }) {
      return { title: 'Tekst med bilde', media }
    },
  },
})
