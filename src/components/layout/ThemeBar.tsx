import Link from 'next/link'

interface ThemeBarProps {
  tags: { _id: string; title: string; slug: { current: string } }[]
  /** Slug for valgt tema. Utelatt = «Alle» (forsiden). */
  active?: string
}

/**
 * Temalinjen rett under toppen på forsiden og temasidene. Ett tema om gangen:
 * «Alle» går til forsiden, de andre til /tema/[slug]. På mobil ligger valgene
 * på én rad som kan sveipes sidelengs.
 */
export function ThemeBar({ tags, active }: ThemeBarProps) {
  const pill = (on: boolean) =>
    `label inline-flex h-8 shrink-0 items-center rounded-full px-4 transition-colors duration-200 ${
      on ? 'bg-navy text-white' : 'bg-navy-30 text-navy hover:bg-[#9FB3C3]'
    }`
  return (
    <nav
      aria-label="Temaer"
      className="flex items-center gap-6 border-b border-navy/30 py-5"
    >
      <span className="label shrink-0 tracking-[0.1em] text-navy/70">Temaer</span>
      <div className="scrollbar-hide -mr-5 flex gap-2 overflow-x-auto pr-5 tab:mr-0 tab:flex-wrap tab:overflow-visible tab:pr-0">
        <Link href="/" className={pill(!active)} aria-current={!active ? 'page' : undefined}>
          Alle
        </Link>
        {tags.map((tag) => {
          const on = tag.slug.current === active
          return (
            <Link
              key={tag._id}
              href={`/tema/${tag.slug.current}`}
              className={pill(on)}
              aria-current={on ? 'page' : undefined}
            >
              {tag.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
