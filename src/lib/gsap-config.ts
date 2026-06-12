'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

ScrollTrigger.config({
  // Fjern 'visibilitychange' fra auto-refresh. Standard inkluderer det, så når
  // man byttet til et annet vindu/fane og kom tilbake, kjørte GSAP en full
  // ScrollTrigger.refresh() som fikk scrub- og scale-animasjoner til å hoppe —
  // opplevd som at illustrasjoner plutselig «endrer størrelse». De eksplisitte
  // refreshene i ScrollytellingRenderer (load, fonter, bildelasting, timeouts)
  // holder posisjonene korrekte uten det.
  // ignoreMobileResize hindrer samme hopp når mobilens adresselinje kollapser/
  // utvides under scroll (en ren UI-resize, ikke et reelt layout-skifte).
  autoRefreshEvents: 'DOMContentLoaded,load,resize',
  ignoreMobileResize: true,
})

export { gsap, ScrollTrigger }
