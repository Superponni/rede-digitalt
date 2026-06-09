import { defineType, defineField } from 'sanity'

/**
 * Gif-kort — en gif i et hvitt postkort (lite visuelt avbrekk/spøk). Filen ligger
 * i /public; «src» er stien til den. (Bytt til Sanity-asset senere ved behov.)
 */
export const gifKort = defineType({
  name: 'gifKort',
  title: 'Gif-kort',
  type: 'object',
  fields: [
    defineField({ name: 'src', title: 'Gif-sti', type: 'string', description: 'F.eks. /forkjopsrett/stalk.gif' }),
    defineField({ name: 'alt', title: 'Alt-tekst', type: 'string' }),
    defineField({ name: 'caption', title: 'Bildetekst (valgfri)', type: 'string' }),
    defineField({ name: 'maxWidth', title: 'Maks bredde (px)', type: 'number', initialValue: 320 }),
  ],
  preview: {
    select: { src: 'src', caption: 'caption' },
    prepare({ src, caption }) {
      return { title: 'Gif-kort', subtitle: caption || src || '' }
    },
  },
})
