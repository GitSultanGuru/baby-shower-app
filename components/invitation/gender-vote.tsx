'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Send } from 'lucide-react'
import { burstConfetti } from '@/lib/confetti'

type Choice = 'girl' | 'boy'

export function GenderVote() {
  const [guess, setGuess] = useState<Choice | null>(null)
  const [babyName, setBabyName] = useState('')
  const [meaning, setMeaning] = useState('')
  const [submitter, setSubmitter] = useState('')
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [celebrate, setCelebrate] = useState(false)
  const [revealedName, setRevealedName] = useState('')
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const submitterRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  function pick(choice: Choice) {
    if (guess === choice) return
    setGuess(choice)
    setErrors((e) => ({ ...e, guess: false }))
    burstConfetti(24)
  }

  function send() {
    const next: Record<string, boolean> = {}
    if (!guess) next.guess = true
    if (!babyName.trim()) next.babyName = true
    if (!meaning.trim()) next.meaning = true
    if (!submitter.trim()) next.submitter = true

    if (Object.keys(next).length) {
      setErrors(next)
      if (next.babyName) nameRef.current?.focus()
      else if (next.submitter) submitterRef.current?.focus()
      return
    }

    const suggested = babyName.trim()
    const payload = {
      guess: guess === 'girl' ? 'Girl' : 'Boy',
      suggestedName: suggested,
      meaning: meaning.trim(),
      submittedBy: submitter.trim(),
    }

    // Fire-and-forget — don't block the thank-you moment on the sheet response.
    void fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})

    burstConfetti(40)
    setRevealedName(suggested)
    setCelebrate(true)
    setGuess(null)
    setBabyName('')
    setMeaning('')
    setSubmitter('')
    setErrors({})

    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setCelebrate(false)
      setRevealedName('')
    }, 5200)
  }

  return (
    <div className="relative z-10 mt-3 text-left">
      {/* Q1 — Boy or Girl */}
      <div>
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-green">
          1 · Boy or Girl?
        </span>
        <div className="grid grid-cols-2 gap-3">
          <GuessButton
            label="Girl"
            emoji="👧"
            selected={guess === 'girl'}
            tone="girl"
            onClick={() => pick('girl')}
          />
          <GuessButton
            label="Boy"
            emoji="👦"
            selected={guess === 'boy'}
            tone="boy"
            onClick={() => pick('boy')}
          />
        </div>
        {errors.guess && (
          <p className="mt-1.5 text-xs text-destructive">
            Pick a side — boy or girl!
          </p>
        )}
      </div>

      {/* Q2 — Name suggestion + meaning */}
      <div className="mt-4">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-green">
          2 · A name for the little one?
        </span>
        <input
          ref={nameRef}
          type="text"
          value={babyName}
          onChange={(e) => {
            setBabyName(e.target.value)
            if (errors.babyName) setErrors((er) => ({ ...er, babyName: false }))
          }}
          placeholder="Suggested name"
          className={`w-full rounded-xl border bg-panel-2 px-3.5 py-2.5 text-base text-forest outline-none transition-colors focus:border-green ${
            errors.babyName ? 'border-destructive' : 'border-border'
          }`}
        />
        <input
          type="text"
          value={meaning}
          onChange={(e) => {
            setMeaning(e.target.value)
            if (errors.meaning) setErrors((er) => ({ ...er, meaning: false }))
          }}
          placeholder="What does it mean?"
          className={`mt-2 w-full rounded-xl border bg-panel-2 px-3.5 py-2.5 text-base text-forest outline-none transition-colors focus:border-green ${
            errors.meaning ? 'border-destructive' : 'border-border'
          }`}
        />
      </div>

      {/* Q3 — Submitter */}
      <div className="mt-4">
        <label
          htmlFor="funSubmitter"
          className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-green"
        >
          3 · Your name
        </label>
        <input
          id="funSubmitter"
          ref={submitterRef}
          type="text"
          autoComplete="name"
          value={submitter}
          onChange={(e) => {
            setSubmitter(e.target.value)
            if (errors.submitter)
              setErrors((er) => ({ ...er, submitter: false }))
          }}
          placeholder="So we know who suggested it"
          className={`w-full rounded-xl border bg-panel-2 px-3.5 py-2.5 text-base text-forest outline-none transition-colors focus:border-green ${
            errors.submitter ? 'border-destructive' : 'border-border'
          }`}
        />
      </div>

      <button
        type="button"
        onClick={send}
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-green px-4 py-3.5 text-sm font-medium uppercase tracking-[0.1em] text-panel shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <Send className="h-[18px] w-[18px]" />
        Send your wish
      </button>
      <p className="mt-2.5 text-center text-[11px] text-green-muted">
        Your guess is saved quietly in the background.
      </p>

      {celebrate && <BabyThanksOverlay name={revealedName} />}
    </div>
  )
}

