import { defineQuery } from 'next-sanity'

export const ARTICLES_QUERY = defineQuery(
  `*[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
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
    slug,
    type,
    teaser,
    heroImage,
    body,
    sections,
    scrollyTheme,
    scrollyBackground,
    "audioFileUrl": audioFile.asset->url,
    tags[]->{ _id, title, slug },
    edition->{ _id, title, number, year },
    author->{ _id, name, bio, portrait }
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
    "articles": *[_type == "article" && references(^._id) && defined(slug.current)] | order(publishedAt desc) {
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
  `*[_type == "article" && _id != $id && type == "scrollytelling" && defined(slug.current)] | order(publishedAt desc) [0...3] {
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
    "featured": *[_type == "article" && type == "scrollytelling" && defined(slug.current)] | order(publishedAt desc) [0] {
      _id, title, slug, heroImage, "heroVideoUrl": heroVideo.asset->url, tags[]->{ _id, title }
    }
  }`
)

export const TAG_PAGE_QUERY = defineQuery(
  `{
    "tag": *[_type == "tag" && slug.current == $slug][0] { _id, title, slug },
    "articles": *[_type == "article" && references(*[_type == "tag" && slug.current == $slug][0]._id) && defined(slug.current)] | order(publishedAt desc) {
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
    "articles": *[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
      _id, title, slug, type, teaser, heroImage,
      "heroVideoUrl": heroVideo.asset->url,
      tags[]->{ _id, title, slug }
    },
    "editorial": *[_type == "editorial"][0] {
      _id, title, slug, teaserText, heroImage
    },
    "podcast": *[_type == "podcastEpisode"] | order(publishedAt desc) [0] {
      _id, title, slug, description, spotifyUrl, thumbnail, duration, episodeNumber,
      tags[]->{ _id, title }
    }
  }`
)

export const EDITORIAL_PAGE_QUERY = defineQuery(
  `*[_type == "editorial"][0] {
    _id, title, slug, teaserText, heroImage, fullText,
    "audioFileUrl": audioFile.asset->url,
    edition->{ _id, title, number, year }
  }`
)
