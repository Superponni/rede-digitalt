import { defineType, defineField } from 'sanity'

export const fullscreenParallax = defineType({
  name: 'fullscreenParallax',
  title: 'Fullskjerm parallax',
  type: 'object',
  fields: [
    defineField({
      name: 'backgroundImage',
      title: 'Bakgrunnsbilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt-tekst', type: 'string' },
        { name: 'credit', title: 'Fotograf', type: 'string' },
      ],
    }),
    defineField({
      name: 'backgroundVideo',
      title: 'Bakgrunnsvideo',
      type: 'file',
      options: { accept: 'video/*' },
      description: 'Valgfri — erstatter bildet',
    }),
    defineField({
      name: 'overlayText',
      title: 'Overliggende tekst',
      type: 'blockContent',
    }),
    defineField({
      name: 'overlayPosition',
      title: 'Tekstplassering',
      type: 'string',
      options: {
        list: [
          { title: 'Venstre', value: 'left' },
          { title: 'Sentrert', value: 'center' },
          { title: 'Høyre', value: 'right' },
        ],
      },
      initialValue: 'center',
    }),
    defineField({
      name: 'darkenOverlay',
      title: 'Mørklegging (%)',
      type: 'number',
      description: '0-100 — gjør bildet mørkere for lesbarhet',
      validation: (rule) => rule.min(0).max(100),
      initialValue: 40,
    }),
  ],
  preview: {
    select: {
      media: 'backgroundImage',
    },
    prepare({ media }) {
      return { title: 'Fullskjerm parallax', media }
    },
  },
})
