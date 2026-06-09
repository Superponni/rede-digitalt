import { defineType, defineField } from 'sanity'
import { ICON_OPTIONS } from '@/lib/forkjopsrett-icons'

/**
 * Illustrert scene — flytende narrativ-byggekloss (immersiv langlesing).
 *
 * Én scene = (valgfri) illustrasjon + fortellende tekst, alltid MIDTSTILT.
 * Illustrasjonen flyter fritt og dukker opp (fade + svak parallaks) når den
 * scrolles inn — den pinnes IKKE. La illustrasjonen stå tom for en ren
 * historie-bro mellom scenene.
 *
 * Ikonene er TOBBs SVG-er i /public/forkjopsrett/icons (normalisert av
 * scripts/normalize-svg-icons.py). Redaktøren velger ikon fra nedtrekksliste.
 */
export const illustratedScene = defineType({
  name: 'illustratedScene',
  title: 'Illustrert scene',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Stikktittel',
      type: 'string',
      description: 'Liten etikett over tittelen, f.eks. «Steg 1» eller «Underveis». Valgfri.',
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Tekst',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'icon',
      title: 'Illustrasjon',
      type: 'string',
      options: { list: ICON_OPTIONS },
      description: 'Velg en TOBB-illustrasjon. La stå tom for en ren historie-bro.',
    }),
    defineField({
      name: 'secondaryIcon',
      title: 'Ekstra illustrasjon',
      type: 'string',
      options: { list: ICON_OPTIONS },
      description: 'Valgfritt lite ekstra-ikon som dukker opp ved siden av hovedillustrasjonen.',
    }),
    defineField({
      name: 'animateIllustration',
      title: 'Sett illustrasjonen sammen bit for bit',
      type: 'boolean',
      initialValue: false,
      description: 'I stedet for å fade ikonet inn, bygges det opp del for del når scenen scrolles inn.',
    }),
    defineField({
      name: 'centerBody',
      title: 'Midtstill brødteksten',
      type: 'boolean',
      initialValue: false,
      description: 'På for korte broer/utsagn (1–2 linjer). Av for lange avsnitt (da står teksten venstrestilt for lesbarhet).',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA-lenketekst',
      type: 'string',
      description: 'Valgfri diskré lenke under teksten, f.eks. «Bli TOBB-medlem».',
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA-lenke (URL)',
      type: 'url',
    }),
  ],
  preview: {
    select: { eyebrow: 'eyebrow', title: 'title', icon: 'icon' },
    prepare({ eyebrow, title, icon }) {
      const label = [eyebrow, title].filter(Boolean).join(' · ') || 'Illustrert scene'
      return { title: label, subtitle: icon || 'Kun tekst' }
    },
  },
})
