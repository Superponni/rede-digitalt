import { defineQuery } from 'next-sanity'

// Delt filter: kun publiserbare artikler. Utkast uten slug ekskluderes så
// lenke-bygging ikke krasjer. Brukes på tvers av alle artikkel-spørringer slik
// at intensjonen (kun-publiserbare) bor ett sted.
const PUBLISHABLE_ARTICLE = `_type == "article" && defined(slug.current)`

// Felles SEO-fragment. `legacyOgDescription` plukker opp den gamle topp-nivå-
// `ogDescription` fra dokumenter importert før seo-objektet, så fallback i
// generateMetadata fungerer uten re-import.
const SEO_FRAGMENT = `
  seo {
    metaTitle,
    metaDescription,
    shareImage,
    noIndex
  },
  "legacyOgDescription": ogDescription
`

export const ARTICLES_QUERY = defineQuery(
  `*[${PUBLISHABLE_ARTICLE}] | order(publishedAt desc) {
    _id,
    title,
    slug,
    type,
    teaser,
    heroImage,
    "heroVideoUrl": heroVideo.asset->url,
    tags[]->{ _id, title, slug },
    edition->{ _id, title, number, year }
  }`
)

export const ARTICLE_BY_SLUG_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    subtitle,
    slug,
    type,
    teaser,
    accentColor,
    colorMode,
    heroLayout,
    experts[]{ name, role, portrait },
    heroImage,
    body,
    sections,
    publishedAt,
    _updatedAt,
    estimatedReadTime,
    "audioFileUrl": audioFile.asset->url,
    tags[]->{ _id, title, slug },
    edition->{ _id, title, number, year },
    author->{ _id, name, slug, bio, portrait },
    ${SEO_FRAGMENT}
  }`
)

export const EDITION_QUERY = defineQuery(
  `*[_type == "edition"] | order(year desc, number desc) [0] {
    _id,
    title,
    number,
    year,
    coverImage,
    publishedAt,
    "articles": *[${PUBLISHABLE_ARTICLE} && references(^._id)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      type,
      teaser,
      heroImage,
      tags[]->{ _id, title, slug }
    }
  }`
)

export const RELATED_ARTICLES_QUERY = defineQuery(
  `*[${PUBLISHABLE_ARTICLE} && _id != $id && type == "scrollytelling"] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    type,
    teaser,
    heroImage,
    tags[]->{ _id, title, slug }
  }`
)

export const MENU_QUERY = defineQuery(
  `{
    "tags": *[_type == "tag" && defined(slug.current)] | order(title asc) { _id, title, slug },
    "featured": *[${PUBLISHABLE_ARTICLE} && type == "scrollytelling"] | order(publishedAt desc) [0] {
      _id, title, slug, heroImage, "heroVideoUrl": heroVideo.asset->url, tags[]->{ _id, title }
    }
  }`
)

export const TAG_PAGE_QUERY = defineQuery(
  `{
    "tag": *[_type == "tag" && slug.current == $slug][0] { _id, title, slug },
    "articles": *[${PUBLISHABLE_ARTICLE} && references(*[_type == "tag" && slug.current == $slug][0]._id)] | order(publishedAt desc) {
      _id, title, slug, type, teaser, heroImage,
      tags[]->{ _id, title, slug }
    }
  }`
)

export const FRONTPAGE_QUERY = defineQuery(
  `{
    "edition": *[_type == "edition"] | order(year desc, number desc) [0] {
      _id, title, number, year, coverImage
    },
    "articles": *[${PUBLISHABLE_ARTICLE}] | order(publishedAt desc) {
      _id, title, slug, type, teaser, heroImage,
      "expertPortrait": experts[0].portrait,
      "heroVideoUrl": heroVideo.asset->url,
      tags[]->{ _id, title, slug }
    },
    "editorial": *[_type == "editorial"] | order(publishedAt desc) [0] {
      _id, title, slug, teaserText, heroImage
    },
    "podcast": *[_type == "podcastEpisode"] | order(publishedAt desc) [0] {
      _id, title, slug, description, spotifyUrl, thumbnail, duration, episodeNumber,
      tags[]->{ _id, title }
    }
  }`
)

export const ABOUT_PAGE_QUERY = defineQuery(
  `{
    "page": *[_type == "aboutPage"][0] {
      label, title, intro,
      featureLabel, featureHeading, featureBody,
      topicsLabel, publisherLine, editionsHeading
    },
    "editions": *[_type == "edition"] | order(year desc, number desc) {
      _id, title, number, year, coverImage, publishedAt
    },
    "tags": *[_type == "tag" && defined(slug.current)] | order(title asc) {
      _id, title, slug
    }
  }`
)

export const EDITORIAL_PAGE_QUERY = defineQuery(
  `*[_type == "editorial"] | order(publishedAt desc) [0] {
    _id, title, subtitle, slug, teaserText, heroImage, fullText,
    accentColor, colorMode, heroLayout, experts[]{ name, role, portrait },
    publishedAt, _updatedAt,
    "audioFileUrl": audioFile.asset->url,
    edition->{ _id, title, number, year },
    author->{ _id, name },
    ${SEO_FRAGMENT}
  }`
)

// Lettvekts-spørring for sitemap.xml: kun det vi trenger for å liste URL-er og
// «sist endret»-datoer. Ekskluderer sider som er skjult fra Google (seo.noIndex).
export const SITEMAP_QUERY = defineQuery(
  `{
    "articles": *[${PUBLISHABLE_ARTICLE} && seo.noIndex != true] | order(publishedAt desc) {
      "slug": slug.current,
      _updatedAt,
      publishedAt
    },
    "tags": *[_type == "tag" && defined(slug.current)] | order(title asc) {
      "slug": slug.current,
      _updatedAt
    },
    "editorial": *[_type == "editorial" && seo.noIndex != true] | order(publishedAt desc) [0] {
      _updatedAt
    }
  }`
)