function BabyThanksOverlay({ name }: { name: string }) {
  const len = name.length
  const nameClass =
    len > 22
      ? 'text-[clamp(1.35rem,5vw,1.85rem)]'
      : len > 14
        ? 'text-[clamp(1.7rem,6vw,2.35rem)]'
        : len > 8
          ? 'text-[clamp(2rem,7vw,2.85rem)]'
          : 'text-[clamp(2.4rem,8vw,3.25rem)]'

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-forest-deep/55 p-4 backdrop-blur-[2px]"
    >
      <div className="smile-pop relative w-[min(96vw,480px)] overflow-hidden rounded-3xl bg-panel-2 shadow-[0_22px_60px_-18px_rgba(15,32,18,0.65)] outline outline-1 outline-offset-4 outline-gold/50">
        {/* Scene — baby looking toward the reveal below */}
        <div className="reveal-stage relative aspect-[1024/558] w-full overflow-hidden">
          <div className="reveal-scene absolute inset-0">
            <Image
              src="/images/name-reveal-scene.png"
              alt=""
              fill
              priority
              className="reveal-scene-img object-cover object-[70%_55%]"
              sizes="480px"
            />
          </div>
          <div className="reveal-grade pointer-events-none absolute inset-0" />
        </div>

        {/* Unveil sits under the art, not on top of it */}
        <div className="relative border-t border-gold/30 bg-sage-lt/40 px-4 py-5">
          <div className="unveil-plaque relative mx-auto w-full overflow-hidden rounded-2xl border border-gold/45 bg-panel-2 px-4 py-6 text-center shadow-[0_12px_28px_-14px_rgba(15,32,18,0.4)]">
            <div className="text-[10px] font-medium uppercase tracking-[0.26em] text-green">
              A name for the little one
            </div>
            <p
              className={`name-unveil relative z-[1] mt-2 font-script leading-tight text-forest text-pretty ${nameClass}`}
            >
              {name}
            </p>
            <p className="relative z-[1] mt-2 font-serif text-base italic text-green">
              Thank you!
            </p>

            <div className="unveil-curtain unveil-curtain-left" aria-hidden="true" />
            <div className="unveil-curtain unveil-curtain-right" aria-hidden="true" />
          </div>
        </div>

        <div className="border-t border-gold/25 bg-sage-lt/70 px-5 py-3.5 text-center">
          <p className="font-serif text-[14px] italic text-green">
            Your wish has been received with love.
          </p>
        </div>
      </div>
    </div>
  )
}

function GuessButton({
  label,
  emoji,
  selected,
  tone,
  onClick,
}: {
  label: string
  emoji: string
  selected: boolean
  tone: Choice
  onClick: () => void
}) {
  const selectedClass =
    tone === 'girl'
      ? 'border-pink bg-pink-lt shadow-md scale-[1.02]'
      : 'border-blue bg-blue-lt shadow-md scale-[1.02]'

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-2xl border px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 ${
        selected
          ? selectedClass
          : 'border-border bg-panel-2 hover:border-green/40'
      }`}
    >
      <div className="text-3xl leading-none" aria-hidden="true">
        {emoji}
      </div>
      <div className="mt-1.5 font-serif text-lg font-bold text-forest">
        {label}
      </div>
    </button>
  )
}
