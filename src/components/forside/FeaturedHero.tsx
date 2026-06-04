import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { naturalSrc, focalPosition } from '@/sanity/lib/imageHelpers'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  teaser?: string
  heroImage?: { asset: { _ref: string }; alt?: string; hotspot?: { x: number; y: number } }
  heroVideoUrl?: string
  tags?: { _id: string; title: string }[]
  type: string
}

interface FeaturedHeroProps {
  articles: Article[]
}

export function FeaturedHero({ articles }: FeaturedHeroProps) {
  if (articles.length === 0) return null

  const featured = articles.slice(0, 3)

  return (
    <div className="relative z-10">
      {featured.map((article, index) => (
        <React.Fragment key={article._id}>
          <section
            className="sticky top-0 h-screen w-full"
            style={{ zIndex: index + 1 }}
          >
            {/* Fullscreen background image/video */}
            {article.heroVideoUrl ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={article.heroImage?.asset ? naturalSrc(article.heroImage) : undefined}
                style={{ objectPosition: focalPosition(article.heroImage) }}
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={article.heroVideoUrl} type="video/mp4" />
              </video>
            ) : article.heroImage?.asset ? (
              <Image
                src={naturalSrc(article.heroImage)}
                alt={article.heroImage.alt || article.title}
                fill
                className="object-cover"
                style={{ objectPosition: focalPosition(article.heroImage) }}
                sizes="100vw"
                priority={index === 0}
              />
            ) : null}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

            {/* Bottom content — centered */}
            <Link
              href={`/artikler/${article.slug.current}`}
              className="group absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-10 text-center lg:px-12 lg:pb-16"
            >
              <span className="mb-3 font-heading text-[11px] uppercase tracking-[0.5em] text-white/50">
                Feature
              </span>
              <h2 className="max-w-3xl font-display text-4xl leading-[1.1] text-white transition-colors duration-300 group-hover:text-gold md:text-5xl lg:text-6xl">
                {article.title}
              </h2>
              {article.teaser && (
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 lg:text-lg">
                  {article.teaser}
                </p>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag._id}
                      className="rounded-full border border-white/20 px-3 py-1 font-heading text-[10px] uppercase tracking-[0.2em] text-white/60"
                    >
                      {tag.title}
                    </span>
                  ))}
                </div>
              )}
            </Link>

            {/* Slide indicator */}
            <div className="absolute bottom-10 right-6 flex flex-col items-center gap-1 lg:bottom-16 lg:right-12">
              <span className="font-heading text-[10px] tabular-nums text-white/40">
                {String(index + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
              </span>
            </div>
          </section>

          {/* Spacer — gives each article extra dwell time */}
          {index < featured.length - 1 && (
            <div className="pointer-events-none relative h-[50vh]" style={{ zIndex: index + 1 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
