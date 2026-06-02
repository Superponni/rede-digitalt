import { type SchemaTypeDefinition } from 'sanity'

// Dokumenttyper
import { article } from './documents/article'
import { edition } from './documents/edition'
import { editorial } from './documents/editorial'
import { videoPost } from './documents/videoPost'
import { podcastEpisode } from './documents/podcastEpisode'
import { tag } from './documents/tag'
import { author } from './documents/author'

// Objekttyper (seksjoner + blockContent)
import { blockContent } from './objects/blockContent'
import { heroSection } from './objects/heroSection'
import { textWithImage } from './objects/textWithImage'
import { fullscreenParallax } from './objects/fullscreenParallax'
import { pullQuote } from './objects/pullQuote'
import { videoSection } from './objects/videoSection'
import { audioSection } from './objects/audioSection'
import { factBox } from './objects/factBox'
import { inlineFactBox } from './objects/inlineFactBox'
import { gallery } from './objects/gallery'
import { stickyPortrait } from './objects/stickyPortrait'
import { recipeCard } from './objects/recipeCard'
import { countUpFact } from './objects/countUpFact'
import { numberedStop } from './objects/numberedStop'
import { interactiveQuiz } from './objects/interactiveQuiz'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Dokumenter
  article,
  edition,
  editorial,
  videoPost,
  podcastEpisode,
  tag,
  author,
  // Objekter
  blockContent,
  heroSection,
  textWithImage,
  fullscreenParallax,
  pullQuote,
  videoSection,
  audioSection,
  factBox,
  inlineFactBox,
  gallery,
  stickyPortrait,
  recipeCard,
  countUpFact,
  numberedStop,
  interactiveQuiz,
]
