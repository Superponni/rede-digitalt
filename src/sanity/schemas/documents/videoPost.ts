import { defineType, defineField } from 'sanity'
import { PreviewInput } from '@/sanity/components/PreviewInput'

// Videoinnlegg: egen side på /video/<slug>, og nyeste video får et eget kort på
// forsiden. Helst Vimeo-lenke: Vimeo tilpasser kvaliteten til leserens nett og
// håndterer stående video. Opplastet fil er reserve — den spilles rett fra
// Sanity, så den bør være mp4 (H.264) og helst under ca. 100 MB.
export const videoPost = defineType({
  name: 'videoPost',
  title: 'Video',
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
      description: 'Adressen til videosiden: rede.no/video/<slug>. Trykk «Generate».',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 4,
      description: 'Vises under tittelen på videosiden. Første avsnitt brukes også på forsidekortet.',
    }),
    defineField({
      name: 'vimeoUrl',
      title: 'Vimeo-lenke',
      type: 'url',
      description:
        'Anbefalt. Lim inn lenken til videoen på Vimeo (f.eks. https://vimeo.com/123456789). Skjulte videoer fungerer også — bruk lenken med den ekstra koden på slutten. Stående videoer får automatisk stående spiller.',
      validation: (rule) =>
        rule.uri({ scheme: ['https'] }).custom((value) =>
          !value || /^https:\/\/(www\.|player\.)?vimeo\.com\//.test(value)
            ? true
            : 'Lenken må være til vimeo.com',
        ),
    }),
    defineField({
      name: 'video',
      title: 'Videofil (reserve)',
      type: 'file',
      options: { accept: 'video/mp4,video/*' },
      description:
        'Brukes bare når Vimeo-lenken står tom. Mp4-fil med lyd, helst under 100 MB — store filer laster tregt på mobil.',
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { vimeoUrl?: string } | undefined
          return value?.asset || doc?.vimeoUrl ? true : 'Legg inn en Vimeo-lenke eller last opp en videofil'
        }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Miniatyrbilde',
      type: 'image',
      options: { hotspot: true },
      description: 'Vises før videoen startes, og på forsidekortet. Liggende 16:9.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ tekst',
          type: 'string',
          description: 'Kort beskrivelse av bildet for skjermlesere.',
        }),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publisert',
      type: 'datetime',
      description: 'Nyeste video (etter denne datoen) får kortet på forsiden.',
    }),
    defineField({
      name: 'duration',
      title: 'Varighet (sekunder)',
      type: 'number',
      description: 'Valgfritt. Vises som f.eks. «4:32» på kortet og videosiden. La stå tom hvis du ikke vet.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
    },
  },
})
