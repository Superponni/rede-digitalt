'use client'

import { MemberField, MemberFieldError } from 'sanity'
import type { FieldProps, ObjectInputProps } from 'sanity'

// Egendefinert rendering av «Deling & søk»-objektet.
//
// Standard objekt-felt tegner en ramme (vertikal grå strek) + en overskrift
// rundt feltene. Overskriften er overflødig (den står allerede i fanen), og
// streken gjør seksjonen tyngre enn den trenger å være. Her:
//   - `SeoField` fjerner fieldset-rammen og overskriften (rendrer kun feltene).
//   - `SeoInput` legger en kort introtekst øverst og rendrer feltene flatt.
//
// Datastrukturen er uendret (`seo.metaTitle` osv.) — dette er ren visning.

const INTRO =
  'Her styrer du sidetittelen (den som vises i nettleserfanen) og hvordan ' +
  'siden ser ut i Google og når lenken deles. Står feltene tomme, hentes ' +
  'tittel, beskrivelse og delebilde automatisk fra innholdet.'

// Field-wrapper uten fieldset-ramme/overskrift — rendrer bare innholdet.
export function SeoField(props: FieldProps) {
  return <>{props.children}</>
}

// Selve feltene, rendret flatt med introtekst øverst.
export function SeoInput(props: ObjectInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <p
        style={{
          margin: 0,
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          color: '#6b7280',
        }}
      >
        {INTRO}
      </p>
      {props.members.map((member) => {
        if (member.kind === 'field') {
          return (
            <MemberField
              key={member.key}
              member={member}
              renderInput={props.renderInput}
              renderField={props.renderField}
              renderItem={props.renderItem}
              renderPreview={props.renderPreview}
            />
          )
        }
        if (member.kind === 'error') {
          return <MemberFieldError key={member.key} member={member} />
        }
        return null
      })}
    </div>
  )
}
