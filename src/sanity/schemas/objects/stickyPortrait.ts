import { defineType, defineField } from 'sanity'

export const stickyPortrait = defineType({
  name: 'stickyPortrait',
  title: 'Pinnet portrett',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Portrettbilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt-tekst', type: 'string' },
        { name: 'photographer', title: 'Fotograf', type: 'string' },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Tekst',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Teksten som scroller forbi det pinnede bildet',
    }),
    defineField({
      name: 'imagePosition',
      title: 'Bildeside',
      type: 'string',
      options: {
        list: [
          { title: 'Venstre', value: 'left' },
          { title: 'Hoyre', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
  ],
  preview: {
    select: { media: 'image' },
    prepare({ media }) {
      return { title: 'Pinnet portrett', media }
    },
  },
})
