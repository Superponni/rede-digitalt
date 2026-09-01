import { defineField, defineType } from 'sanity'

/**
 * Én kilde-/intervjuobjekt-rad med portrett, navn og rolle. Brukes i «Portretter»-
 * lista på artikler og leder, slik at en sak kan ha flere kilder (maks 3) som vises
 * som runde portretter med navn buet over og rolle buet under.
 *
 * Ingen felt er påkrevd: en sak har ofte ikke noen kilde å portrettere, og en
 * halvutfylt rad skal ikke blokkere publisering. Frontenden hopper over rader
 * uten bilde (se ExpertRow), og forhåndsvisningen under sier fra om raden ikke
 * kommer til å vises.
 */
export const expertSource = defineType({
  name: 'expertSource',
  title: 'Portrett',
  type: 'object',
  fields: [
    defineField({
      name: 'portrait',
      title: 'Portrett',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt-tekst', type: 'string' }],
      description: 'Uten bilde vises ikke raden på nettsiden.',
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
      description: 'F.eks. «EiendomsMegler 1 Heimdal» eller «initiativtaker».',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'portrait' },
    prepare: ({ title, subtitle, media }) => ({
      title: title || 'Portrett uten navn',
      subtitle: media ? subtitle : 'Mangler bilde – vises ikke på nettsiden',
      media,
    }),
  },
})
