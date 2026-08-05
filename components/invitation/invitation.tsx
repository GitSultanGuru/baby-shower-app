'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { burstConfetti } from '@/lib/confetti'
import { EVENT } from '@/lib/event'
import { useMobileViewport } from '@/lib/use-mobile-viewport'
import { cn } from '@/lib/utils'
import { CornerDecor } from './corner-decor'
import { GenderVote } from './gender-vote'

/* ---------- small presentational helpers ---------- */

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-green sm:text-[10.5px] sm:tracking-[0.32em]">
      {children}
    </div>
  )
}

function LeafLine() {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 mx-auto my-2.5 flex w-full max-w-[160px] items-center justify-center gap-2.5 text-gold sm:my-3.5 sm:max-w-[180px]"
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold" />
      <span className="text-sm">✽</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold" />
    </div>
  )
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'reveal relative mx-auto w-full max-w-[520px] rounded-2xl bg-panel-2 px-4 py-6 shadow-[0_22px_60px_-24px_rgba(15,32,18,0.75)] sm:rounded-3xl sm:px-8 sm:py-9 sm:outline sm:outline-1 sm:outline-offset-4 sm:outline-gold/40',
        className,
      )}
    >
      {children}
    </div>
  )
}

function Panel({
  children,
  tall,
}: {
  children: React.ReactNode
  /** Tall form panels grow past one viewport and pin content to the top */
  tall?: boolean
}) {
  return (
    <section
      data-panel
      className={cn(
        'invitation-panel relative flex w-full snap-start snap-always flex-col',
        tall && 'invitation-panel--tall',
      )}
    >
      <div className="invitation-panel-inner w-full">{children}</div>
    </section>
  )
}

/* ---------- main component ---------- */

