import { defineType, defineField } from 'sanity'
import { ICON_OPTIONS } from '@/lib/forkjopsrett-icons'

/**
 * Sticky-vei — klassisk scrollytelling: illustrasjonen står (sticky) mens stegene
 * leses nedover, og settes sammen på nytt for hvert steg. Brukes for «veiene»
 * (Forhåndsavklaring / Fastprisavklaring).
 */
export const stickyVei = defineType({
  name: 'stickyVei',
  title: 'Vei (sticky-steg)',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Etikett', type: 'string', description: 'F.eks. «Vei 1 · Forhåndsavklaring».' }),
    defineField({ name: 'badge', title: 'Merkelapp', type: 'string', description: 'F.eks. «95 % av salgene» eller «Unntaket».' }),
    defineField({ name: 'intro', title: 'Ingress', type: 'text', rows: 3 }),
    defineField({
      name: 'steps',
      title: 'Steg',
      type: 'array',
      validation: (r) => r.min(1),
      of: [
        {
          type: 'object',
          name: 'stickyVeiStep',
          title: 'Steg',
          fields: [
            defineField({ name: 'title', title: 'Tittel', type: 'string' }),
            defineField({ name: 'text', title: 'Tekst', type: 'text', rows: 3 }),
            defineField({
              name: 'icon',
              title: 'Illustrasjon',
              type: 'string',
              options: { list: ICON_OPTIONS },
            }),
          ],
          preview: {
            select: { title: 'title', icon: 'icon' },
            prepare({ title, icon }) {
              return { title: title || 'Steg', subtitle: icon || '' }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { label: 'label', badge: 'badge', steps: 'steps' },
    prepare({ label, badge, steps }) {
      const n = Array.isArray(steps) ? steps.length : 0
      return { title: label || 'Vei', subtitle: `${badge ? badge + ' · ' : ''}${n} steg` }
    },
  },
})
