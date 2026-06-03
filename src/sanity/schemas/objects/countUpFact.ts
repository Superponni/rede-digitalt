import { defineType, defineField } from 'sanity'

export const countUpFact = defineType({
  name: 'countUpFact',
  title: 'Opptellende tall',
  type: 'object',
  fields: [
    defineField({
      name: 'number',
      title: 'Tall',
      type: 'number',
      validation: (rule) => rule.required(),
      description: 'Tallet som telles opp til (f.eks. 1681, 42, 2024)',
    }),
    defineField({
      name: 'prefix',
      title: 'Prefiks',
      type: 'string',
      description: 'Tekst foran tallet (f.eks. "ca.")',
    }),
    defineField({
      name: 'suffix',
      title: 'Suffiks',
      type: 'string',
      description: 'Tekst etter tallet (f.eks. "km", "meter", "%")',
    }),
    defineField({
      name: 'label',
      title: 'Beskrivelse',
      type: 'string',
      description: 'Kort tekst under tallet (f.eks. "kilometer langs ruten")',
    }),
  ],
  preview: {
    select: { number: 'number', label: 'label' },
    prepare({ number, label }) {
      return { title: `${number || '?'} — ${label || 'Opptellende tall'}` }
    },
  },
})
