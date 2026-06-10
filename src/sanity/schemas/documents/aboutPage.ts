import { defineType, defineField } from 'sanity'
import { PreviewInput } from '@/sanity/components/PreviewInput'
import { HIDDEN_ALL_FIELDS_GROUP } from '@/sanity/lib/hideAllFields'

// Innholdet på /om-siden. Tenkt som ett enkelt dokument (lag bare én).
// Temaene og utgavene nederst hentes automatisk fra Sanity og styres ikke her.
export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'Om-side',
  type: 'document',
  components: { input: PreviewInput },
  groups: [
    { name: 'top', title: 'Topp', default: true },
    { name: 'feature', title: 'Fra papir til skjerm' },
    { name: 'rest', title: 'Temaer & utgaver' },
    HIDDEN_ALL_FIELDS_GROUP,
  ],
  fields: [
    defineField({
      name: 'label',
      title: 'Etikett (liten tekst over tittel)',
      type: 'string',
      group: 'top',
      initialValue: 'Om Rede',
    }),
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      group: 'top',
      initialValue: 'Et magasin om bolig, nabolag og folk i Trøndelag.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Ingress',
      type: 'text',
      group: 'top',
      rows: 4,
      initialValue:
        'Rede er TOBBs medlemsmagasin. I 80 år har TOBB bygget hjem og nabolag i Trøndelag — Rede forteller historiene som bor der. Nå tar vi magasinet fra papir til skjerm.',
    }),
    defineField({
      name: 'featureLabel',
      title: 'Etikett',
      type: 'string',
      group: 'feature',
      initialValue: 'Fra papir til skjerm',
    }),
    defineField({
      name: 'featureHeading',
      title: 'Overskrift (på gull-blokken)',
      type: 'string',
      group: 'feature',
      initialValue: 'Ikke en PDF — en opplevelse.',
    }),
    defineField({
      name: 'featureBody',
      title: 'Brødtekst',
      type: 'text',
      group: 'feature',
      rows: 4,
      initialValue:
        'Her kan du scrolle deg gjennom reportasjer som beveger seg, høre stemmene bak historiene og se video — ikke bare lese. Rede er bygget for skjermen, fra første bokstav til siste bilde.',
    }),
    defineField({
      name: 'paperOfferText',
      title: 'Papirtilbud — tekst',
      type: 'text',
      group: 'feature',
      rows: 2,
      initialValue:
        'Ønsker du å motta papirutgaven av Rede? Dette kan du enkelt ordne på',
      description:
        'Vises under brødteksten. Selve «Min side»-lenken settes i de to feltene under.',
    }),
    defineField({
      name: 'paperOfferLinkLabel',
      title: 'Papirtilbud — lenketekst',
      type: 'string',
      group: 'feature',
      initialValue: 'Min side',
    }),
    defineField({
      name: 'paperOfferUrl',
      title: 'Papirtilbud — lenkeadresse (Min side)',
      type: 'url',
      group: 'feature',
      description:
        'La stå tom for å bruke standardlenken. NB: innloggingslenker kan inneholde engangskoder som etter hvert slutter å virke — bytt lenken her hvis den slutter å fungere.',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'topicsLabel',
      title: 'Overskrift over temaene',
      type: 'string',
      group: 'rest',
      initialValue: 'Hva du finner',
      description: 'Selve temaene hentes automatisk fra taggene i Sanity.',
    }),
    defineField({
      name: 'publisherLine',
      title: 'Avsender-linje',
      type: 'string',
      group: 'rest',
      initialValue: 'Rede gis ut av TOBB',
    }),
    defineField({
      name: 'editionsHeading',
      title: 'Overskrift over utgavene',
      type: 'string',
      group: 'rest',
      initialValue: 'Utgaver',
      description: 'Utgavene under hentes automatisk fra Sanity.',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: title || 'Om-side', subtitle: 'Om Rede' }
    },
  },
})
