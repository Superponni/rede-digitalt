'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FullscreenMenu } from '@/components/layout/FullscreenMenu'
import { RedeLogo } from '@/components/layout/RedeLogo'
import { useHeaderSurface } from '@/components/layout/HeaderTheme'

// Ruter som er lyse helt fra toppen → menyen utledes synkront (ingen blink).
// Andre ruter antar mørk topp (hero-bilde/navy) som standard, men kan overstyres
// per side via <SetHeaderSurface> (f.eks. standard-artikler med lys mint-topp).
function lightFromRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/om' ||
    pathname === '/medlemstilbud' ||
    pathname === '/personvern' ||
    pathname.startsWith('/tema/')
  )
}

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

interface HeaderProps {
  tags?: Tag[]
  featured?: FeaturedArticle | null
}

export function Header({ tags = [], featured = null }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const pathname = usePathname()
  const { override } = useHeaderSurface()

  // Auto-skjul: baren glir bort når man scroller nedover (lesing) og kommer
  // tilbake straks man scroller opp. Fjerner kollisjonen mellom store hvite
  // overskrifter og menyen i scrollytelling-artiklene. Alltid synlig nær toppen
  // og når menyen er åpen.
  const lastY = useRef(0)
  useEffect(() => {
    lastY.current = window.scrollY
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const goingDown = y > lastY.current
        // Liten terskel demper vibrering ved bittesmå scroll-bevegelser.
        if (Math.abs(y - lastY.current) > 6) {
          setHidden(goingDown && y > 96)
          lastY.current = y
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Når menyen er åpen ligger den mørke fullskjerm-overlayen over alt, så
  // menyen må være hvit uansett rute. Ellers: en sides eget signal (override)
  // vinner over rute-gjettet.
  const surface = menuOpen ? 'dark' : (override ?? (lightFromRoute(pathname) ? 'light' : 'dark'))
  const onLight = surface === 'light'

  const textColor = onLight ? 'text-navy' : 'text-white'
  const hoverColor = onLight ? 'hover:text-navy/60' : 'hover:text-gold'

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-transform duration-300 ease-out ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        } ${onLight ? 'bg-cream' : ''}`}
      >
        {/* Diskret scrim KUN når logoen er hvit — garanterer lesbarhet selv
            over et lyst eller travelt toppbilde. På lys flate trengs den ikke. */}
        {!onLight && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/25 to-transparent"
          />
        )}
        <div className="wrap relative">
          {/* Malens topp: logo til venstre, to streker til høyre, og en hel
              marineblå strek under på lyse flater. */}
          <div
            className={`flex items-center justify-between gap-6 border-b pb-3 pt-3 tab:pb-6 tab:pt-10 ${
              onLight ? 'border-navy' : 'border-transparent'
            }`}
          >
            <div className="flex items-center gap-4">
              <Link
                href="/"
                aria-label="Rede – til forsiden"
                className={`transition-colors ${textColor} ${hoverColor}`}
              >
                <RedeLogo className="h-[24px] w-auto tab:h-[32px]" />
              </Link>
              {/* Avsenderen skal være klikkbar: leseren som lurer på hvem TOBB er,
                  skal komme rett til tobb.no. Understreken vises på hover/fokus
                  slik at det er tydelig at det ER en lenke. */}
              <a
                href="https://www.tobb.no"
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden border-l py-2 pl-4 font-label text-[11px] font-medium uppercase leading-tight tracking-[0.06em] underline-offset-4 transition-colors hover:underline focus-visible:underline sm:inline-block ${
                  onLight ? 'border-navy text-navy' : 'border-white/60 text-white'
                }`}
              >
                Et medlemsmagasin fra TOBB
              </a>
            </div>
            {/* To streker som morpher til X — selvforklarende på alle flater. */}
            <button
              id="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="fullscreen-menu"
              aria-label={menuOpen ? 'Lukk menyen' : 'Åpne menyen'}
              className={`relative flex h-11 w-11 cursor-pointer items-center justify-end transition-colors ${textColor} ${hoverColor}`}
            >
              <span
                aria-hidden
                className="absolute right-0 h-[2px] w-[26px] bg-current transition-transform duration-300 ease-out"
                style={{ transform: menuOpen ? 'rotate(45deg)' : 'translateY(-4px)' }}
              />
              <span
                aria-hidden
                className="absolute right-0 h-[2px] w-[26px] bg-current transition-transform duration-300 ease-out"
                style={{ transform: menuOpen ? 'rotate(-45deg)' : 'translateY(4px)' }}
              />
            </button>
          </div>
        </div>
      </header>

      <FullscreenMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        tags={tags}
        featured={featured}
      />
    </>
  )
}
