'use client'

import type { BlockStyleProps } from 'sanity'

// Egen editor-rendring for «Sitat»-stilen i brødtekst-editoren.
// Sanitys standard rendrer <p> med en <div> inni (ugyldig HTML ⇒ hydrerings-
// advarsel i konsollen). Her bruker vi <blockquote> som rot i stedet, slik at
// den indre <div>-en blir gyldig nestet. Påvirker KUN visningen i Studio –
// frontend bruker PortableTextRenderer.
export function BlockquoteStyle(props: BlockStyleProps) {
  return (
    <blockquote
      style={{
        borderLeft: '3px solid var(--card-border-color, #d0d0d0)',
        paddingLeft: '1rem',
        margin: '0.25rem 0',
        fontStyle: 'italic',
        color: 'var(--card-muted-fg-color, inherit)',
      }}
    >
      {props.children}
    </blockquote>
  )
}
