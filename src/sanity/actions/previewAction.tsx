import { EyeOpenIcon } from '@sanity/icons'
import { useRouter } from 'sanity/router'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

// Bygger frontend-stien et dokument forhåndsvises på.
function previewPathFor(props: DocumentActionProps): string | null {
  const doc = (props.draft ?? props.published) as
    | { slug?: { current?: string } }
    | null

  if (props.type === 'article') {
    const slug = doc?.slug?.current
    return slug ? `/artikler/${slug}` : null
  }
  if (props.type === 'editorial') {
    return '/leder'
  }
  return null
}

// Document action: «Forhåndsvis» med øye-ikon. Åpner dokumentet direkte i
// Presentation-verktøyet (side-om-side editor + live preview).
export const previewAction: DocumentActionComponent = (props) => {
  const router = useRouter()
  const previewPath = previewPathFor(props)

  if (!previewPath) return null

  return {
    label: 'Forhåndsvis',
    icon: EyeOpenIcon,
    onHandle: () => {
      router.navigateUrl({
        path: `/presentation?preview=${encodeURIComponent(previewPath)}`,
      })
      props.onComplete?.()
    },
  }
}