export function Invitation() {
  const [opened, setOpened] = useState(false)
  const [activePanel, setActivePanel] = useState(0)

  const deckRef = useRef<HTMLElement>(null)

  useMobileViewport()

  function closeToCover() {
    setOpened(false)
    setActivePanel(0)
  }

  function goToPanel(i: number) {
    const deck = deckRef.current
    if (!deck) return
    const panels = deck.querySelectorAll<HTMLElement>('[data-panel]')
    const target = panels[i]
    if (!target) return

    // Position relative to the scrollport (offsetTop alone fails with snap/tall panels)
    const nextTop =
      deck.scrollTop +
      (target.getBoundingClientRect().top - deck.getBoundingClientRect().top)

    deck.scrollTo({ top: nextTop, behavior: 'auto' })
    setActivePanel(i)
  }

  const goToPanelRef = useRef(goToPanel)
  goToPanelRef.current = goToPanel
  const closeToCoverRef = useRef(closeToCover)
  closeToCoverRef.current = closeToCover

  // Reveal-on-scroll + progress dots + cover-exit zone
  useEffect(() => {
    if (!opened) return
    const deck = deckRef.current
    if (!deck) return

    const panels = Array.from(
      deck.querySelectorAll<HTMLElement>('[data-panel]'),
    )
    const first = panels[0]

    // Land on first content panel (skip the cover-exit strip above it)
    const frame = requestAnimationFrame(() => {
      if (first) {
        const top =
          deck.scrollTop +
          (first.getBoundingClientRect().top - deck.getBoundingClientRect().top)
        deck.scrollTop = top
      }
    })
    setActivePanel(0)

    const reveals = deck.querySelectorAll<HTMLElement>('.reveal')
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in')
        })
      },
      { threshold: 0.15, root: deck },
    )
    reveals.forEach((r) => revealObserver.observe(r))
    reveals[0]?.classList.add('in')

    const panelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = panels.indexOf(e.target as HTMLElement)
            if (idx >= 0) setActivePanel(idx)
          }
        })
      },
      { threshold: 0.45, root: deck },
    )
    panels.forEach((p) => panelObserver.observe(p))

    // Scroll up into the exit strip → return to landing
    let exitArmed = false
    const armTimer = window.setTimeout(() => {
      exitArmed = true
    }, 700)
    const exit = deck.querySelector('[data-cover-exit]')
    const exitObserver = exit
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!exitArmed) return
              if (e.isIntersecting && e.intersectionRatio >= 0.55) {
                closeToCoverRef.current()
              }
            })
          },
          { root: deck, threshold: [0.55, 0.75, 1] },
        )
      : null
    if (exit && exitObserver) exitObserver.observe(exit)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(armTimer)
      revealObserver.disconnect()
      panelObserver.disconnect()
      exitObserver?.disconnect()
    }
  }, [opened])

  function open() {
    setOpened(true)
    burstConfetti(70)
  }

  const PANEL_COUNT = 4

  return (
    <div className="invitation-shell">
      {/* confetti layer */}
      <div
        id="confetti"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[60] overflow-hidden"
      />

          {/* gold viewport frame */}
      <div
        aria-hidden="true"
        className="invitation-frame pointer-events-none z-[45] rounded-2xl border border-gold/35 shadow-[inset_0_0_0_4px_rgba(41,74,44,0.28)] sm:border-gold/50 sm:shadow-[inset_0_0_0_6px_rgba(41,74,44,0.35)]"
      />

      {/* ================= COVER ================= */}
      {!opened && (
        <div
          role="dialog"
          aria-label="Open your invitation"
          className="invitation-cover z-50"
        >
          <div className="cover-rise relative max-h-full w-[min(88vw,400px)] overflow-y-auto overscroll-contain rounded-3xl bg-panel-2 px-6 py-8 text-center shadow-[0_22px_60px_-24px_rgba(15,32,18,0.75)] sm:w-[min(92vw,430px)] sm:px-8 sm:py-10 sm:outline sm:outline-1 sm:outline-offset-8 sm:outline-gold/50">
            <CornerDecor corner="tl" />
            <CornerDecor corner="br" />

            <Image
              src="/images/peacock-feather-alpha.png"
              alt="Peacock feather"
              width={72}
              height={110}
              className="relative z-10 mx-auto mb-1 h-20 w-auto sm:h-24"
              priority
            />
            <div className="relative z-10 font-script-alt text-xl font-semibold text-green sm:text-2xl">
              With joyful hearts,
            </div>
            <div className="relative z-10 mt-2 font-script text-4xl leading-none text-green sm:text-5xl">
              {EVENT.coupleNames}
              <span className="align-super text-2xl sm:text-3xl">&apos;s</span>
            </div>
            <div className="relative z-10 mt-2 font-telugu text-4xl leading-none text-forest sm:text-5xl">
              {EVENT.teluguTitle}
            </div>
            <div className="relative z-10 mt-1 font-serif text-[15px] italic text-green-ink sm:text-[17px]">
              along with the{' '}
              <b className="font-bold not-italic">{EVENT.family}</b>
            </div>
            <LeafLine />
            <div className="relative z-10 text-[10.5px] uppercase tracking-[0.18em] text-green sm:text-[11.5px] sm:tracking-[0.22em]">
              warmly invite you to her baby shower
            </div>

            <button
              type="button"
              onClick={open}
              className="relative z-10 mt-5 inline-flex items-center gap-2.5 rounded-full bg-green px-7 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-panel shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:mt-6 sm:px-8 sm:py-3.5 sm:text-[12.5px]"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-gold-lt shadow-[0_0_0_4px_rgba(216,184,105,0.3)]"
                aria-hidden="true"
              />
              Open Invitation
            </button>
            <div className="relative z-10 mt-3 text-[10px] uppercase tracking-[0.14em] text-green/70 sm:mt-3.5 sm:text-[10.5px]">
              Tap to unfold &amp; scroll through
            </div>
          </div>
        </div>
      )}

      {/* ================= DECK ================= */}
      {opened && (
        <>
          {/* Centered inside the gold frame bounds (not the full viewport) */}
          {activePanel === 0 && (
            <div
              className="invitation-scroll-cue scroll-cue"
              aria-hidden="true"
            >
              <span>Scroll</span>
              <span>↓</span>
            </div>
          )}

          <main
            ref={deckRef}
            aria-label="Seemantham invitation"
            className="invitation-deck"
          >
            {/* Scroll up into this strip to return to the landing cover */}
            <div
              data-cover-exit
              className="invitation-cover-exit"
              aria-hidden="true"
            />

            {/* Panel 1 — Mother-to-be & tradition */}
            <Panel>
              <Card className="bg-sage text-center">
                <CornerDecor corner="tl" />
                <CornerDecor corner="br" />
                <Kicker>Celebrating</Kicker>
                <div className="relative z-10 mt-1 text-center font-script text-4xl leading-none text-forest sm:text-5xl">
                  {EVENT.coupleNames}
                </div>
                <div className="relative z-10 mt-1.5 text-center font-serif text-base italic text-green sm:text-lg">
                  our mother-to-be
                </div>
                <div className="relative z-10 mx-auto mt-2.5 w-[min(48%,180px)] sm:mt-3 sm:w-[min(52%,200px)]">
                  <Image
                    src="/images/mom-illustration-alpha.png"
                    alt="Illustration of the expectant mother in a green saree"
                    width={300}
                    height={300}
                    className="h-auto w-full drop-shadow-[0_18px_24px_rgba(27,51,30,0.28)]"
                  />
                </div>
                <p className="relative z-10 mt-2.5 font-serif text-base italic text-green text-pretty sm:mt-3 sm:text-lg">
                  &ldquo;Bless the journey, welcome the joy.&rdquo;
                </p>
                <p className="relative z-10 mt-2 text-[13.5px] leading-relaxed text-green-ink text-pretty sm:mt-2.5 sm:text-[14.5px]">
                  Seemantham is a cherished South-Indian ritual of prayer for
                  the mother and her baby — a gathering of family and friends
                  to offer blessings, adorn her with bangles and flowers, and
                  welcome the little one on the way.
                </p>
              </Card>
            </Panel>

            {/* Panel 2 — Details */}
            <Panel>
              <Card>
                <CornerDecor corner="br" />
                <Kicker>Save the Date</Kicker>
                <LeafLine />
                <h2 className="relative z-10 text-center font-serif text-2xl font-bold text-forest sm:text-3xl">
                  Ceremony Details
                </h2>
                <div className="relative z-10 mt-3 sm:mt-4">
                  <DetailRow
                    icon={<Calendar className="h-5 w-5" />}
                    label="Date"
                    value={EVENT.dateFull}
                    sub="Evening ceremony"
                  />
                  <DetailRow
                    icon={<Clock className="h-5 w-5" />}
                    label="Time"
                    value={EVENT.time}
                    sub="Muhurtham followed by dinner"
                  />
                  <DetailRow
                    icon={<MapPin className="h-5 w-5" />}
                    label="Venue"
                    value={EVENT.venueName}
                    sub={EVENT.venueAddress}
                    last
                  >
                    <a
                      href={EVENT.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-green px-4 py-2.5 text-xs font-medium tracking-wide text-panel shadow-md transition-transform hover:-translate-y-0.5"
                    >
                      <MapPin className="h-4 w-4" />
                      Open in Google Maps
                    </a>
                  </DetailRow>
                </div>
              </Card>
            </Panel>

            {/* Panel 3 — Fun guess */}
            <Panel tall>
              <Card className="guess-card px-3.5 py-4 sm:px-8 sm:py-7">
                <Kicker>Just for fun</Kicker>
                <LeafLine />
                <h2 className="relative z-10 text-center font-serif text-xl font-bold text-forest sm:text-3xl">
                  Your Guess
                </h2>
                <p className="relative z-10 mt-1 text-center text-[12.5px] text-green-muted text-pretty sm:mt-2 sm:text-[14.5px]">
                  Boy or girl — and a name you love.
                </p>
                <GenderVote
                  onDone={() => {
                    goToPanelRef.current(3)
                  }}
                />
              </Card>
            </Panel>

            {/* Panel 4 — Blessing */}
            <Panel>
              <Card className="text-center">
                <CornerDecor corner="tl" />
                <CornerDecor corner="br" />
                <Image
                  src="/images/peacock-feather-alpha.png"
                  alt=""
                  aria-hidden="true"
                  width={64}
                  height={98}
                  className="relative z-10 mx-auto mb-1 h-16 w-auto sm:h-20"
                />
                <Kicker>With gratitude</Kicker>
                <LeafLine />
                <p className="relative z-10 font-serif text-lg italic text-green text-pretty sm:text-xl">
                  &ldquo;May the little one arrive healthy, happy &amp;
                  surrounded by love.&rdquo;
                </p>
                <p className="relative z-10 mt-3 text-[14px] text-green-muted text-pretty sm:text-[15.5px]">
                  Your presence will make this celebration even more special for
                  us.
                </p>
                <div className="relative z-10 mt-5 font-script text-3xl leading-tight text-forest sm:text-4xl">
                  <small className="mb-0.5 block font-sans text-[11px] uppercase tracking-[0.2em] text-green">
                    With love,
                  </small>
                  Monica and Satish
                </div>
                <button
                  type="button"
                  onClick={closeToCover}
                  className="relative z-10 mt-6 inline-flex items-center justify-center rounded-full border border-green/30 bg-sage-lt px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-forest transition hover:bg-sage"
                >
                  Back to cover
                </button>
              </Card>
            </Panel>
          </main>

          {/* progress dots */}
          <nav
            aria-label="Section navigation"
            className="invitation-dots z-[46] flex flex-col gap-2.5"
          >
            {Array.from({ length: PANEL_COUNT }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to section ${i + 1}`}
                aria-current={activePanel === i}
                onClick={() => goToPanel(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  activePanel === i
                    ? 'scale-150 bg-gold-lt'
                    : 'bg-panel/35 hover:bg-panel/60'
                }`}
              />
            ))}
          </nav>
        </>
      )}
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  sub,
  children,
  last,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  children?: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      className={`flex items-start gap-3 py-3 sm:gap-3.5 sm:py-4 ${
        last ? '' : 'border-b border-dashed border-border'
      }`}
    >
      <div className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-sage text-forest sm:h-10 sm:w-10">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.16em] text-green sm:text-[10.5px]">
          {label}
        </div>
        <div className="font-serif text-lg font-semibold leading-snug text-forest sm:text-xl">
          {value}
          <span className="block font-sans text-[12px] font-normal text-green-muted sm:text-[12.5px]">
            {sub}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
