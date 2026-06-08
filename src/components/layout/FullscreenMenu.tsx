'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'

interface Tag {
  _id: string
  title: string
  slug: { current: string }
}

interface FeaturedArticle {
  _id: string
  title: string
  slug: { current: string }
  heroImage?: { asset: { _ref: string }; alt?: string }
  tags?: { _id: string; title: string }[]
}

interface FullscreenMenuProps {
  isOpen: boolean
  onClose: () => void
  tags: Tag[]
  featured: FeaturedArticle | null
}

const NAV_LINKS = [
  { label: 'Utgaver', href: '/', key: 'utgaver' },
  { label: 'Medlemstilbud', href: '/medlemstilbud', key: 'medlemstilbud' },
  { label: 'Om', href: '/om', key: 'om' },
  { label: 'Kontakt', href: '/kontakt', key: 'kontakt' },
]

export function FullscreenMenu({ isOpen, onClose, tags, featured }: FullscreenMenuProps) {
  useEffect(() => {
    // Lås scroll når menyen er åpen. Scrollbar-gutteren er permanent reservert
    // i globals.css (scrollbar-gutter: stable), så headeren hopper ikke sidelengs
    // når scrollbaren forsvinner.
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <div
      className={`fixed inset-0 z-40 transition-all duration-700 ease-out ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-navy" />

      {/* 2-column layout: nav + temaer-seksjon | featured */}
      <div className="relative z-10 flex h-full flex-col justify-center gap-12 px-8 lg:flex-row lg:items-center lg:gap-20 lg:px-16">
        {/* Left — Main nav + Temaer-seksjon + sosialt */}
        <div className="flex flex-col justify-center lg:w-[48%] lg:max-w-2xl">
          <nav className="space-y-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className="block font-display text-4xl text-white/70 transition-colors duration-300 hover:text-mint md:text-5xl lg:text-6xl"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Temaer — egen seksjon, alltid synlig */}
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-white/30" />
              <span className="font-heading text-[11px] uppercase tracking-[0.3em] text-white/45">
                Temaer
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {tags.map((tag) => (
                <Link
                  key={tag._id}
                  href={`/tema/${tag.slug.current}`}
                  onClick={onClose}
                  className="font-display text-2xl capitalize text-white/55 transition-colors duration-300 hover:text-mint"
                >
                  {tag.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div className="mt-12 flex gap-6">
            <a href="https://www.tobb.no" target="_blank" rel="noopener noreferrer" className="font-heading text-[11px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/60">
              TOBB.no
            </a>
            <a href="https://www.facebook.com/tobbbolig" target="_blank" rel="noopener noreferrer" className="font-heading text-[11px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/60">
              Facebook
            </a>
            <a href="https://www.instagram.com/tobbbolig" target="_blank" rel="noopener noreferrer" className="font-heading text-[11px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/60">
              Instagram
            </a>
          </div>
        </div>

        {/* Right — Featured article */}
        {/* slug kan mangle på uferdige utkast i forhåndsvisning — da hopper vi over */}
        {featured?.slug?.current && (
          <div
            className={`hidden flex-1 flex-col items-center justify-center transition-all duration-700 lg:flex ${
              isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
            style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}
          >
            <Link
              href={`/artikler/${featured.slug.current}`}
              onClick={onClose}
              className="group flex w-full max-w-lg flex-col items-center text-center"
            >
              {featured.heroImage?.asset && (
                <div className="relative aspect-[3/4] w-full max-w-xs overflow-hidden rounded-2xl">
                  <Image
                    src={urlFor(featured.heroImage).width(800).height(1067).fit('crop').url()}
                    alt={featured.heroImage.alt || featured.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 35vw"
                  />
                </div>
              )}
              <div className="mt-6 flex flex-col items-center">
                {featured.tags?.[0] && (
                  <span className="mb-2 font-heading text-[11px] uppercase tracking-[0.4em] text-white/50">
                    {featured.tags[0].title}
                  </span>
                )}
                <h3 className="max-w-md font-display text-3xl leading-[1.1] text-white/80 transition-colors duration-300 group-hover:text-mint lg:text-4xl">
                  {featured.title}
                </h3>
                <span className="mt-5 inline-block rounded-full border border-white/20 px-5 py-2 font-heading text-[11px] uppercase tracking-[0.2em] text-white/60 transition-colors group-hover:border-white/40 group-hover:text-white">
                  Les nå
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
