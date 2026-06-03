import { ALL_FIELDS_GROUP } from 'sanity'

// Skjuler den innebygde «Alle felt»-fanen (Sanity legger den til automatisk når
// et dokument har faner). Sanity hopper over sin egen versjon når vi selv
// definerer en gruppe med samme navn — og `hidden: true` filtrerer den bort i
// vanlig redigering. Den dukker kun opp hvis endrings-/diff-panelet åpnes, der
// alle felt MÅ vises. Bruker konstantens navn/tittel så det tåler oppdateringer.
export const HIDDEN_ALL_FIELDS_GROUP = {
  name: ALL_FIELDS_GROUP.name,
  title: ALL_FIELDS_GROUP.title,
  hidden: true,
}
