import { defineType, defineField } from 'sanity'

export const audioSection = defineType({
  name: 'audioSection',
  title: 'Lyd-seksjon',
  type: 'object',
  fields: [
    defineField({
      name: 'audioFile',
      title: 'Lydfil',
      type: 'file',
      options: { accept: 'audio/*' },
    }),
    defineField({
      name: 'spotifyEmbed',
      title: 'Spotify-URL',
      type: 'url',
      description: 'For TOBBcast-episoder',
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return { title: title || 'Lyd-seksjon', subtitle: 'Lyd' }
    },
  },
})
