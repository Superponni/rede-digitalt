import Image from 'next/image'
import Link from 'next/link'
import { coverSrc } from '@/sanity/lib/imageHelpers'

type CardSize = 'small' | 'medium' | 'large' | 'hero'

interface ArticleCardProps {
  title: string
  slug: string
  heroImage?: {
    asset: { _ref: string }
    alt?: string
    credit?: string
  }
  tag?: string
  type?: 'scrollytelling' | 'standard'
  size?: CardSize
  className?: string
}

const sizeClasses: Record<CardSize, string> = {
  small: 'aspect-[4/5]',
  medium: 'aspect-[3/4]',
  large: 'aspect-[16/10]',
  hero: 'aspect-[16/9] md:aspect-[21/9]',
}

// Be om bildet i samme format som boksen — da slipper vi en ekstra
// object-cover-beskjæring oppå Sanitys fokus-bevisste beskjæring.
const sizeCrop: Record<CardSize, { w: number; h: number; base: number }> = {
  small: { w: 4, h: 5, base: 1000 },
  medium: { w: 3, h: 4, base: 1200 },
  large: { w: 16, h: 10, base: 1800 },
  hero: { w: 16, h: 9, base: 2560 },
}

export function ArticleCard({
  title,
  slug,
  heroImage,
  tag,
  size = 'medium',
  className = '',
}: ArticleCardProps) {
  const href = `/artikler/${slug}`

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-lg ${sizeClasses[size]} ${className}`}
    >
      {heroImage?.asset && (
        <Image
          src={coverSrc(heroImage, sizeCrop[size].w, sizeCrop[size].h, sizeCrop[size].base)}
          alt={heroImage.alt || title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={
            size === 'hero'
              ? '100vw'
              : size === 'large'
                ? '(max-width: 768px) 100vw, 66vw'
                : '(max-width: 768px) 50vw, 33vw'
          }
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        {tag && (
          <span className="mb-2 inline-block font-heading text-xs uppercase tracking-widest text-white/70">
            {tag}
          </span>
        )}
        <h3
          className={`font-display font-bold leading-tight text-white ${
            size === 'hero'
              ? 'text-3xl md:text-5xl'
              : size === 'large'
                ? 'text-2xl md:text-3xl'
                : size === 'small'
                  ? 'text-base md:text-lg'
                  : 'text-lg md:text-xl'
          }`}
        >
          {title}
        </h3>
      </div>
    </Link>
  )
}
