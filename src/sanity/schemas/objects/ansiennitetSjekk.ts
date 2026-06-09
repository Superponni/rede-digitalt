import { defineType, defineField } from 'sanity'

/**
 * Ansiennitet-sjekk — personlig landing: «Når ble du medlem?» → din ansiennitet +
 * hvor sterkt du står (kalkulator i hvit boks). CTA vises kun ved 0 år. Vurderings-
 * tekstene ligger i komponenten; her er CTA + årsspenn redigerbart.
 */
export const ansiennitetSjekk = defineType({
  name: 'ansiennitetSjekk',
  title: 'Ansiennitet-sjekk (personlig)',
  type: 'object',
  fields: [
    defineField({ name: 'ctaLabel', title: 'CTA-knapp tekst', type: 'string', initialValue: 'Bli TOBB-medlem' }),
    defineField({ name: 'ctaHref', title: 'CTA-lenke', type: 'url', initialValue: 'https://tobb.no/bli-medlem/' }),
    defineField({
      name: 'minYear',
      title: 'Tidligste år på slideren',
      type: 'number',
      description: 'La stå tom for «i år minus 40».',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Ansiennitet-sjekk', subtitle: 'Når ble du medlem? + CTA' }
    },
  },
})
