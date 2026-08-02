const PETAL_COLORS = [
  '#3f6b45',
  '#d8b869',
  '#b08a37',
  '#cfe0c9',
  '#e3b0a4',
  '#f6f2e4',
]

/**
 * Bursts a shower of falling flower petals from the top of the screen.
 * Appends to the #confetti layer if present. Respects reduced-motion.
 */
export function burstConfetti(count = 40) {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const box = document.getElementById('confetti')
  if (!box) return

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span')
    p.className = 'petal'
    const size = 6 + Math.random() * 10
    p.style.left = `${Math.random() * 100}vw`
    p.style.width = `${size}px`
    p.style.height = `${size}px`
    p.style.background =
      PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
    const dur = 4 + Math.random() * 4
    p.style.animationDuration = `${dur}s`
    p.style.animationDelay = `${Math.random() * 0.6}s`
    box.appendChild(p)
    window.setTimeout(() => p.remove(), (dur + 1) * 1000)
  }
}
