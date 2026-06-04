'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-config'

interface QuizOption {
  text: string
  isCorrect?: boolean
  pollPercent?: number
  _key?: string
}

interface InteractiveQuizProps {
  data: {
    style?: 'quiz' | 'poll' | 'didYouKnow'
    question?: string
    options?: QuizOption[]
    answer?: string
    backgroundColor?: string
  }
  index: number
}

// Hardcoded gold for readability on all dark backgrounds
const ACCENT = '#F6BE00'
const ACCENT_RGB = '246, 190, 0'

export function InteractiveQuiz({ data }: InteractiveQuizProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const barRefs = useRef<(HTMLDivElement | null)[]>([])

  const style = data.style || 'quiz'
  const options = data.options || []

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          y: 50,
          opacity: 0,
          duration: 1.0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    })

    return () => mm.revert()
  }, [])

  // Animate poll bars when revealed
  useEffect(() => {
    if (!revealed || style !== 'poll') return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      barRefs.current.forEach((bar, i) => {
        if (!bar) return
        const percent = options[i]?.pollPercent || 0
        gsap.fromTo(
          bar,
          { width: '0%' },
          { width: `${percent}%`, duration: 0.8, delay: i * 0.1, ease: 'power2.out' }
        )
      })
    })

    return () => mm.revert()
  }, [revealed, style, options])

  const bgColor = data.backgroundColor || '#003865'

  function handleSelect(index: number) {
    if (selected !== null && style === 'quiz') return
    setSelected(index)
    if (style === 'quiz' || style === 'poll') {
      setRevealed(true)
    }
  }

  // "Visste du at?" style
  if (style === 'didYouKnow') {
    return (
      <section
        ref={sectionRef}
        className="flex min-h-[48vh] items-center justify-center px-6 py-20 lg:px-16"
        style={{ backgroundColor: bgColor }}
      >
        <div ref={cardRef} className="mx-auto w-full max-w-xl text-center">
          <p className="mb-4 font-heading text-[11px] uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
            Visste du at?
          </p>
          <p className="mb-8 font-display text-2xl leading-snug text-white lg:text-3xl">
            {data.question}
          </p>

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="cursor-pointer rounded-sm border-2 px-8 py-3 font-heading text-[11px] uppercase tracking-[0.3em] transition-colors"
              style={{
                borderColor: ACCENT,
                color: ACCENT,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgba(${ACCENT_RGB}, 0.15)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Vis svaret
            </button>
          ) : (
            <div className="rounded-sm p-6" style={{ backgroundColor: `rgba(${ACCENT_RGB}, 0.1)`, border: `1px solid rgba(${ACCENT_RGB}, 0.2)` }}>
              <p className="text-[17px] leading-[1.7] text-white/80">
                {data.answer}
              </p>
            </div>
          )}
        </div>
      </section>
    )
  }

  // Quiz + Poll style — redesigned for visual prominence
  return (
    <section
      ref={sectionRef}
      className="flex min-h-[60vh] items-center justify-center px-6 py-24 lg:px-16"
      style={{ backgroundColor: bgColor }}
    >
      <div ref={cardRef} className="mx-auto w-full max-w-xl">
        {/* Label */}
        <p className="mb-2 font-heading text-[11px] uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
          {style === 'quiz' ? 'Spørsmål' : 'Hva tror du?'}
        </p>

        {/* Question — large and prominent */}
        <h3 className="mb-10 font-display text-2xl leading-snug text-white lg:text-3xl">
          {data.question}
        </h3>

        {/* Options — card-style with poll bars */}
        <div className="space-y-4">
          {options.map((opt, i) => {
            const isSelected = selected === i
            const isCorrect = opt.isCorrect
            const showResult = revealed

            let borderColor = 'rgba(255, 255, 255, 0.15)'
            let bg = 'rgba(255, 255, 255, 0.04)'

            if (showResult && style === 'quiz') {
              if (isCorrect) {
                borderColor = '#22c55e'
                bg = 'rgba(34, 197, 94, 0.12)'
              } else if (isSelected && !isCorrect) {
                borderColor = '#ef4444'
                bg = 'rgba(239, 68, 68, 0.12)'
              }
            } else if (isSelected) {
              borderColor = ACCENT
              bg = `rgba(${ACCENT_RGB}, 0.12)`
            }

            return (
              <button
                key={opt._key || i}
                onClick={() => handleSelect(i)}
                className="group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 px-6 py-5 text-left transition-all hover:border-white/30"
                style={{ borderColor, backgroundColor: bg }}
                disabled={style === 'quiz' && revealed}
              >
                {/* Poll bar background */}
                {showResult && style === 'poll' && opt.pollPercent != null && (
                  <div
                    ref={(el) => { barRefs.current[i] = el }}
                    className="absolute inset-y-0 left-0 rounded-lg"
                    style={{
                      backgroundColor: isSelected
                        ? `rgba(${ACCENT_RGB}, 0.2)`
                        : 'rgba(255, 255, 255, 0.06)',
                      width: '0%',
                    }}
                  />
                )}

                <div className="relative flex items-center justify-between gap-4">
                  {/* Option letter */}
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: isSelected
                        ? ACCENT
                        : 'rgba(255, 255, 255, 0.1)',
                      color: isSelected ? '#003865' : 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>

                  {/* Option text */}
                  <span className="flex-1 text-[17px] leading-snug text-white/90">
                    {opt.text}
                  </span>

                  {/* Poll percentage */}
                  {showResult && style === 'poll' && opt.pollPercent != null && (
                    <span
                      className="shrink-0 font-heading text-lg font-bold"
                      style={{ color: isSelected ? ACCENT : 'rgba(255, 255, 255, 0.5)' }}
                    >
                      {opt.pollPercent}%
                    </span>
                  )}

                  {/* Quiz correct/wrong indicator */}
                  {showResult && style === 'quiz' && isCorrect && (
                    <span className="shrink-0 text-lg text-green-400">&#10003;</span>
                  )}
                  {showResult && style === 'quiz' && isSelected && !isCorrect && (
                    <span className="shrink-0 text-lg text-red-400">&#10007;</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Answer explanation */}
        {revealed && data.answer && (
          <div className="mt-8 rounded-lg border p-6" style={{ backgroundColor: `rgba(${ACCENT_RGB}, 0.06)`, borderColor: `rgba(${ACCENT_RGB}, 0.15)` }}>
            <p className="text-[16px] leading-[1.75] text-white/75">{data.answer}</p>
          </div>
        )}
      </div>
    </section>
  )
}
