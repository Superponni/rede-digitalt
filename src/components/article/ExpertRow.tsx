import { ExpertPortrait } from './ExpertPortrait'

export interface ExpertItem {
  portrait: { asset: { _ref: string }; alt?: string }
  name?: string
  role?: string
}

/**
 * Rad med ekspert-/kilde-portretter. Med flere portretter skaleres de ned så de
 * står pent på én rad på desktop (1 → 230px, 2 → 200px, 3 → 175px). På smale
 * skjermer bryter raden til flere linjer. Alle portrettene er like store.
 */
const widthForCount = (n: number) => (n >= 3 ? 175 : n === 2 ? 200 : 230)

export function ExpertRow({
  experts,
  color,
  fallbackAlt,
}: {
  experts: ExpertItem[]
  color: string
  fallbackAlt: string
}) {
  if (experts.length === 0) return null
  const width = widthForCount(experts.length)

  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      {experts.map((expert, i) => (
        <div key={i} style={{ width: `${width}px`, maxWidth: '100%' }}>
          <ExpertPortrait
            image={expert.portrait}
            alt={expert.portrait.alt || expert.name || fallbackAlt}
            name={expert.name}
            role={expert.role}
            color={color}
          />
        </div>
      ))}
    </div>
  )
}
