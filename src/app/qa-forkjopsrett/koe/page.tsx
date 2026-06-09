'use client'

// MIDLERTIDIG QA-PREVIEW for set-piece ① «Køen» — slettes før deploy.
// Rendrer den filmatiske køen i ekte fargeverden (navy + canvas), med en rolig
// lead-in og lead-out så pin-oppførselen matcher produksjon. Rører IKKE Sanity.
import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsap-config'
import { ScrollyThemeProvider } from '@/components/scrollytelling/ScrollyThemeContext'
import { ScrollyColorProvider, resolveScrollyColors } from '@/components/scrollytelling/ScrollyColorContext'
import { IllustratedCover } from '@/components/scrollytelling/sections/IllustratedCover'
import { IllustratedScene } from '@/components/scrollytelling/sections/IllustratedScene'
import { KoeLapp } from '@/components/scrollytelling/sections/KoeLapp'
import { StickyVei } from '@/components/scrollytelling/sections/StickyVei'
import { Veideling } from '@/components/scrollytelling/sections/Veideling'
import { AnsiennitetSjekk } from '@/components/scrollytelling/sections/AnsiennitetSjekk'
import { StorbyKart } from '@/components/scrollytelling/sections/StorbyKart'
import { GifKort } from '@/components/scrollytelling/sections/GifKort'
import { Footer } from '@/components/forside/Footer'

// Samme fargeoppslag som produksjons-rendreren, så bakgrunnen blir den lyse
// canvas-blåen (#D3E4F5) — ikke komponentenes mørke navy-fallback.
const COLORS = resolveScrollyColors('navy', 'canvas')

const block = (text: string) => [
  {
    _type: 'block',
    _key: text.slice(0, 8),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 's', text, marks: [] }],
  },
]

