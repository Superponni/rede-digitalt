import { defineType, defineField } from 'sanity'

export const interactiveQuiz = defineType({
  name: 'interactiveQuiz',
  title: 'Interaktiv quiz',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Stil',
      type: 'string',
      options: {
        list: [
          { title: 'Quiz (flervalg med fasit)', value: 'quiz' },
          { title: 'Poll (vis prosenter)', value: 'poll' },
          { title: 'Visste du at? (trykk for a avsløre)', value: 'didYouKnow' },
        ],
        layout: 'radio',
      },
      initialValue: 'quiz',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'question',
      title: 'Sporsmal',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'options',
      title: 'Alternativer',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'text', title: 'Tekst', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'isCorrect', title: 'Riktig svar?', type: 'boolean', initialValue: false }),
            defineField({ name: 'pollPercent', title: 'Poll-prosent', type: 'number', description: 'Kun for poll-stil' }),
          ],
          preview: {
            select: { text: 'text', isCorrect: 'isCorrect' },
            prepare({ text, isCorrect }) {
              return { title: `${isCorrect ? '✓ ' : ''}${text}` }
            },
          },
        },
      ],
      hidden: ({ parent }) => parent?.style === 'didYouKnow',
    }),
    defineField({
      name: 'answer',
      title: 'Svar / fakta',
      type: 'text',
      rows: 3,
      description: 'For "Visste du at?": faktaen som avsløres. For quiz: tilleggforklaring etter svar.',
    }),
  ],
  preview: {
    select: { question: 'question', style: 'style' },
    prepare({ question, style }) {
      const labels: Record<string, string> = { quiz: 'Quiz', poll: 'Poll', didYouKnow: 'Visste du at?' }
      return { title: question || 'Interaktiv', subtitle: labels[style] || style }
    },
  },
})
