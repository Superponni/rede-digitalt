import { defineType, defineField } from 'sanity'
import { ICON_OPTIONS } from '@/lib/forkjopsrett-icons'

/**
 * Illustrert cover — helskjerms åpning for feature-saker uten foto.
 * Stor tittel + signatur-illustrasjon + scroll-pekepinn på artikkelens flate.
 */
export const illustratedCover = defineType({
  name: 'illustratedCover',
  title: 'Illustrert cover',
  type: 'object',
  fields: [
    defineField({
      name: 'kicker',
      title: 'Kicker',
      type: 'string',
      description: 'Liten etikett over tittelen, f.eks. «Forkjøpsrett». Valgfri.',
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dek',
      title: 'Ingress',
      type: 'text',
      rows: 2,
      description: 'Kort linje under tittelen.',
    }),
    defineField({
      name: 'icon',
      title: 'Illustrasjon',
      type: 'string',
      options: { list: ICON_OPTIONS },
      description: 'Signatur-illustrasjonen på coveret.',
    }),
    defineField({
      name: 'secondaryIcon',
      title: 'Ekstra illustrasjon',
      type: 'string',
      options: { list: ICON_OPTIONS },
      description: 'Valgfritt lite ekstra-ikon ved siden av hovedillustrasjonen.',
    }),
  ],
  preview: {
    select: { title: 'title', kicker: 'kicker', icon: 'icon' },
    prepare({ title, kicker, icon }) {
      return { title: title || 'Illustrert cover', subtitle: [kicker, icon].filter(Boolean).join(' · ') || undefined }
    },
  },
})
