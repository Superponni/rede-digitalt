'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool, defineDocuments } from 'sanity/presentation'
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
      // URL → hovedokument: lar Presentation vite hvilket dokument som
      // redigeres når man forhåndsviser en bestemt rute. (Selve inngangen til
      // forhåndsvisning er øye-knappen øverst i dokumentet, se `PreviewInput`.)
      resolve: {
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
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
