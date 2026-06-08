'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import {
  styleFor,
  initialsFor,
  categoriesPresent,
  sortedRegions,
  countFor,
  type MemberOffer,
} from '@/lib/medlemstilbud'

const DEFAULT_REDEEM =
  'Vis medlemsbeviset ditt eller oppgi medlemsnummeret i TOBB.'

export function MedlemstilbudView({ offers }: { offers: MemberOffer[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)

  const categories = categoriesPresent(offers)
  const regions = sortedRegions(offers)

  const filtered = offers.filter((o) => {
    if (activeCategory && o.category !== activeCategory) return false
    if (activeRegion && !(o.regions ?? []).includes(activeRegion)) return false
    return true
  })

  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero / intro */}
      <header className="px-6 pt-32 pb-12 lg:px-12 lg:pt-40 lg:pb-16">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-4 font-heading text-[11px] uppercase tracking-[0.5em] text-navy/40">
            TOBB · Medlemsfordeler
          </p>
          <h1 className="max-w-4xl font-display text-[2.5rem] leading-[0.95] text-navy sm:text-6xl md:text-7xl lg:text-8xl">
            Medlemstilbud
          </h1>
          <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-navy/70">
            Som TOBB-medlem får du rabatter og fordeler hos lokale og nasjonale
            samarbeidspartnere — fra håndverkere og banktjenester til kino, sport
            og kultur. Filtrer på kategori og sted for å finne det som passer deg.
          </p>
        </div>
      </header>

      {offers.length === 0 ? (
        <div className="px-6 pb-32 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <p className="text-navy/50">Ingen medlemstilbud er publisert ennå.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Filterbar — bevisst IKKE sticky. Den faste toppmenyen er
              gjennomsiktig, så en sticky filterrad kolliderte med logo/meny og
              lot kortene skinne gjennom. Filtrene skroller heller vekk med
              innholdet og er tilbake straks man skroller opp til toppen. */}
          <div className="border-y border-navy/10 bg-canvas">
            <div className="mx-auto max-w-[1400px] px-6 py-4 lg:px-12">
              {/* Kategorier */}
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <FilterTab
                  label="Alle"
                  count={offers.length}
                  active={activeCategory === null}
                  onClick={() => setActiveCategory(null)}
                />
                {categories.map((cat) => (
                  <FilterTab
                    key={cat}
                    label={cat}
                    count={countFor(offers, cat)}
                    color={styleFor(cat).color}
                    active={activeCategory === cat}
                    onClick={() =>
                      setActiveCategory(activeCategory === cat ? null : cat)
                    }
                  />
                ))}
              </div>

              {/* Regioner */}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy/5 pt-3">
                <span className="mr-1 font-heading text-[10px] uppercase tracking-[0.3em] text-navy/40">
                  Sted
                </span>
                <RegionChip
                  label="Hele landet"
                  active={activeRegion === null}
                  onClick={() => setActiveRegion(null)}
                />
                {regions.map((r) => (
                  <RegionChip
                    key={r}
                    label={r}
                    active={activeRegion === r}
                    onClick={() => setActiveRegion(activeRegion === r ? null : r)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tilbudsgrid */}
          <main className="px-6 py-12 lg:px-12 lg:py-16">
            <div className="mx-auto max-w-[1400px]">
              <p className="mb-6 font-heading text-[11px] uppercase tracking-[0.3em] text-navy/40">
                {filtered.length} tilbud
                {activeCategory ? ` · ${activeCategory}` : ''}
                {activeRegion ? ` · ${activeRegion}` : ''}
              </p>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((offer) => (
                  <OfferCard key={offer._id} offer={offer} />
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="py-20 text-center text-navy/40">
                  Ingen tilbud i dette utvalget.
                </p>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  )
}

function FilterTab({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string
  count: number
  color?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-baseline gap-1.5 font-heading text-sm"
    >
      {/* Teksten holdes alltid i marineblått for lesbarhet — kategorifargen
          (kan være gull/grønn) brukes kun som understrek-aksent, der lav
          kontrast er greit. */}
      <span
        className={`border-b-2 pb-0.5 transition-colors ${
          active
            ? 'font-semibold text-navy'
            : 'border-transparent text-navy/60 group-hover:text-navy'
        }`}
        style={active ? { borderColor: color ?? '#003865' } : undefined}
      >
        {label}
      </span>
      <span className="text-[11px] text-navy/30">{count}</span>
    </button>
  )
}

function RegionChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 font-heading text-[12px] transition-colors ${
        active
          ? 'border-navy bg-navy text-white'
          : 'border-navy/15 text-navy/60 hover:border-navy/40 hover:text-navy'
      }`}
    >
      {label}
    </button>
  )
}

function OfferCard({ offer }: { offer: MemberOffer }) {
  const [open, setOpen] = useState(false)
  const s = styleFor(offer.category)
  const regions = offer.regions ?? []
  const locations = offer.locations ?? []
  const logoUrl = offer.logo?.asset?._ref
    ? urlFor(offer.logo).width(220).fit('max').url()
    : null

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-navy/8 bg-white shadow-[0_1px_3px_rgba(0,56,101,0.06)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,56,101,0.10)]">
      <div className="flex flex-1 flex-col p-6">
        {/* Topp: logo + kategori */}
        <div className="flex items-start justify-between gap-3">
          {logoUrl ? (
            <div className="relative h-12 w-24 shrink-0">
              <Image
                src={logoUrl}
                alt={offer.logo?.alt || offer.businessName}
                fill
                className="object-contain object-left"
                sizes="96px"
              />
            </div>
          ) : (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md font-display text-base"
              style={{ backgroundColor: s.color, color: s.on }}
              aria-hidden
            >
              {initialsFor(offer.businessName)}
            </div>
          )}
          <span
            className="mt-1 text-right font-heading text-[10px] uppercase tracking-[0.25em]"
            style={{ color: s.color }}
          >
            {offer.category}
          </span>
        </div>

        {/* Navn + beskrivelse */}
        <h2 className="mt-4 font-display text-2xl leading-tight text-navy">
          {offer.businessName}
        </h2>
        {offer.shortDescription && (
          <p className="mt-1.5 font-body text-sm leading-relaxed text-navy/55">
            {offer.shortDescription}
          </p>
        )}

        {/* Rabatt — kortets blikkfang */}
        {offer.discountSummary && (
          <p
            className="mt-5 font-display text-3xl leading-none"
            style={{ color: s.color }}
          >
            {offer.discountSummary}
          </p>
        )}

        <div className="mt-auto pt-5">
          {regions.length > 0 && (
            <p className="mb-3 font-heading text-[11px] uppercase tracking-[0.2em] text-navy/35">
              {regions.join(' · ')}
            </p>
          )}

          <div className="h-px w-full bg-navy/8" />

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {offer.relatedArticleSlug && (
              <Link
                href={`/artikler/${offer.relatedArticleSlug}`}
                className="font-heading text-[12px] font-semibold tracking-wide"
                style={{ color: s.color }}
              >
                Les saken →
              </Link>
            )}
            {offer.website && (
              <a
                href={`https://${offer.website.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-[12px] text-navy/60 transition-colors hover:text-navy"
              >
                Til nettside ↗
              </a>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-auto font-heading text-[12px] text-navy/50 transition-colors hover:text-navy"
            >
              {open ? 'Skjul vilkår' : 'Vis vilkår'}
            </button>
          </div>

          {open && (
            <div className="mt-4 space-y-3 border-t border-navy/8 pt-4">
              {offer.discountDetails && (
                <p className="font-body text-[13px] leading-relaxed text-navy/70">
                  {offer.discountDetails}
                </p>
              )}
              <p className="font-body text-[13px] leading-relaxed text-navy/70">
                <span className="font-semibold text-navy">Slik får du tilbudet: </span>
                {offer.howToRedeem || DEFAULT_REDEEM}
              </p>
              {locations.length > 0 && (
                <ul className="space-y-0.5 font-body text-[12px] text-navy/55">
                  {locations.map((loc, i) => (
                    <li key={i}>{loc}</li>
                  ))}
                </ul>
              )}
              {offer.phone && (
                <p className="font-body text-[12px] text-navy/55">Tlf: {offer.phone}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
