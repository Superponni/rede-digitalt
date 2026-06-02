// Bygger frontend-stien et dokument forhåndsvises på. Delt av øye-knappen i
// dokumentskjemaet (`PreviewInput`).
export function previewPathFor(
  type: string | undefined,
  doc: { slug?: { current?: string } } | null | undefined,
): string | null {
  if (type === 'article') {
    const slug = doc?.slug?.current
    return slug ? `/artikler/${slug}` : null
  }
  if (type === 'editorial') {
    return '/leder'
  }
  if (type === 'aboutPage') {
    return '/om'
  }
  return null
}
