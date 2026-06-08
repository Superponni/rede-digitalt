import { type SchemaTypeDefinition } from 'sanity'

// Dokumenttyper
import { article } from './documents/article'
import { aboutPage } from './documents/aboutPage'
import { edition } from './documents/edition'
import { editorial } from './documents/editorial'
import { videoPost } from './documents/videoPost'
import { podcastEpisode } from './documents/podcastEpisode'
import { tag } from './documents/tag'
import { author } from './documents/author'
import { memberOffer } from './documents/memberOffer'

// Objekttyper (seksjoner + blockContent)
import { seo } from './objects/seo'
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
import { collage } from './objects/collage'
import { statementPanel } from './objects/statementPanel'
import { stickyPortrait } from './objects/stickyPortrait'
import { recipeCard } from './objects/recipeCard'
import { countUpFact } from './objects/countUpFact'
import { numberedStop } from './objects/numberedStop'
import { interactiveQuiz } from './objects/interactiveQuiz'
import { expertSource } from './objects/expertSource'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Dokumenter
  article,
  aboutPage,
  edition,
  editorial,
  videoPost,
  podcastEpisode,
  memberOffer,
  tag,
  author,
  // Objekter
  seo,
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
  collage,
  statementPanel,
  stickyPortrait,
  recipeCard,
  countUpFact,
  numberedStop,
  interactiveQuiz,
  expertSource,
]
