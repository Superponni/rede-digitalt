'use client'

import { EyeOpenIcon } from '@sanity/icons'
import { useState } from 'react'
import { useRouter } from 'sanity/router'
import { usePresentationParams } from 'sanity/presentation'
import type { ObjectInputProps } from 'sanity'
import { previewPathFor } from '@/sanity/lib/preview'

// Øye-knapp øverst i dokumentskjemaet. Ett klikk åpner dokumentet i
// Presentation-verktøyet (side-om-side editor + live forhåndsvisning) via
// `edit`-intent med `mode: 'presentation'` — samme mønster som Sanitys egen
// «Open in Structure», så navigeringen er robust på tvers av verktøy.
export function PreviewInput(props: ObjectInputProps) {
  const router = useRouter()
  const [hover, setHover] = useState(false)

  // Skjul knappen når skjemaet allerede vises inne i Presentation — der er den
  // overflødig (man ser preview-en ved siden av). `usePresentationParams(false)`
  // returnerer null utenfor Presentation i stedet for å kaste.
  const inPresentation = Boolean(usePresentationParams(false))

  const value = props.value as
    | { _id?: string; _type?: string; slug?: { current?: string } }
    | undefined

  const id = value?._id
  const type = value?._type
  const previewPath = previewPathFor(type, value)
  const canPreview = !inPresentation && Boolean(id && type && previewPath)

  const openPreview = () => {
    if (!id || !type || !previewPath) return
    router.navigateIntent('edit', {
      id,
      type,
      mode: 'presentation',
      preview: previewPath,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {canPreview && (
        <button
          type="button"
          onClick={openPreview}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            width: '100%',
            padding: '0.85rem 1rem',
            border: '1px solid #c2e0cd',
            borderRadius: 6,
            background: hover ? '#d6efe0' : '#e6f4ec',
            color: '#1a6e44',
            font: 'inherit',
            fontWeight: 500,
            fontSize: '0.9375rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 120ms ease',
          }}
        >
          <EyeOpenIcon style={{ fontSize: '1.4rem', flexShrink: 0 }} />
          Åpne live forhåndsvisning
        </button>
      )}
      {props.renderDefault(props)}
    </div>
  )
}
