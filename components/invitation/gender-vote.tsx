'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Send } from 'lucide-react'
import { burstConfetti } from '@/lib/confetti'

type Choice = 'girl' | 'boy'

const CELEBRATE_MS = 4800

export function GenderVote({ onDone }: { onDone?: () => void }) {
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
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  /** Keep focused fields visible above the mobile soft keyboard */
  function keepInView(el: HTMLElement | null) {
    if (!el) return
    window.setTimeout(() => {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 280)
  }

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
    // Dismiss mobile keyboard so the thank-you overlay isn't pushed up
    if (typeof document !== 'undefined') {
      ;(document.activeElement as HTMLElement | null)?.blur?.()
    }

    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setCelebrate(false)
      setRevealedName('')
      // Wait a frame so overlay unmount doesn't fight scroll-snap
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onDoneRef.current?.()
        })
      })
    }, CELEBRATE_MS)
  }

  return (
    <div className="relative z-10 mt-2 text-left sm:mt-3">
      {/* Q1 — Boy or Girl */}
      <div>
        <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-green sm:mb-2 sm:text-[11px]">
          1 · Boy or Girl?
        </span>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
      <div className="mt-3 sm:mt-4">
        <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-green sm:mb-2 sm:text-[11px]">
          2 · Suggested name
        </span>
        <input
          ref={nameRef}
          type="text"
          enterKeyHint="next"
          autoCapitalize="words"
          autoCorrect="off"
          value={babyName}
          onFocus={(e) => keepInView(e.currentTarget)}
          onChange={(e) => {
            setBabyName(e.target.value)
            if (errors.babyName) setErrors((er) => ({ ...er, babyName: false }))
          }}
          placeholder="A name you love"
          className={`w-full rounded-xl border bg-panel-2 px-3 py-2.5 text-base text-forest outline-none transition-colors focus:border-green sm:px-3.5 sm:py-3 ${
            errors.babyName ? 'border-destructive' : 'border-border'
          }`}
        />
        <input
          type="text"
          enterKeyHint="next"
          autoCapitalize="sentences"
          value={meaning}
          onFocus={(e) => keepInView(e.currentTarget)}
          onChange={(e) => {
            setMeaning(e.target.value)
            if (errors.meaning) setErrors((er) => ({ ...er, meaning: false }))
          }}
          placeholder="What does it mean?"
          className={`mt-2 w-full rounded-xl border bg-panel-2 px-3 py-2.5 text-base text-forest outline-none transition-colors focus:border-green sm:px-3.5 sm:py-3 ${
            errors.meaning ? 'border-destructive' : 'border-border'
          }`}
        />
      </div>

      {/* Q3 — Submitter */}
      <div className="mt-3 sm:mt-4">
        <label
          htmlFor="funSubmitter"
          className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-green sm:mb-2 sm:text-[11px]"
        >
          3 · Your name
        </label>
        <input
          id="funSubmitter"
          ref={submitterRef}
          type="text"
          enterKeyHint="send"
          autoComplete="name"
          autoCapitalize="words"
          value={submitter}
          onFocus={(e) => keepInView(e.currentTarget)}
          onChange={(e) => {
            setSubmitter(e.target.value)
            if (errors.submitter)
              setErrors((er) => ({ ...er, submitter: false }))
          }}
          placeholder="So we know who guessed"
          className={`w-full rounded-xl border bg-panel-2 px-3 py-2.5 text-base text-forest outline-none transition-colors focus:border-green sm:px-3.5 sm:py-3 ${
            errors.submitter ? 'border-destructive' : 'border-border'
          }`}
        />
      </div>

      <button
        type="button"
        onClick={send}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-green px-4 py-3 text-sm font-medium uppercase tracking-[0.1em] text-panel shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:mt-5 sm:gap-2.5 sm:py-3.5"
      >
        <Send className="h-[18px] w-[18px]" />
        Send your wish
      </button>
      <p className="mt-2 text-center text-[10.5px] text-green-muted sm:mt-2.5 sm:text-[11px]">
        Saved quietly in the background.
      </p>

      {celebrate && <BabyThanksOverlay name={revealedName} />}
    </div>
  )
}

function BabyThanksOverlay({ name }: { name: string }) {
  const len = name.length
  const nameClass =
    len > 22
      ? 'text-[clamp(1.25rem,4.5vw,1.75rem)]'
      : len > 14
        ? 'text-[clamp(1.5rem,5.5vw,2.2rem)]'
        : len > 8
          ? 'text-[clamp(1.85rem,6.5vw,2.7rem)]'
          : 'text-[clamp(2.15rem,7.5vw,3.1rem)]'

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-0 right-0 z-[70] flex items-center justify-center bg-forest-deep/55 p-3 sm:p-4"
      style={{
        top: 'var(--app-top, 0px)',
        height: 'var(--app-height, 100dvh)',
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="smile-pop relative max-h-full w-[min(94vw,440px)] overflow-y-auto overscroll-contain rounded-2xl bg-panel-2 shadow-[0_22px_60px_-18px_rgba(15,32,18,0.65)] sm:rounded-3xl sm:outline sm:outline-1 sm:outline-offset-4 sm:outline-gold/50">
        <div className="reveal-stage relative aspect-[1024/558] max-h-[28vh] w-full overflow-hidden sm:max-h-[36vh]">
          <div className="reveal-scene absolute inset-0">
            <Image
              src="/images/name-reveal-scene.png"
              alt=""
              fill
              priority
              className="reveal-scene-img object-cover object-[70%_55%]"
              sizes="440px"
            />
          </div>
          <div className="reveal-grade pointer-events-none absolute inset-0" />
        </div>

        <div className="relative border-t border-gold/30 bg-sage-lt/40 px-3 py-3.5 sm:px-4 sm:py-5">
          <div className="unveil-plaque relative mx-auto w-full overflow-hidden rounded-xl border border-gold/45 bg-panel-2 px-3 py-4 text-center shadow-[0_12px_28px_-14px_rgba(15,32,18,0.4)] sm:rounded-2xl sm:px-4 sm:py-6">
            <div className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-green sm:text-[10px] sm:tracking-[0.26em]">
              Your name wish
            </div>
            <p
              className={`name-unveil relative z-[1] mt-1.5 font-script leading-tight text-forest text-pretty sm:mt-2 ${nameClass}`}
            >
              {name}
            </p>
            <p className="relative z-[1] mt-1.5 font-serif text-[15px] italic text-green sm:mt-2 sm:text-base">
              Thank you!
            </p>

            <div
              className="unveil-curtain unveil-curtain-left"
              aria-hidden="true"
            />
            <div
              className="unveil-curtain unveil-curtain-right"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="border-t border-gold/25 bg-sage-lt/70 px-4 py-3 text-center sm:px-5 sm:py-3.5">
          <p className="font-serif text-[13px] italic text-green sm:text-[14px]">
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
      className={`rounded-xl border px-2.5 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 sm:rounded-2xl sm:px-3 sm:py-4 ${
        selected
          ? selectedClass
          : 'border-border bg-panel-2 hover:border-green/40'
      }`}
    >
      <div className="text-2xl leading-none sm:text-3xl" aria-hidden="true">
        {emoji}
      </div>
      <div className="mt-1 font-serif text-base font-bold text-forest sm:mt-1.5 sm:text-lg">
        {label}
      </div>
    </button>
  )
}
