import { defineField, defineType } from 'sanity'

/**
 * Én ekspert-/kilde-rad med portrett, navn og rolle. Brukes i «Eksperter»-lista
 * på artikler og leder, slik at en sak kan ha flere kilder (maks 3) som vises
 * som runde portretter med navn buet over og rolle buet under.
 */
export const expertSource = defineType({
  name: 'expertSource',
  title: 'Ekspert',
  type: 'object',
  fields: [
    defineField({
      name: 'portrait',
      title: 'Portrett',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt-tekst', type: 'string' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Navn (buet over portrettet)',
      type: 'string',
      description: 'F.eks. «Marthe Frantzen».',
    }),
    defineField({
      name: 'role',
      title: 'Rolle/firma (buet under portrettet)',
      type: 'string',
      description: 'F.eks. «EiendomsMegler 1 Heimdal».',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'portrait' },
    prepare: ({ title, subtitle, media }) => ({
      title: title || 'Ekspert uten navn',
      subtitle,
      media,
    }),
  },
})
