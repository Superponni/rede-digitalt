'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { naturalSrc, focalPosition } from '@/sanity/lib/imageHelpers'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  teaser?: string
  heroImage?: { asset: { _ref: string }; alt?: string; hotspot?: { x: number; y: number } }
  tags?: { _id: string; title: string }[]
  type: string
}

interface StoriesGridProps {
  articles: Article[]
}

export function StoriesGrid({ articles }: StoriesGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  if (articles.length === 0) return null

  // Extract unique tags from all articles
  const allTags = Array.from(
    new Map(
      articles
        .flatMap((a) => a.tags || [])
        .map((t) => [t._id, t])
    ).values()
  )

  const filtered = activeTag
    ? articles.filter((a) => a.tags?.some((t) => t._id === activeTag))
    : articles

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-[1400px]">
        {/* Header with tags — centered */}
        <div className="mb-12 flex flex-col items-center gap-6">
          <h2 className="font-display text-3xl text-white lg:text-4xl">
            Flere saker
          </h2>
          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`cursor-pointer rounded-full border px-3 py-1 font-heading text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  activeTag === null
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/70'
                }`}
              >
                Alle
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => setActiveTag(tag._id)}
                  className={`cursor-pointer rounded-full border px-3 py-1 font-heading text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    activeTag === tag._id
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/70'
                  }`}
                >
                  {tag.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid — 2+1 pattern, equal height */}
        <div className="grid auto-rows-[1fr] gap-5 sm:grid-cols-3">
          {filtered.map((article, index) => {
            // 2+1 pattern: every row of 3, first card spans 2 cols
            const isWide = index % 3 === 0
            return (
              <Link
                key={article._id}
                href={`/artikler/${article.slug.current}`}
                className={`group block ${isWide ? 'sm:col-span-2' : ''}`}
              >
                <div className="relative h-full min-h-[280px] overflow-hidden rounded-lg sm:min-h-[320px] lg:min-h-[380px]">
                  {article.heroImage?.asset ? (
                    <Image
                      src={naturalSrc(article.heroImage, 2000)}
                      alt={article.heroImage.alt || article.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      style={{ objectPosition: focalPosition(article.heroImage) }}
                      sizes={
                        isWide
                          ? '(max-width: 640px) 100vw, 66vw'
                          : '(max-width: 640px) 100vw, 33vw'
                      }
                    />
                  ) : (
                    <div className="h-full w-full bg-navy-light" />
                  )}

                  {/* Default gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-0" />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Default content — tag + title */}
                  <div className="absolute inset-x-0 bottom-0 p-5 transition-opacity duration-500 group-hover:opacity-0 lg:p-6">
                    {article.tags?.[0] && (
                      <span className="mb-2 inline-block font-heading text-[10px] uppercase tracking-[0.3em] text-gold">
                        {article.tags[0].title}
                      </span>
                    )}
                    <h3 className="font-display text-lg leading-snug text-white lg:text-xl">
                      {article.title}
                    </h3>
                  </div>

                  {/* Hover content — title + teaser + tags */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:p-6">
                    <h3 className="font-display text-lg leading-snug text-gold lg:text-xl">
                      {article.title}
                    </h3>
                    {article.teaser && (
                      <p className="mt-3 text-sm leading-relaxed text-white/70 line-clamp-3">
                        {article.teaser}
                      </p>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span
                            key={tag._id}
                            className="rounded-full border border-white/20 px-2.5 py-0.5 font-heading text-[10px] uppercase tracking-[0.2em] text-white/60"
                          >
                            {tag.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
