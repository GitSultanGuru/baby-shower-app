'use client'

import { useRef, useState } from 'react'
import { Minus, Plus, Send } from 'lucide-react'
import { burstConfetti } from '@/lib/confetti'
import { EVENT, RSVP_WHATSAPP_NUMBER } from '@/lib/event'

const ATTEND_OPTIONS = ["Yes, joyfully!", 'Trying my best', "Can't make it"]
const GUESS_OPTIONS = ['Team Girl', 'Team Boy', "It's a surprise!"]
const GUESS_LABELS: Record<string, string> = {
  'Team Girl': 'Team Girl 👶',
  'Team Boy': 'Team Boy 👶',
  "It's a surprise!": 'Surprise!',
}

export function RsvpForm({
  guess,
  setGuess,
}: {
  guess: string
  setGuess: (val: string) => void
}) {
  const [name, setName] = useState('')
  const [attend, setAttend] = useState(ATTEND_OPTIONS[0])
  const [count, setCount] = useState(1)
  const [note, setNote] = useState('')
  const [nameError, setNameError] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  function send() {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(true)
      nameRef.current?.focus()
      return
    }
    burstConfetti(50)

    const lines = [
      '*Seemantham RSVP* — ' + EVENT.coupleNames,
      '',
      `Name: ${trimmed}`,
      `Attending: ${attend}`,
      `Guests (incl. me): ${count}`,
    ]
    if (guess) lines.push(`My guess: ${guess}`)
    if (note.trim()) lines.push(`Message: ${note.trim()}`)
    lines.push('')
    lines.push(
      `See you on ${EVENT.day}, ${EVENT.dateShort}th · 7 PM at ${EVENT.venueName}, ${EVENT.venueArea}!`,
    )

    const text = encodeURIComponent(lines.join('\n'))
    window.open(
      `https://wa.me/${RSVP_WHATSAPP_NUMBER}?text=${text}`,
      '_blank',
      'noopener',
    )
  }

  return (
    <div className="mt-2 text-left">
      {/* Name */}
      <div className="mt-4">
        <label
          htmlFor="guestName"
          className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-green"
        >
          Your Name
        </label>
        <input
          id="guestName"
          ref={nameRef}
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) setNameError(false)
          }}
          placeholder="e.g. Priya & family"
          className={`w-full rounded-xl border bg-panel-2 px-3.5 py-3 text-base text-forest outline-none transition-colors focus:border-green ${
            nameError ? 'border-destructive' : 'border-border'
          }`}
        />
        {nameError && (
          <p className="mt-1.5 text-xs text-destructive">
            Please add your name so we know who&apos;s coming.
          </p>
        )}
      </div>

      {/* Attendance */}
      <div className="mt-4">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-green">
          Will you attend?
        </span>
        <div className="flex flex-wrap gap-2.5">
          {ATTEND_OPTIONS.map((opt) => {
            const selected = attend === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setAttend(opt)}
                className={`rounded-full border px-4 py-2.5 text-sm transition-all ${
                  selected
                    ? 'border-forest bg-green text-panel'
                    : 'border-border bg-panel-2 text-green hover:border-green'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Guest counter */}
      <div className="mt-4">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-green">
          How many guests (including you)?
        </span>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            aria-label="Decrease guests"
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-sage-lt text-green transition-colors hover:bg-sage"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span
            className="w-14 text-center font-serif text-2xl font-bold text-forest"
            aria-live="polite"
          >
            {count}
          </span>
          <button
            type="button"
            aria-label="Increase guests"
            onClick={() => setCount((c) => Math.min(30, c + 1))}
            className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-sage-lt text-green transition-colors hover:bg-sage"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Guess */}
      <div className="mt-4">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-green">
          Your guess
        </span>
        <div className="flex flex-wrap gap-2.5">
          {GUESS_OPTIONS.map((opt) => {
            const selected = guess === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setGuess(opt)}
                className={`rounded-full border px-4 py-2.5 text-sm transition-all ${
                  selected
                    ? 'border-forest bg-green text-panel'
                    : 'border-border bg-panel-2 text-green hover:border-green'
                }`}
              >
                {GUESS_LABELS[opt]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Note */}
      <div className="mt-4">
        <label
          htmlFor="msg"
          className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-green"
        >
          A note / blessing (optional)
        </label>
        <textarea
          id="msg"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Sending love and blessings…"
          className="min-h-[74px] w-full resize-y rounded-xl border border-border bg-panel-2 px-3.5 py-3 text-base text-forest outline-none transition-colors focus:border-green"
        />
      </div>

      <button
        type="button"
        onClick={send}
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-green px-4 py-4 text-sm font-medium uppercase tracking-[0.1em] text-panel shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <Send className="h-[18px] w-[18px]" />
        RSVP on WhatsApp
      </button>
      <p className="mt-3 text-center text-[11px] text-green-muted">
        Opens WhatsApp with a ready-to-send message. Your guess is saved on your
        device only.
      </p>
    </div>
  )
}
