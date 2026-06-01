'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool, defineLocations, defineDocuments } from 'sanity/presentation'
import { schemaTypes } from '@/sanity/schemas'
import { projectId, dataset } from '@/sanity/env'
import { previewAction } from '@/sanity/actions/previewAction'

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
        // URL → hovedokument: lar Presentation vite hvilket dokument som
        // redigeres når man forhåndsviser en bestemt rute.
        mainDocuments: defineDocuments([
          {
            route: '/artikler/:slug',
            filter: `_type == "article" && slug.current == $slug`,
          },
          {
            route: '/leder',
            filter: `_type == "editorial"`,
          },
        ]),
        locations: {
          article: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              message: 'Åpne live forhåndsvisning av artikkelen',
              tone: 'positive',
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
              message: 'Åpne live forhåndsvisning av lederen',
              tone: 'positive',
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

  document: {
    // «Forhåndsvis»-knapp (øye-ikon) på artikler og ledere → åpner dokumentet
    // direkte i Presentation-verktøyet.
    actions: (prev, context) =>
      context.schemaType === 'article' || context.schemaType === 'editorial'
        ? [...prev, previewAction]
        : prev,
  },
})
