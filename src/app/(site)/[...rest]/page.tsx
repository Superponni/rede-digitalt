import { notFound } from 'next/navigation'

// Fanger alle adresser som ingen annen rute matcher, og sender dem til den
// norske 404-siden i (site)-gruppen — med header og footer intakt.
export default function CatchAll() {
  notFound()
}
