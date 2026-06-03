import type { StructureResolver } from 'sanity/structure'
import {
  DocumentTextIcon,
  ComposeIcon,
  VideoIcon,
  MicrophoneIcon,
  HomeIcon,
  BookIcon,
  UsersIcon,
  TagsIcon,
} from '@sanity/icons'

// Egendefinert venstremeny. Default-lista blander daglig arbeid med ting man
// setter opp én gang. Her ligger det redaktøren jobber i daglig øverst, og
// oppsett/byggeklosser samlet under en skillelinje.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Innhold')
    .items([
      S.listItem()
        .title('Artikler')
        .icon(DocumentTextIcon)
        .child(S.documentTypeList('article').title('Artikler')),
      S.listItem()
        .title('Ledere')
        .icon(ComposeIcon)
        .child(S.documentTypeList('editorial').title('Ledere')),
      S.listItem()
        .title('Videoer')
        .icon(VideoIcon)
        .child(S.documentTypeList('videoPost').title('Videoer')),
      S.listItem()
        .title('Podkast-episoder')
        .icon(MicrophoneIcon)
        .child(S.documentTypeList('podcastEpisode').title('Podkast-episoder')),

      S.divider(),

      // Oppsett — sjelden brukt etter at utgaven er satt opp
      S.listItem()
        .title('Om-siden')
        .icon(HomeIcon)
        .child(S.documentTypeList('aboutPage').title('Om-siden')),
      S.listItem()
        .title('Utgaver')
        .icon(BookIcon)
        .child(S.documentTypeList('edition').title('Utgaver')),
      S.listItem()
        .title('Forfattere')
        .icon(UsersIcon)
        .child(S.documentTypeList('author').title('Forfattere')),
      S.listItem()
        .title('Tags')
        .icon(TagsIcon)
        .child(S.documentTypeList('tag').title('Tags')),
    ])
