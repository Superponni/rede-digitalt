/**
 * Typografisk finpuss for visning (aldri for lagret innhold i Sanity).
 */

/**
 * Binder sammen tallgrupper med hardt mellomrom, slik at «80 000» aldri
 * brekker over to linjer i en overskrift. Trykken setter tallet samlet, og
 * en overskrift som deler seg i «Medlem nr. 80» / «000!» leser feil.
 *
 * Rører kun mellomrom som står MELLOM to sifre — «nr. 80» påvirkes ikke.
 */
export function noBreakNumbers(text: string): string {
  return text.replace(/(?<=\d)[ \u202f\u2009](?=\d)/g, "\u00a0")
}

/**
 * Kort utgave av en ingress til forsiden og kort: hele setninger fra starten,
 * så mange som får plass innenfor `maxChars`. Første setning er alltid med,
 * også når den alene er lengre (da klipper kortet den med linjebegrensning).
 * Inne i selve saken vises ingressen alltid i sin helhet.
 */
export function shortTeaser(text: string | undefined, maxChars: number): string | undefined {
  if (!text) return text
  // Usynlige tegn fra forhåndsvisningen (klikk-for-å-redigere) teller ikke som lengde.
  const clean = text.replace(/[​-‏⁠-⁤﻿]/g, '').trim()
  // Setningsskille = punktum/utrops-/spørsmålstegn fulgt av mellomrom og stor
  // forbokstav. Da deles ikke «23. august» eller «f.eks. slik» midt i.
  const sentences = clean.split(/(?<=[.!?…]["»”]?)\s+(?=[A-ZÆØÅ«"–-])/)
  let out = sentences[0]
  for (const s of sentences.slice(1)) {
    if (out.length + 1 + s.length > maxChars) break
    out += ' ' + s
  }
  return out
}
