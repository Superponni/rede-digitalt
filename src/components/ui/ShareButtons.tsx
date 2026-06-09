'use client'

interface ShareButtonsProps {
  url: string
  title: string
  className?: string
  // Lys flate (mint/tinted) krever marineblå ikoner; mørk flate (filled/dark)
  // krever hvite. Følger artikkelens colorMode via theme.isDark.
  tone?: 'light' | 'dark'
}

const TONES = {
  dark: {
    label: 'text-white/40',
    button: 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white',
  },
  light: {
    label: 'text-navy/40',
    button: 'bg-navy/10 text-navy/55 hover:bg-navy/20 hover:text-navy',
  },
} as const

export function ShareButtons({ url, title, className = '', tone = 'dark' }: ShareButtonsProps) {
  const t = TONES[tone]
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = [
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
        </svg>
      ),
    },
    {
      label: 'X',
      href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z" />
        </svg>
      ),
    },
    {
      label: 'E-post',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
  ]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`font-heading text-xs uppercase tracking-widest ${t.label}`}>
        Del
      </span>
      {shareLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Del på ${link.label}`}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${t.button}`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  )
}
