'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/sanity/lib/image'
import { getArticleTheme, type ArticleTheme } from './theme'
import { Reveal } from './Reveal'

/* eslint-disable @typescript-eslint/no-explicit-any */

function buildComponents(theme: ArticleTheme): PortableTextComponents {
  return {
    block: {
      h2: ({ children }) => (
        <Reveal
          as="h2"
          y={18}
          duration={0.7}
          className="mb-4 mt-12 font-display text-3xl leading-tight lg:text-4xl"
          style={{ color: theme.heading }}
        >
          {children}
        </Reveal>
      ),
      h3: ({ children }) => (
        <Reveal
          as="h3"
          y={16}
          duration={0.65}
          className="mb-3 mt-10 font-heading text-xl font-bold lg:text-2xl"
          style={{ color: theme.subhead }}
        >
          {children}
        </Reveal>
      ),
      h4: ({ children }) => (
        <Reveal
          as="h4"
          y={12}
          duration={0.6}
          className="mb-2 mt-8 font-heading text-lg font-bold"
          style={{ color: theme.subhead }}
        >
          {children}
        </Reveal>
      ),
      blockquote: ({ children }) => (
        <Reveal
          as="blockquote"
          y={20}
          duration={0.8}
          className="my-8 border-l-4 pl-6 font-display text-xl italic lg:text-2xl"
          style={{ borderColor: theme.subhead, color: theme.heading }}
        >
          {children}
        </Reveal>
      ),
      normal: ({ children }) => (
        <Reveal
          as="p"
          y={10}
          duration={0.55}
          className="mb-6 text-lg leading-relaxed lg:text-[19px]"
          style={{ color: theme.bodyText }}
        >
          {children}
        </Reveal>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <Reveal as="ul" y={10} duration={0.55} className="mb-6 list-none space-y-2 pl-0">
          {children}
        </Reveal>
      ),
      number: ({ children }) => (
        <Reveal
          as="ol"
          y={10}
          duration={0.55}
          className="mb-6 list-decimal space-y-2 pl-6"
          style={{ color: theme.bodyText }}
        >
          {children}
        </Reveal>
      ),
    },
    listItem: {
      bullet: ({ children }) => (
        <li
          className="flex items-baseline gap-3 text-lg leading-relaxed"
          style={{ color: theme.bodyText }}
        >
          <span
            className="mt-[0.5em] h-1.5 w-1.5 shrink-0"
            style={{ backgroundColor: theme.subhead }}
          />
          <span>{children}</span>
        </li>
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      link: ({ children, value }) => (
        <a
          href={value?.href}
          target={value?.blank ? '_blank' : undefined}
          rel={value?.blank ? 'noopener noreferrer' : undefined}
          className="underline underline-offset-2"
          style={{ color: theme.link, textDecorationColor: theme.link }}
        >
          {children}
        </a>
      ),
      internalLink: ({ children, value }) => (
        <Link
          href={`/artikler/${value?.slug?.current || ''}`}
          className="underline underline-offset-2"
          style={{ color: theme.link, textDecorationColor: theme.link }}
        >
          {children}
        </Link>
      ),
    },
    types: {
      inlineFactBox: ({ value }) => {
        if (!value?.content) return null
        const title = value.title || 'Faktaboks'
        return (
          <Reveal
            as="aside"
            y={32}
            duration={0.9}
            className="my-10 px-6 py-8 lg:px-10 lg:py-10"
            style={{ backgroundColor: theme.factBg }}
          >
            <div className="mb-6 lg:mb-8">
              <h3 className="font-display text-2xl leading-tight lg:text-3xl" style={{ color: theme.factTitle }}>
                {title}
              </h3>
              <div className="mt-4 h-px w-16" style={{ backgroundColor: theme.factRule }} />
            </div>
            <PortableText
              value={value.content}
              components={{
                block: {
                  normal: ({ children }) => (
                    <p
                      className="mb-3 text-[16px] leading-[1.7] last:mb-0"
                      style={{ color: theme.factText }}
                    >
                      {children}
                    </p>
                  ),
                },
                list: {
                  bullet: ({ children }) => (
                    <ul className="mb-4 list-none space-y-2 pl-0 last:mb-0">{children}</ul>
                  ),
                },
                listItem: {
                  bullet: ({ children }) => (
                    <li
                      className="flex items-baseline gap-3 text-[16px] leading-[1.6]"
                      style={{ color: theme.factText }}
                    >
                      <span
                        className="mt-[0.4em] h-1.5 w-1.5 shrink-0"
                        style={{ backgroundColor: theme.factRule }}
                      />
                      <span>{children}</span>
                    </li>
                  ),
                },
                marks: {
                  strong: ({ children }) => (
                    <strong className="font-bold" style={{ color: theme.factTitle }}>
                      {children}
                    </strong>
                  ),
                  link: ({ children, value: mark }) => (
                    <a
                      href={mark?.href}
                      target={mark?.blank ? '_blank' : undefined}
                      rel={mark?.blank ? 'noopener noreferrer' : undefined}
                      className="underline underline-offset-2"
                      style={{ color: theme.factRule, textDecorationColor: theme.factRule }}
                    >
                      {children}
                    </a>
                  ),
                },
              }}
            />
          </Reveal>
        )
      },
      image: ({ value }) => {
        if (!value?.asset) return null
        return (
          <Reveal as="figure" y={24} scale={1.03} duration={0.9} className="my-10 -mx-6 lg:-mx-16">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={urlFor(value).width(1200).height(750).url()}
                alt={value.alt || ''}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            {(value.caption || value.credit) && (
              <figcaption className="mt-2 px-6 text-sm lg:px-16" style={{ color: theme.muted }}>
                {value.caption}
                {value.credit && <span className="ml-1">Foto: {value.credit}</span>}
              </figcaption>
            )}
          </Reveal>
        )
      },
    },
  }
}

interface PortableTextRendererProps {
  value: any[]
  theme?: ArticleTheme
}

export function PortableTextRenderer({ value, theme }: PortableTextRendererProps) {
  const resolved = theme ?? getArticleTheme()
  return (
    <div className="mx-auto max-w-prose px-6 lg:px-0">
      <PortableText value={value} components={buildComponents(resolved)} />
    </div>
  )
}
