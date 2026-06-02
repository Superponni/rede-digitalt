'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FullscreenMenu } from '@/components/layout/FullscreenMenu'

// Ruter med lys (mint) bakgrunn fra toppen → header i mørk marineblå.
// Alt annet antar mørk topp (hero-bilde/navy) → header i hvitt.
// Nye lyse sider legges til her.
function hasLightBackground(pathname: string): boolean {
  return pathname === '/om'
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
  const pathname = usePathname()

  // Når menyen er åpen ligger den mørke fullskjerm-overlayen over alt, så
  // headeren må være hvit uansett rute.
  const dark = !menuOpen && hasLightBackground(pathname)
  const textColor = dark ? 'text-navy' : 'text-white'
  const hoverColor = dark ? 'hover:text-navy/60' : 'hover:text-gold'

  return (
    <>
      <header className="fixed top-0 z-50 w-full">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <Link href="/" className={`font-display text-2xl transition-colors ${textColor}`}>
            Rede
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex cursor-pointer items-center gap-2 font-heading text-base tracking-[0.1em] transition-colors ${textColor} ${hoverColor}`}
          >
            Meny
            <span className="transition-transform duration-300" style={{ display: 'inline-block', transform: menuOpen ? 'rotate(45deg)' : 'none' }}>
              +
            </span>
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
