import { urlFor } from './image'

/**
 * Felles bildehjelpere. Samler logikken for skarphet, originalformat og
 * fokus-bevisst beskjæring ett sted, så alle visninger oppfører seg likt.
 *
 * Sanity legger automatisk på både beskjæringen (rektangelet) og fokuspunktet
 * (sirkelen) som redaktøren setter i Studio — så lenge vi sender hele
 * bilde-objektet (med `hotspot`/`crop`) inn i `urlFor`. Det gjør GROQ-spørringene
 * ved å projisere hele `heroImage`-objektet.
 */

export interface SanityImageRef {
  asset?: { _ref?: string }
  hotspot?: { x: number; y: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
  credit?: string
}

/**
 * Bildets egne pikseldimensjoner, lest ut av asset-referansen
 * (`image-<hash>-<bredde>x<høyde>-<ext>`). Brukes for å beholde originalformatet.
 */
export function imageDims(image?: SanityImageRef): { width: number; height: number } {
  const m = image?.asset?._ref?.match(/-(\d+)x(\d+)-[a-z]+$/i)
  return m ? { width: Number(m[1]), height: Number(m[2]) } : { width: 1600, height: 1000 }
}

/**
 * CSS `object-position` fra fokuspunktet. Brukes når boksen har et *dynamisk*
 * format (f.eks. forsidegrid som strekker seg), der vi ikke kan be Sanity
 * beskjære til et fast format på forhånd.
 */
export function focalPosition(image?: SanityImageRef): string {
  const h = image?.hotspot
  return h ? `${(h.x * 100).toFixed(1)}% ${(h.y * 100).toFixed(1)}%` : 'center center'
}

/**
 * Originalformat i full skarphet. Beholder en evt. beskjæring satt i Studio,
 * men endrer ikke formatet. `next/image` lager skarpe varianter per
 * skjermstørrelse ned fra denne. Brukes til heldekkende toppbilder og brødtekst.
 */
export function naturalSrc(image: SanityImageRef, maxWidth = 3840): string {
  return urlFor(image).width(maxWidth).url()
}

/**
 * Fokus-bevisst beskjæring til et fast format (Sanity beskjærer rundt
 * fokuspunktet, server-side) i høy nok oppløsning til retina-skjermer.
 * Brukes der boksen har et *fast* format (kort med 3/4, side-oppsettets ramme).
 */
export function coverSrc(
  image: SanityImageRef,
  ratioW: number,
  ratioH: number,
  baseWidth = 1600,
): string {
  const height = Math.round((baseWidth * ratioH) / ratioW)
  return urlFor(image).width(baseWidth).height(height).fit('crop').url()
}
