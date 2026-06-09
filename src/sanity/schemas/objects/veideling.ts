import { defineType, defineField } from 'sanity'

/**
 * Veideling — lite visuelt veiskille (strek som deler seg i hovedvei + sidevei).
 * Setter opp de to sticky-veiene som følger.
 */
export const veideling = defineType({
  name: 'veideling',
  title: 'Veiskille (Y-deling)',
  type: 'object',
  fields: [
    defineField({ name: 'intro', title: 'Inngangstekst', type: 'text', rows: 2, description: 'Kort, f.eks. «Her deler veien seg.»' }),
    defineField({ name: 'mainLabel', title: 'Hovedvei — navn', type: 'string', initialValue: 'Forhåndsavklaring' }),
    defineField({ name: 'mainBadge', title: 'Hovedvei — merkelapp', type: 'string', initialValue: '95 % av salgene' }),
    defineField({ name: 'sideLabel', title: 'Sidevei — navn', type: 'string', initialValue: 'Fastprisavklaring' }),
    defineField({ name: 'sideBadge', title: 'Sidevei — merkelapp', type: 'string', initialValue: 'Unntaket' }),
  ],
  preview: {
    select: { main: 'mainLabel', side: 'sideLabel' },
    prepare({ main, side }) {
      return { title: 'Veiskille', subtitle: `${main || 'Hovedvei'} / ${side || 'Sidevei'}` }
    },
  },
})
