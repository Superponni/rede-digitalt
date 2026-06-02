import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

// Avslutter forhåndsvisningen og sender brukeren tilbake til forsiden.
export async function GET(request: Request) {
  const draft = await draftMode()
  draft.disable()
  return NextResponse.redirect(new URL('/', request.url))
}
