'use client'

import { useEffect, useRef } from 'react'
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
  { label: 'Kontakt', href: 'https://tobb.no/om-tobb/kontakt/', key: 'kontakt', external: true },
]

export function FullscreenMenu({ isOpen, onClose, tags, featured }: FullscreenMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // onClose lages på nytt for hver render i Header — holdes i en ref så
  // fokus-/tastatur-effekten under kun kjører ved faktisk åpning/lukking.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    // Lås scroll når menyen er åpen. Scrollbar-gutteren er permanent reservert
    // i globals.css (scrollbar-gutter: stable), så headeren hopper ikke sidelengs
    // når scrollbaren forsvinner.
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Tastatur og fokus: Escape lukker, fokus flyttes til første menypunkt ved
  // åpning og tilbake til hamburgeren ved lukking. Tab sirkulerer mellom
  // hamburgerknappen (ligger over overlayen) og menyens lenker, så fokus aldri
  // havner i innholdet bak menyen.
  useEffect(() => {
    if (!isOpen) return
    const container = containerRef.current
    if (!container) return

    const toggle = document.getElementById('menu-toggle')
    container.querySelector<HTMLElement>('a[href]')?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = [
        ...(toggle ? [toggle] : []),
        ...Array.from(
          container.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
        ),
      ]
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      toggle?.focus()
    }
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      id="fullscreen-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Meny"
      // inert: lukket meny er helt utilgjengelig (tastatur + skjermleser) selv
      // om den blir liggende i DOM for at ut-toningen skal spilles av.
      inert={!isOpen}
      className={`fixed inset-0 z-40 transition-all duration-700 ease-out ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-navy" />

      {/* 2-column layout: nav + temaer-seksjon | featured */}
      {/* pt-16 på mobil: innholdet sentreres i flaten UNDER headeren, så
          øverste menypunkt ikke kolliderer med Rede-logoen på små skjermer. */}
      <div className="relative z-10 flex h-full flex-col justify-center gap-12 px-8 pt-16 lg:flex-row lg:items-center lg:gap-20 lg:px-16 lg:pt-0">
        {/* Left — Main nav + Temaer-seksjon + sosialt */}
        <div className="flex flex-col justify-center lg:w-[48%] lg:max-w-2xl">
          <nav className="space-y-1">
            {NAV_LINKS.map((item) =>
              item.external ? (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="block font-display text-4xl text-white/70 transition-colors duration-300 hover:text-mint md:text-5xl lg:text-6xl"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onClose}
                  className="block font-display text-4xl text-white/70 transition-colors duration-300 hover:text-mint md:text-5xl lg:text-6xl"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Temaer — egen seksjon, alltid synlig */}
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-white/30" />
              <span className="font-heading text-[11px] uppercase tracking-[0.3em] text-white/70">
                Temaer
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {tags.map((tag) => (
                <Link
                  key={tag._id}
                  href={`/tema/${tag.slug.current}`}
                  onClick={onClose}
                  className="font-display text-2xl text-white/55 transition-colors duration-300 hover:text-mint"
                >
                  {tag.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Utvalgt sak — kompakt rad, KUN mobil (desktop har det store kortet
              til høyre). Holder seg under ~90px så menyen aldri trenger scroll. */}
          {featured?.slug?.current && (
            <Link
              href={`/artikler/${featured.slug.current}`}
              onClick={onClose}
              className="group mt-10 flex items-center gap-4 lg:hidden"
            >
              {featured.heroImage?.asset && (
                <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={urlFor(featured.heroImage).width(128).height(171).fit('crop').url()}
                    alt={featured.heroImage.alt || featured.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div className="min-w-0">
                <span className="font-heading text-[10px] uppercase tracking-[0.3em] text-gold">
                  Utvalgt
                </span>
                <span className="mt-1 block font-display text-xl leading-snug text-white/85 transition-colors duration-300 group-hover:text-mint">
                  {featured.title}
                  <span
                    aria-hidden
                    className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          )}

          {/* Social links — minst white/60 på navy for å bestå kontrastkravet */}
          <div className="mt-12 flex gap-6">
            <a href="https://www.tobb.no" target="_blank" rel="noopener noreferrer" className="font-heading text-[11px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white/90">
              TOBB.no
            </a>
            <a href="https://www.facebook.com/tobbbolig" target="_blank" rel="noopener noreferrer" className="font-heading text-[11px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white/90">
              Facebook
            </a>
            <a href="https://www.instagram.com/tobbbolig" target="_blank" rel="noopener noreferrer" className="font-heading text-[11px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white/90">
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
                  <span className="mb-2 font-heading text-[11px] uppercase tracking-[0.4em] text-white/70">
                    {featured.tags[0].title}
                  </span>
                )}
                <h3 className="max-w-md font-display text-3xl leading-[1.1] text-white/80 transition-colors duration-300 group-hover:text-mint lg:text-4xl">
                  {featured.title}
                </h3>
                <span className="mt-5 inline-block rounded-sm border border-white/20 px-5 py-2 font-heading text-[11px] uppercase tracking-[0.2em] text-white/60 transition-colors group-hover:border-white/40 group-hover:text-white">
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
