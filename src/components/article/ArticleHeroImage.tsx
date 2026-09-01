import Image from 'next/image'

interface ArticleHeroImageProps {
  src: string
  alt: string
  /** Bildets egne dimensjoner — bevarer originalformatet (ingen beskjæring). */
  width: number
  height: number
  className?: string
  sizes?: string
  priority?: boolean
  /**
   * Når satt (f.eks. "3/4") fyller bildet en fast ramme i dette formatet med
   * `object-cover`. Brukes til side-oppsettet der vi vil ha en stående ramme
   * uansett om originalen er liggende. `src` må da være fokus-bevisst beskjært
   * (se coverSrc), så motivet treffer riktig. Uten `aspect` beholdes
   * originalformatet.
   */
  aspect?: string
  /**
   * Fyll forelderen (som må være `relative` med en fast/begrenset høyde) med
   * `object-cover`. Brukes til heldekkende toppbilde som er høydebegrenset, så
   * tittelen alltid er synlig. Krever som regel `focal` for riktig motiv.
   */
  cover?: boolean
  /** CSS object-position (fra fokuspunktet) for cover/aspect-modus. */
  focal?: string
}

/**
 * Hovedbilde for standard-artikler. Uten `aspect` beholder bildet ORIGINALFORMAT
 * (rendres med egne dimensjoner, ingen object-cover-beskjæring). Med `aspect`
 * fyller det en fast ramme.
 *
 * Ingen inn-animasjon: toppbildet ligger over folden, så et scroll-reveal
 * spilte av seg selv ved lasting og skjøv bildet 30 px ned mens det zoomet inn.
 * Forelderen klipper ikke, så bildet stakk ut under ramma og la seg som en
 * synlig stripe over innholdet under. Toppbildet skal stå ferdig med én gang.
 */
export function ArticleHeroImage({
  src,
  alt,
  width,
  height,
  className,
  sizes = '100vw',
  priority,
  aspect,
  cover,
  focal,
}: ArticleHeroImageProps) {
  if (aspect || cover) {
    return (
      <div
        className={`relative overflow-hidden ${className ?? ''}`}
        style={aspect ? { aspectRatio: aspect } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          style={focal ? { objectPosition: focal } : undefined}
          sizes={sizes}
          priority={priority}
        />
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full"
        sizes={sizes}
        priority={priority}
      />
    </div>
  )
}
