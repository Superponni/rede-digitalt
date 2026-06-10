import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import { ABOUT_PAGE_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { metaRobots } from '@/lib/seo'

const omTitle = 'Om Rede'
const omDescription =
  'Rede er TOBBs medlemsmagasin — historier om bolig, nabolag og folk i Trøndelag, nå som en digital leseopplevelse.'

export const metadata: Metadata = {
  title: omTitle,
  description: omDescription,
  robots: metaRobots(),
  alternates: { canonical: '/om' },
  openGraph: {
    type: 'website',
    title: omTitle,
    description: omDescription,
    url: '/om',
  },
  twitter: { card: 'summary_large_image', title: omTitle, description: omDescription },
}

interface Edition {
  _id: string
  title?: string
  number: number
  year: number
  coverImage?: { asset: { _ref: string }; alt?: string }
}

interface Tag {
  _id: string
  title: string
  slug: { current: string }
}

interface AboutContent {
  label?: string
  title?: string
  intro?: string
  featureLabel?: string
  featureHeading?: string
  featureBody?: string
  paperOfferText?: string
  paperOfferLinkLabel?: string
  paperOfferUrl?: string
  topicsLabel?: string
  publisherLine?: string
  editionsHeading?: string
}

// Standard «Min side»-lenke (lander på TOBBs innlogging). Kan overstyres i Sanity.
const DEFAULT_MIN_SIDE_URL =
  'https://bblid.bbl.no/loginWithCode?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Dbf620c34-db17-46f2-881a-bcf48674bb73%26redirect_uri%3Dhttps%253A%252F%252Fidgateway.bbl.no%252Fhost%252Fcore%252Fsignin-oidc%26response_type%3Dcode%26scope%3Dopenid%2520profile%2520bbl%2520email%2520api%26code_challenge%3DEQ1aa2M3r1Vx-6aSypb5AY7DXbB4tbOkqcu34s0Zzu4%26code_challenge_method%3DS256%26response_mode%3Dform_post%26nonce%3D639166850055384086.NTQ4NThjYmUtNmNkMi00Nzg2LThjZjMtYjBlOTBhMjhiYTYzODc3MzZjMTEtYjdlZS00MGJmLTg0NmQtNTBmM2U5NGE5N2Ew%26acr_values%3Dbblcode%253ATOBB,gatewayclient%253A7888CBB4-C687-42C3-B817-6E1A96393E8A%26state%3DCfDJ8MnHiQRj7TBEmSyVMpZ56Qq_KmjvtktO8ls-32uCveMgPl0jliXkuHlqtPNZq2dGM0OgfPeTD08mblWBJ0MXlc8DX1hDTKmC4XcX3K_h6j9sVT9qX18fkvwPxVhX2yebH9h_gi7SQ5Qpq6x0DDtyVkB8wZ8DghEEjHFsbAKBFpefYHP3dm58HK1nVcRrEXGZ3Z4dqhIR0NGfTZqdbHZtNDUrlZWSxnLxbLeBECZ48wLcMgXE9bgenkNUDeu2SrcVIxsAAEaJx27e30B1KuIkI3BHu1tvkmcoBBQkJ4fxh_2VWDQtHThcko45sa_JRTz-kY3xjAglF1Tp1OG5hq2wpzooUTZcB254Gam5dna7E_IrqwIX1WDYh8gdqpMA66iyMKZzWlvrTH8z1SxPUh8jCk2g0nh05SRD9qtR9wDnuZPtbHI46KO3pwrzAbWrGb3Lny1urFTRRUajBog1pCe6i5o0uORcEWnCWzwMPuGqbv3WyK0VZ64SLVCl3fh7o1FgkGc8BTMUAJh6haZAM3vI7sLLzGY-VYV0np0LhV59hcE8cb4o4ew_aelXJqxdsuxmDLzdZfYFP8MEeEN6QTYIzDhaRZRAQuJijbsgo7ysEXhbm3rWibjN9msxz2_GNgqEIDb1HRcrvr_iC3JCduCfphyAOYboJEvB29DBOUoEIwXn6vD6GfdvLZxs46qqrcnpgGWRwz1VUQ66Lc6AJL5w0WndeHgaCHqyIVSriLSy-2m681aWZQyGWH8vQ0WVNplmf0CTulKlHoIFqy8h0h0NAHlAwbi2BMBNWlRTE-iq75QOeIWuGxyidHYf1q-_aTQjDR7z5i0j_FiH-h4ez75jzOUZEfl6vWD5vKQbETIiYIUt6Hjb9NMqclSTz_hayJzBrkswZwxpRnws1wKOWj_g-7fviUGS7YPByVTXkkHNVb3zryEGW_r23KZ18HYxqOrgDQ%26x-client-SKU%3DID_NET9_0%26x-client-ver%3D8.0.1.0&bbl=TOBB'

// Standardtekster brukes hvis Om-dokumentet ikke finnes ennå i Sanity.
const FALLBACK: Required<AboutContent> = {
  label: 'Om Rede',
  title: 'Et magasin om bolig, nabolag og folk i Trøndelag.',
  intro:
    'Rede er TOBBs medlemsmagasin. I 80 år har TOBB bygget hjem og nabolag i Trøndelag — Rede forteller historiene som bor der. Nå tar vi magasinet fra papir til skjerm.',
  featureLabel: 'Fra papir til skjerm',
  featureHeading: 'Ikke en PDF — en opplevelse.',
  featureBody:
    'Her kan du scrolle deg gjennom reportasjer som beveger seg, høre stemmene bak historiene og se video — ikke bare lese. Rede er bygget for skjermen, fra første bokstav til siste bilde.',
  paperOfferText: 'Ønsker du å motta papirutgaven av Rede? Dette kan du enkelt ordne på',
  paperOfferLinkLabel: 'Min side',
  paperOfferUrl: DEFAULT_MIN_SIDE_URL,
  topicsLabel: 'Hva du finner',
  publisherLine: 'Rede gis ut av TOBB',
  editionsHeading: 'Utgaver',
}

// Temaene settes i TOBB-farger og veksler, så «Hva du finner» får liv uten å
// bli en regnbue. Gull er bevisst utelatt — for svak kontrast på mint.
const TAG_COLORS = [
  'text-magenta',
  'text-teal',
  'text-purple',
  'text-tobb-blue',
  'text-tobb-green',
  'text-navy',
]

export default async function AboutPage() {
  const { page, editions, tags } = await sanityFetch<{
    page: AboutContent | null
    editions: Edition[]
    tags: Tag[]
  }>({ query: ABOUT_PAGE_QUERY })

  // Felt-for-felt fallback: et tomt felt i Sanity faller tilbake til standard.
  const c = { ...FALLBACK }
  if (page) {
    for (const key of Object.keys(FALLBACK) as (keyof AboutContent)[]) {
      const value = page[key]
      if (typeof value === 'string' && value.trim()) c[key] = value
    }
  }

  // Nyeste utgave med coverbilde brukes som det fysiske magasinet i hero.
  const heroCover = editions.find((e) => e.coverImage?.asset) ?? null

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        {/* ① Tittelblokk + magasincover */}
        <header className="grid grid-cols-12 items-start gap-x-6 gap-y-12 pt-24 lg:pt-36">
          <div className="col-span-12 lg:col-span-7">
            <span className="font-heading text-[11px] uppercase tracking-[0.4em] text-navy/50">
              {c.label}
            </span>
            <h1 className="mt-7 font-display text-[2.75rem] leading-[1.05] text-navy sm:text-6xl lg:text-7xl">
              {c.title}
            </h1>
          </div>

          {heroCover?.coverImage?.asset && (
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="relative mx-auto w-full max-w-[260px] rotate-[1.5deg] lg:mx-0 lg:max-w-none">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm shadow-[0_30px_60px_-22px_rgba(0,56,101,0.4)] ring-1 ring-navy/10">
                  <Image
                    src={urlFor(heroCover.coverImage).width(640).height(853).fit('crop').url()}
                    alt={
                      heroCover.coverImage.alt ||
                      `Forsiden til Rede nr ${heroCover.number} ${heroCover.year}`
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 260px, 33vw"
                    priority
                  />
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ② Ingress */}
        <div className="grid grid-cols-12 gap-x-6 pb-24 pt-14 lg:pb-36 lg:pt-16">
          <p className="col-span-12 max-w-2xl text-xl leading-relaxed text-navy/70 sm:text-2xl lg:col-span-7">
            {c.intro}
          </p>
        </div>
      </div>

      {/* ③ Fra papir til skjerm — navy fullbredde-bånd */}
      <section className="bg-navy">
        <div className="mx-auto grid max-w-[1200px] grid-cols-12 items-center gap-x-6 gap-y-6 px-6 py-20 lg:px-12 lg:py-28">
          <div className="col-span-12 lg:col-span-5">
            <span className="font-heading text-[11px] uppercase tracking-[0.4em] text-gold">
              {c.featureLabel}
            </span>
            <p className="mt-4 font-display text-3xl leading-tight text-mint lg:text-5xl">
              {c.featureHeading}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <p className="max-w-md text-lg leading-relaxed text-mint/70 lg:text-xl">
              {c.featureBody}
            </p>
            {c.paperOfferText && (
              <p className="mt-8 max-w-md text-base leading-relaxed text-mint/70 lg:text-lg">
                {c.paperOfferText}{' '}
                {c.paperOfferUrl ? (
                  <a
                    href={c.paperOfferUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gold underline decoration-gold/50 underline-offset-4 transition-colors hover:decoration-gold"
                  >
                    {c.paperOfferLinkLabel}
                  </a>
                ) : (
                  c.paperOfferLinkLabel
                )}
                .
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        {/* ④ Hva du finner — temaer som fargeord */}
        {tags.length > 0 && (
          <section className="grid grid-cols-12 gap-x-6 py-24 lg:py-36">
            <span className="col-span-12 mb-8 font-heading text-[11px] uppercase tracking-[0.4em] text-navy/40 lg:col-span-3 lg:mb-0">
              {c.topicsLabel}
            </span>
            <div className="col-span-12 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:col-span-9">
              {tags.map((tag, i) => (
                <Link
                  key={tag._id}
                  href={`/tema/${tag.slug.current}`}
                  className={`font-display text-3xl capitalize underline-offset-[6px] transition-all hover:underline sm:text-4xl lg:text-5xl ${
                    TAG_COLORS[i % TAG_COLORS.length]
                  }`}
                >
                  {tag.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ⑤ Avsender */}
        <p className="border-t border-navy/10 pt-10 font-heading text-sm uppercase tracking-[0.2em] text-navy/50">
          {c.publisherLine}
        </p>

        {/* ⑥ Utgaver */}
        {editions.length > 0 && (
          <section className="py-20 lg:py-28">
            <h2 className="mb-10 font-display text-3xl text-navy lg:text-4xl">
              {c.editionsHeading}
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-8">
              {editions.map((edition) => (
                <Link key={edition._id} href="/" className="group block w-36 sm:w-44">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-navy/5 ring-1 ring-navy/10">
                    {edition.coverImage?.asset ? (
                      <Image
                        src={urlFor(edition.coverImage)
                          .width(600)
                          .height(800)
                          .fit('crop')
                          .url()}
                        alt={edition.coverImage.alt || `Rede nr ${edition.number} ${edition.year}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="176px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center">
                        <span className="font-display text-xl text-navy/40">
                          Rede {edition.number}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 font-heading text-[11px] uppercase tracking-[0.2em] text-navy/50 transition-colors group-hover:text-navy">
                    Nr {edition.number} · {edition.year}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
