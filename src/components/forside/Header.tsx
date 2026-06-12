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
  return pathname === '/' || pathname === '/om' || pathname === '/medlemstilbud'
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
        }`}
      >
        {/* Diskret scrim KUN når logoen er hvit — garanterer lesbarhet selv
            over et lyst eller travelt toppbilde. På lys flate trengs den ikke. */}
        {!onLight && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent"
          />
        )}
        <div className="relative mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Rede – til forsiden"
              className={`transition-colors ${textColor} ${hoverColor}`}
            >
              <RedeLogo className="h-[22px] w-auto" />
            </Link>
            <span
              className={`hidden border-l pl-3 font-heading text-[11px] uppercase leading-tight tracking-[0.12em] transition-colors sm:inline-block ${
                onLight ? 'border-navy/20 text-navy/70' : 'border-white/30 text-white/80'
              }`}
            >
              Et medlemsmagasin fra TOBB
            </span>
          </div>
          {/* Bred hamburger (to streker) som morpher til X — renere enn tekst-
              knappen «Meny +», og selvforklarende på alle flater. */}
          <button
            id="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="fullscreen-menu"
            aria-label={menuOpen ? 'Lukk menyen' : 'Åpne menyen'}
            className={`relative -mr-2 flex h-11 w-11 cursor-pointer items-center justify-center transition-colors ${textColor} ${hoverColor}`}
          >
            <span
              aria-hidden
              className="absolute h-[2px] w-8 rounded-full bg-current transition-transform duration-300 ease-out"
              style={{ transform: menuOpen ? 'rotate(45deg)' : 'translateY(-5px)' }}
            />
            <span
              aria-hidden
              className="absolute h-[2px] w-8 rounded-full bg-current transition-transform duration-300 ease-out"
              style={{ transform: menuOpen ? 'rotate(-45deg)' : 'translateY(5px)' }}
            />
          </button>
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
