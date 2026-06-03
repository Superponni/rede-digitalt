// Server-komponent som rendrer strukturerte data som <script type="application/ld+json">.
// Rendres server-side → ligger i HTML-en søkemotorer og AI-crawlere ser direkte.
// `<` escapes til < for å hindre at innhold kan bryte ut av script-taggen.
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
