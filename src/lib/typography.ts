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