export default function KoeQaPage() {
  // Samme refresh-logikk som produksjons-rendreren: trigger-posisjonene regnes ut
  // ved mount, men sidehøyden vokser når bilder/fonter/gif laster. Da blir
  // posisjonene lenger ned utdaterte («avvik nedover»). Tving omberegning.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const refresh = () => ScrollTrigger.refresh()
    const debounced = () => {
      clearTimeout(t)
      t = setTimeout(refresh, 120)
    }
    const imgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[]
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', debounced)
    })
    window.addEventListener('load', refresh)
    document.fonts?.ready?.then(refresh)
    const t1 = setTimeout(refresh, 400)
    const t2 = setTimeout(refresh, 1500)
    return () => {
      imgs.forEach((img) => img.removeEventListener('load', debounced))
      window.removeEventListener('load', refresh)
      clearTimeout(t)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <ScrollyThemeProvider>
      <ScrollyColorProvider accentColor="navy" colorMode="canvas">
        <article className="relative" style={{ backgroundColor: COLORS.bg }}>
          {/* Cover */}
          <IllustratedCover
            index={0}
            data={{
              backgroundColor: COLORS.bg,
              kicker: 'Forkjøpsrett',
              title: 'Slik går du foran i boligkøen',
              dek: 'Forkjøpsrett er din største fordel som TOBB-medlem. Men hvordan fungerer det egentlig?',
              icon: 'nokkel',
            }}
          />

          <IllustratedScene
            index={1}
            data={{
              backgroundColor: COLORS.bg,
              eyebrow: 'Boligjakt',
              title: 'Du finner drømmeleiligheten',
              icon: 'til-salgs',
              animateIllustration: true,
              text: block(
                'Riktig pris. Riktig nabolag. Til og med balkong mot vest. Så scroller du ned til visningstidspunktet — og skjønner at du ikke er alene.',
              ),
            }}
          />

          {/* «29 andre» beholdes som den fine folkemengde-illustrasjonen (fade).
              Teksten lander på et spørsmål som den interaktive bryteren svarer på. */}
          <IllustratedScene
            index={1}
            data={{
              backgroundColor: COLORS.bg,
              title: 'Det gjør 29 andre også',
              icon: 'forstemann',
              text: block(
                'På en god visning i en presset by kan det stå titalls mennesker i kø. Alle med finansieringsbevis. Den med mest på konto vinner som regel. Men hva om du kunne snike i køen, helt lovlig?',
              ),
            }}
          />

          {/* Køen — scroll-drevet kølapp (samme komponent som produksjon) */}
          <KoeLapp index={2} data={{ backgroundColor: COLORS.bg, competitors: 29 }} />

          <IllustratedScene
            index={3}
            data={{
              backgroundColor: COLORS.bg,
              eyebrow: 'Motoren',
              title: 'Klokka starter dagen du blir medlem',
              icon: 'nr-1',
              secondaryIcon: 'kalender',
              text: block(
                'Forkjøpsrett bygger på ansiennitet — hvor lenge du har vært TOBB-medlem. Jo lengre du har vært medlem, jo nærmere døra står du. En TOBB-bolig gjøres tilgjengelig for medlemmer på én av to måter — megleren bestemmer hvilken, ut fra salgsformen.',
              ),
            }}
          />

          {/* Visuelt veiskille: streken deler seg i hovedvei (95 %) + sidevei (unntak) */}
          <Veideling
            index={4}
            data={{
              backgroundColor: COLORS.bg,
              intro: 'Her deler veien seg.',
              mainLabel: 'Forhåndsavklaring',
              mainBadge: '95 % av salgene',
              sideLabel: 'Fastprisavklaring',
              sideBadge: 'Unntaket',
            }}
          />

          {/* Sticky-vei (proof of pattern): illustrasjonen blir stående og settes
              sammen for hvert steg mens teksten leses nedover. Foreløpig kun Vei 1. */}
          <StickyVei
            index={5}
            data={{
              backgroundColor: COLORS.bg,
              label: 'Vei 1 · Forhåndsavklaring',
              badge: '95 % av salgene',
              intro:
                'Du viser interesse tidlig, helt uforpliktende. En faktisk kø oppstår først hvis du vil kreve forkjøp etter budrunden — og da vinner best ansiennitet.',
              steps: [
                {
                  icon: 'pc',
                  title: 'Boligen dukker opp',
                  text: 'Boligen lyses ut for medlemmer i forkjøpsportalen på TOBB.no. Her melder du interesse innen fristen — før den legges ut for salg offentlig.',
                },
                {
                  icon: 'mote',
                  title: 'Megler tar over',
                  text: 'Fristen utløper, og megler får oversikt over interessentene. Så kjøres salget som et vanlig boligsalg: annonsering, visning og budaksept.',
                },
                {
                  icon: 'telefon',
                  title: 'Sjansen din kommer',
                  text: 'TOBB sender deg sms og e-post med frist for å kreve forkjøpsrett. Et krav du sender inn her, er bindende.',
                },
                {
                  icon: 'nokkel',
                  title: 'Avklart',
                  text: 'Forkjøpsretten avklares, og alle parter informeres. Står du øverst på ansiennitet, er nøkkelen din.',
                },
              ],
            }}
          />

          {/* Veiskille-bro til Vei 2: spørsmål som tittel, svar som brødtekst */}
          <IllustratedScene
            index={6}
            data={{
              backgroundColor: COLORS.bg,
              title: 'Men hva om boligen allerede er solgt i en helt vanlig budrunde?',
              text: block('Da slår den andre veien inn — unntaket.'),
              centerBody: true,
            }}
          />

          {/* Vei 2 — Fastprisavklaring (unntaket), samme sticky-mal */}
          <StickyVei
            index={7}
            data={{
              backgroundColor: COLORS.bg,
              label: 'Vei 2 · Fastprisavklaring',
              badge: 'Unntaket',
              intro:
                'Her finnes ingen interessefase. Boligen er allerede solgt i en vanlig budrunde, og gjøres så tilgjengelig for forkjøpsrett — køen rangeres etter ansiennitet.',
              steps: [
                {
                  icon: 'til-salgs',
                  title: 'Vanlig salg først',
                  text: 'Boligen legges direkte ut på det åpne markedet, uten å ha vært lyst ut med forkjøpsrett. Megler kjører annonsering, visning, budrunde og aksept.',
                },
                {
                  icon: 'pc',
                  title: 'Fast pris i portalen',
                  text: 'TOBB legger boligen i Forkjøpsportalen med en frist. Pris og overtakelse er allerede fastsatt — etter høyeste bud.',
                },
                {
                  icon: 'signere',
                  title: 'Du krever forkjøp',
                  text: 'Du bruker forkjøpsretten ved å sende inn et skjema på TOBB.no. Innsendingen er bindende.',
                },
                {
                  icon: 'nokkel',
                  title: 'Avklart',
                  text: 'Forkjøpsrett avklares hos TOBB, og alle parter informeres. Best ansiennitet vinner — også her.',
                },
              ],
            }}
          />

          {/* Avslutning: nøkkelen settes sammen + «livet gjennom»-tekst */}
          <IllustratedScene
            index={8}
            data={{
              backgroundColor: COLORS.bg,
              eyebrow: 'Livet gjennom',
              title: 'Et fortrinn som følger deg',
              icon: 'sparegris',
              animateIllustration: true,
              text: block(
                'Første leilighet. Større bolig når livet vokser. Noe mindre den dagen barna har flyttet ut. Forkjøpsretten står ved din side hver gang du skal flytte videre — og jo tidligere du startet, jo sterkere står du.',
              ),
            }}
          />

          {/* Følger-deg-gif i postkort — visuell spøk etter «følger deg» */}
          <GifKort
            index={9}
            data={{
              backgroundColor: COLORS.bg,
              src: '/forkjopsrett/stalk.gif',
              alt: 'Forkjøpsretten følger deg',
              maxWidth: 320,
            }}
          />

          {/* Storby-kart: helt mot slutten, rett før den personlige CTA-en */}
          <StorbyKart
            index={9}
            data={{
              backgroundColor: COLORS.bg,
              eyebrow: 'Hele landet',
              title: 'Og ikke bare i Trondheim',
              intro:
                'Gjennom Storbysamarbeidet gjelder forkjøpsretten i åtte boligbyggelag — fra Kristiansand til Tromsø. Skal du studere eller flytte? Ansienniteten din blir med deg.',
            }}
          />

          {/* Personlig landing: sett året du ble medlem → din styrke + CTA */}
          <AnsiennitetSjekk
            index={9}
            data={{
              backgroundColor: COLORS.bg,
              nowYear: 2026,
              ctaLabel: 'Bli TOBB-medlem',
              ctaHref: 'https://tobb.no/bli-medlem/',
            }}
          />
        </article>
      </ScrollyColorProvider>
      {/* Samme delte footer som resten av siten (ekte artikkel får den via (site)-layout) */}
      <Footer />
    </ScrollyThemeProvider>
  )
}
