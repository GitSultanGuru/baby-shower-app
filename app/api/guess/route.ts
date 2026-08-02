import { NextResponse } from 'next/server'

type GuessPayload = {
  guess?: string
  suggestedName?: string
  meaning?: string
  submittedBy?: string
}

export async function POST(request: Request) {
  const webAppUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL

  if (!webAppUrl) {
    return NextResponse.json(
      { ok: false, error: 'Sheet webhook is not configured yet.' },
      { status: 503 },
    )
  }

  let body: GuessPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const guess = String(body.guess || '').trim()
  const suggestedName = String(body.suggestedName || '').trim()
  const meaning = String(body.meaning || '').trim()
  const submittedBy = String(body.submittedBy || '').trim()

  if (!guess || !suggestedName || !meaning || !submittedBy) {
    return NextResponse.json(
      { ok: false, error: 'Please fill in all fields.' },
      { status: 400 },
    )
  }

  if (guess !== 'Girl' && guess !== 'Boy') {
    return NextResponse.json(
      { ok: false, error: 'Guess must be Girl or Boy.' },
      { status: 400 },
    )
  }

  try {
    // Apps Script web apps drop POST bodies on redirect; GET query params are reliable.
    const url = new URL(webAppUrl)
    url.searchParams.set('guess', guess)
    url.searchParams.set('suggestedName', suggestedName)
    url.searchParams.set('meaning', meaning)
    url.searchParams.set('submittedBy', submittedBy)

    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
    })

    const text = await response.text()
    let parsed: { ok?: boolean; message?: string; error?: string } | null = null
    try {
      parsed = JSON.parse(text) as {
        ok?: boolean
        message?: string
        error?: string
      }
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Sheet webhook needs “Execute as: Me” and “Who has access: Anyone”. Redeploy the web app, then try again.',
        },
        { status: 502 },
      )
    }

    // Old deployment only returns the health ping and never writes.
    if (parsed.message === 'Baby shower guess webhook is live') {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Sheet script needs a new deploy with the write code. Save → Deploy → Manage deployments → Edit → New version → Deploy.',
        },
        { status: 502 },
      )
    }

    if (!response.ok || parsed.ok !== true) {
      return NextResponse.json(
        {
          ok: false,
          error:
            parsed.error ||
            'Could not save to the sheet. Please try again.',
        },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Could not reach the sheet. Please try again.' },
      { status: 502 },
    )
  }
}
