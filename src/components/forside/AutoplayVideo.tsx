'use client'

import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

/**
 * Lite klient-øyfor de autospillende (muted, dekorative) videokortene på
 * forsiden. Holdes adskilt fra DiscoverView slik at selve forsiden forblir en
 * server-komponent. Ved «redusert bevegelse» autospilles ikke videoen — da
 * vises plakatbildet (første bilde) statisk i stedet.
 */
export function AutoplayVideo({
  src,
  poster,
  className,
}: {
  src: string
  poster?: string
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  return (
    <video
      autoPlay={!reduced}
      muted
      loop={!reduced}
      playsInline
      preload="metadata"
      poster={poster}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
