'use client'

import { defineConfig, definePlugin } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool, defineDocuments } from 'sanity/presentation'
import { HomeIcon } from '@sanity/icons'
import { schemaTypes } from '@/sanity/schemas'
import { projectId, dataset } from '@/sanity/env'
import { WelcomeGuide } from '@/sanity/components/WelcomeGuide'

// Velkomstfane: legges først slik at studioet åpner på en veiviser i stedet
// for en tom skjerm. Se WelcomeGuide.tsx for innholdet.
const welcomeTool = definePlugin({
  name: 'rede-welcome',
  tools: (prev) => [
    {
      name: 'velkommen',
      title: 'Velkommen',
      icon: HomeIcon,
      component: WelcomeGuide,
    },
    ...prev,
  ],
})

export default defineConfig({
  name: 'rede-digitalt',
  title: 'Rede Digitalt',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [
    welcomeTool(),
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
          {
            route: '/om',
            filter: `_type == "aboutPage"`,
          },
        ]),
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
