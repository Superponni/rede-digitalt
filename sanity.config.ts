'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool, defineLocations } from 'sanity/presentation'
import { schemaTypes } from '@/sanity/schemas'
import { projectId, dataset } from '@/sanity/env'

export default defineConfig({
  name: 'rede-digitalt',
  title: 'Rede Digitalt',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [
    structureTool(),
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      // Kobler dokumenter til riktig frontend-URL slik at «Åpne i
      // forhåndsvisning» peker rett, og redaktøren ser hvilke sider et
      // dokument vises på.
      resolve: {
        locations: {
          article: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Artikkel',
                  href: `/artikler/${doc?.slug}`,
                },
              ],
            }),
          }),
          editorial: defineLocations({
            select: { title: 'title' },
            resolve: (doc) => ({
              locations: [{ title: doc?.title || 'Leder', href: '/leder' }],
            }),
          }),
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
