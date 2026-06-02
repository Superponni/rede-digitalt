import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { PortableTextRenderer } from './PortableTextRenderer'
import { AudioPlayer } from './AudioPlayer'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface StandardArticleProps {
  article: {
    _id: string
    title: string
    teaser?: string
    heroImage?: { asset: { _ref: string }; alt?: string; photographer?: string }
    body?: any[]
    audioFileUrl?: string
    tags?: { _id: string; title: string; slug: { current: string } }[]
    author?: { _id: string; name: string }
    edition?: { title: string; number: number; year: number }
  }
}

export function StandardArticle({ article }: StandardArticleProps) {
  return (
    <article className="bg-mint pb-20">
      {/* Hero image */}
      {article.heroImage?.asset && (
        <div className="relative h-[50vh] w-full lg:h-[60vh]">
          <Image
            src={urlFor(article.heroImage).width(1920).height(1080).url()}
            alt={article.heroImage.alt || article.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mint via-transparent to-transparent" />
        </div>
      )}

      {/* Article header */}
      <header className="mx-auto max-w-prose px-6 lg:px-0">
        <div className="-mt-16 relative z-10">
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="rounded-full bg-navy/10 px-3 py-1 font-heading text-[10px] uppercase tracking-[0.2em] text-navy/60"
                >
                  {tag.title}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-display text-4xl leading-[1.1] text-navy md:text-5xl lg:text-6xl">
            {article.title}
          </h1>

          {article.teaser && (
            <p className="mt-4 text-lg leading-relaxed text-navy/60 lg:text-xl">
              {article.teaser}
            </p>
          )}

          {/* Meta */}
          <div className="mt-6 flex items-center gap-4 border-t border-navy/10 pt-4 text-sm text-navy/40">
            {article.author && <span>Tekst: {article.author.name}</span>}
            {article.edition && (
              <span>Rede nr {article.edition.number} {article.edition.year}</span>
            )}
          </div>

          {/* Audio player */}
          {article.audioFileUrl && (
            <div className="mt-6">
              <AudioPlayer src={article.audioFileUrl} theme="light" />
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      {article.body && (
        <div className="mt-12">
          <PortableTextRenderer value={article.body} />
        </div>
      )}

      {/* Back link */}
      <div className="mx-auto mt-16 max-w-prose px-6 lg:px-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-heading text-sm uppercase tracking-[0.2em] text-navy/50 hover:text-navy transition-colors"
        >
          <span>&larr;</span> Tilbake til forsiden
        </Link>
      </div>
    </article>
  )
}
