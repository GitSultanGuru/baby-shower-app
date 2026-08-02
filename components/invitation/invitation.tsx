'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { burstConfetti } from '@/lib/confetti'
import { EVENT } from '@/lib/event'
import { CornerDecor } from './corner-decor'
import { GenderVote } from './gender-vote'

/* ---------- small presentational helpers ---------- */

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 text-center text-[10.5px] font-medium uppercase tracking-[0.32em] text-green">
      {children}
    </div>
  )
}

function LeafLine() {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 mx-auto my-3.5 flex w-full max-w-[180px] items-center justify-center gap-2.5 text-gold"
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
      className={`reveal relative w-full max-w-[520px] overflow-hidden rounded-3xl bg-panel-2 px-6 py-9 shadow-[0_22px_60px_-24px_rgba(15,32,18,0.75)] outline outline-1 outline-offset-4 outline-gold/40 sm:px-8 ${className}`}
    >
      {children}
    </div>
  )
}

/* ---------- main component ---------- */

export function Invitation() {
  const [opened, setOpened] = useState(false)
  const [activePanel, setActivePanel] = useState(0)

  const deckRef = useRef<HTMLElement>(null)

  // Reveal-on-scroll + progress dots
  useEffect(() => {
    if (!opened) return
    const deck = deckRef.current
    if (!deck) return

    const reveals = deck.querySelectorAll<HTMLElement>('.reveal')
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in')
        })
      },
      { threshold: 0.2 },
    )
    reveals.forEach((r) => revealObserver.observe(r))
    reveals[0]?.classList.add('in')

    const panels = Array.from(
      deck.querySelectorAll<HTMLElement>('[data-panel]'),
    )
    const panelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = panels.indexOf(e.target as HTMLElement)
            if (idx >= 0) setActivePanel(idx)
          }
        })
      },
      { threshold: 0.6, root: deck },
    )
    panels.forEach((p) => panelObserver.observe(p))

    return () => {
      revealObserver.disconnect()
      panelObserver.disconnect()
    }
  }, [opened])

  function open() {
    setOpened(true)
    burstConfetti(70)
  }

  function goToPanel(i: number) {
    const deck = deckRef.current
    if (!deck) return
    const panels = deck.querySelectorAll<HTMLElement>('[data-panel]')
    panels[i]?.scrollIntoView({ behavior: 'smooth' })
  }

  const PANEL_COUNT = 4

  return (
    <div className="relative min-h-[100dvh]">
      {/* confetti layer */}
      <div
        id="confetti"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      />

      {/* gold viewport frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-2.5 z-[45] rounded-2xl border border-gold/50 shadow-[inset_0_0_0_6px_rgba(41,74,44,0.35)] sm:inset-3"
      />

      {/* ================= COVER ================= */}
      {!opened && (
        <div
          role="dialog"
          aria-label="Open your invitation"
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
        >
          <div className="cover-rise relative w-[min(92vw,430px)] overflow-hidden rounded-3xl bg-panel-2 px-8 py-10 text-center shadow-[0_22px_60px_-24px_rgba(15,32,18,0.75)] outline outline-1 outline-offset-8 outline-gold/50">
            <CornerDecor corner="tl" />
            <CornerDecor corner="br" />

            <Image
              src="/images/peacock-feather-alpha.png"
              alt="Peacock feather"
              width={72}
              height={110}
              className="relative z-10 mx-auto mb-1 h-24 w-auto"
              priority
            />
            <div className="relative z-10 font-script-alt text-2xl font-semibold text-green">
              With joyful hearts,
            </div>
            <div className="relative z-10 mt-2 font-script text-5xl leading-none text-green">
              {EVENT.coupleNames}
              <span className="align-super text-3xl">&apos;s</span>
            </div>
            <div className="relative z-10 mt-2 font-telugu text-5xl leading-none text-forest">
              {EVENT.teluguTitle}
            </div>
            <div className="relative z-10 mt-1 font-serif text-[17px] italic text-green-ink">
              along with the{' '}
              <b className="font-bold not-italic">{EVENT.family}</b>
            </div>
            <LeafLine />
            <div className="relative z-10 text-[11.5px] uppercase tracking-[0.22em] text-green">
              warmly invite you to her baby shower
            </div>

            <button
              type="button"
              onClick={open}
              className="relative z-10 mt-6 inline-flex items-center gap-2.5 rounded-full bg-green px-8 py-3.5 text-[12.5px] font-medium uppercase tracking-[0.14em] text-panel shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-gold-lt shadow-[0_0_0_4px_rgba(216,184,105,0.3)]"
                aria-hidden="true"
              />
              Open Invitation
            </button>
            <div className="relative z-10 mt-3.5 text-[10.5px] uppercase tracking-[0.14em] text-green/70">
              Tap to unfold &amp; scroll through
            </div>
          </div>
        </div>
      )}

      {/* ================= DECK ================= */}
      {opened && (
        <>
          <main
            ref={deckRef}
            aria-label="Seemantham invitation"
            className="relative z-10 h-[100dvh] snap-y snap-mandatory overflow-y-auto scroll-smooth"
          >
            {/* Panel 1 — Mother-to-be & tradition */}
            <section
              data-panel
              className="relative flex min-h-[100dvh] snap-start snap-always items-center justify-center px-5 py-14"
            >
              <Card className="bg-sage text-center">
                <CornerDecor corner="tl" />
                <CornerDecor corner="br" />
                <Kicker>Celebrating</Kicker>
                <div className="relative z-10 mt-1 text-center font-script text-5xl leading-none text-forest">
                  {EVENT.coupleNames}
                </div>
                <div className="relative z-10 mt-1.5 text-center font-serif text-lg italic text-green">
                  our mother-to-be
                </div>
                <div className="relative z-10 mx-auto mt-3 w-[min(52%,200px)]">
                  <Image
                    src="/images/mom-illustration-alpha.png"
                    alt="Illustration of the expectant mother in a green saree"
                    width={300}
                    height={300}
                    className="h-auto w-full drop-shadow-[0_18px_24px_rgba(27,51,30,0.28)]"
                  />
                </div>
                <p className="relative z-10 mt-3 font-serif text-lg italic text-green text-pretty">
                  &ldquo;Bless the journey, welcome the joy.&rdquo;
                </p>
                <p className="relative z-10 mt-2.5 text-[14.5px] leading-relaxed text-green-ink text-pretty">
                  Seemantham is a cherished South-Indian ritual of prayer for
                  the mother and her baby — a gathering of family and friends
                  to offer blessings, adorn her with bangles and flowers, and
                  welcome the little one on the way.
                </p>
              </Card>
              <div className="scroll-cue absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-panel/85">
                <span>Scroll</span>
                <span aria-hidden="true">↓</span>
              </div>
            </section>

            {/* Panel 2 — Details */}
            <section
              data-panel
              className="relative flex min-h-[100dvh] snap-start snap-always items-center justify-center px-5 py-14"
            >
              <Card>
                <CornerDecor corner="br" />
                <Kicker>Save the Date</Kicker>
                <LeafLine />
                <h2 className="relative z-10 text-center font-serif text-3xl font-bold text-forest">
                  Ceremony Details
                </h2>
                <div className="relative z-10 mt-4">
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
            </section>

            {/* Panel 3 — Fun guess */}
            <section
              data-panel
              className="relative flex min-h-[100dvh] snap-start snap-always items-center justify-center px-5 py-10"
            >
              <Card className="py-7">
                <Kicker>Just for fun</Kicker>
                <LeafLine />
                <h2 className="relative z-10 text-center font-serif text-3xl font-bold text-forest">
                  Guess &amp; name the little one
                </h2>
                <p className="relative z-10 mt-2 text-center text-[14.5px] text-green-muted text-pretty">
                  Share your heart&apos;s guess, a name you love, and what it
                  means.
                </p>
                <GenderVote />
              </Card>
            </section>

            {/* Panel 4 — Blessing */}
            <section
              data-panel
              className="relative flex min-h-[100dvh] snap-start snap-always items-center justify-center px-5 py-14"
            >
              <Card className="text-center">
                <CornerDecor corner="tl" />
                <CornerDecor corner="br" />
                <Image
                  src="/images/peacock-feather-alpha.png"
                  alt=""
                  aria-hidden="true"
                  width={64}
                  height={98}
                  className="relative z-10 mx-auto mb-1 h-20 w-auto"
                />
                <Kicker>With gratitude</Kicker>
                <LeafLine />
                <p className="relative z-10 font-serif text-xl italic text-green text-pretty">
                  &ldquo;May the little one arrive healthy, happy &amp;
                  surrounded by love.&rdquo;
                </p>
                <p className="relative z-10 mt-3 text-[15.5px] text-green-muted text-pretty">
                  Your presence will make this celebration even more special for
                  us.
                </p>
                <div className="relative z-10 mt-5 font-script text-4xl leading-tight text-forest">
                  <small className="mb-0.5 block font-sans text-[11px] uppercase tracking-[0.2em] text-green">
                    With love,
                  </small>
                  Monica and Satish
                </div>
              </Card>
            </section>
          </main>

          {/* progress dots */}
          <nav
            aria-label="Section navigation"
            className="fixed right-2.5 top-1/2 z-[46] flex -translate-y-1/2 flex-col gap-2.5 sm:right-4"
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
      className={`flex items-start gap-3.5 py-4 ${
        last ? '' : 'border-b border-dashed border-border'
      }`}
    >
      <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-sage text-forest">
        {icon}
      </div>
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.16em] text-green">
          {label}
        </div>
        <div className="font-serif text-xl font-semibold leading-snug text-forest">
          {value}
          <span className="block font-sans text-[12.5px] font-normal text-green-muted">
            {sub}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
