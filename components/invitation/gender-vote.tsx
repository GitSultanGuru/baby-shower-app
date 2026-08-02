'use client'

import { useCallback, useEffect, useState } from 'react'
import { burstConfetti } from '@/lib/confetti'

type Choice = 'girl' | 'boy'
type Tally = { girl: number; boy: number }

const KEY_TALLY = 'seem_tally_v3'
const KEY_VOTE = 'seem_vote_v3'

function readTally(): Tally {
  try {
    return (
      JSON.parse(localStorage.getItem(KEY_TALLY) || '') || { girl: 0, boy: 0 }
    )
  } catch {
    return { girl: 0, boy: 0 }
  }
}

export function GenderVote({
  onVote,
}: {
  onVote?: (choice: Choice) => void
}) {
  const [tally, setTally] = useState<Tally>({ girl: 0, boy: 0 })
  const [vote, setVote] = useState<Choice | null>(null)

  useEffect(() => {
    setTally(readTally())
    try {
      setVote((localStorage.getItem(KEY_VOTE) as Choice) || null)
    } catch {
      setVote(null)
    }
  }, [])

  const cast = useCallback(
    (choice: Choice) => {
      if (vote === choice) return

      const next = { ...tally }
      if (vote === 'girl') next.girl = Math.max(0, next.girl - 1)
      if (vote === 'boy') next.boy = Math.max(0, next.boy - 1)
      next[choice] += 1

      setTally(next)
      setVote(choice)
      try {
        localStorage.setItem(KEY_TALLY, JSON.stringify(next))
        localStorage.setItem(KEY_VOTE, choice)
      } catch {}

      burstConfetti(30)
      onVote?.(choice)
    },
    [vote, tally, onVote],
  )

  const total = tally.girl + tally.boy
  const girlPct = total ? Math.round((tally.girl / total) * 100) : 50
  const boyPct = 100 - girlPct

  const note = total
    ? `${total} ${total === 1 ? 'guess' : 'guesses'} so far · you're ${
        vote ? `Team ${vote === 'girl' ? 'Girl' : 'Boy'}!` : 'yet to vote'
      }`
    : 'Be the first to guess!'

  return (
    <div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <button
          type="button"
          aria-pressed={vote === 'girl'}
          onClick={() => cast('girl')}
          className={`rounded-2xl border px-3 py-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
            vote === 'girl'
              ? 'border-pink bg-pink-lt shadow-md'
              : 'border-border bg-panel-2'
          }`}
        >
          <div className="text-3xl" aria-hidden="true">
            {'👶'}
          </div>
          <div className="mt-1.5 font-serif text-xl font-bold text-forest">
            Team Girl
          </div>
        </button>

        <button
          type="button"
          aria-pressed={vote === 'boy'}
          onClick={() => cast('boy')}
          className={`rounded-2xl border px-3 py-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
            vote === 'boy'
              ? 'border-blue bg-blue-lt shadow-md'
              : 'border-border bg-panel-2'
          }`}
        >
          <div className="text-3xl" aria-hidden="true">
            {'👶'}
          </div>
          <div className="mt-1.5 font-serif text-xl font-bold text-forest">
            Team Boy
          </div>
        </button>
      </div>

      <div className="mt-6">
        <div
          className="flex h-7 overflow-hidden rounded-full border border-border bg-sage-lt"
          aria-hidden="true"
        >
          <div
            className="bg-pink transition-all duration-700"
            style={{ width: `${girlPct}%` }}
          />
          <div
            className="bg-blue transition-all duration-700"
            style={{ width: `${boyPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm text-green">
          <span>
            {'👶 Girl · '}
            <b className="text-forest">{girlPct}%</b>
          </span>
          <span>
            <b className="text-forest">{boyPct}%</b>
            {' · Boy 👶'}
          </span>
        </div>
        <p className="mt-2 text-center text-xs text-green-muted">{note}</p>
      </div>
    </div>
  )
}
