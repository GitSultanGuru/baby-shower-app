'use client'

import { useEffect } from 'react'

/**
 * Keeps --app-height / --app-top in sync with the visual viewport.
 * Fixes iOS Safari / Chrome Android address-bar and keyboard resizing.
 */
export function useMobileViewport() {
  useEffect(() => {
    const root = document.documentElement

    const sync = () => {
      const vv = window.visualViewport
      const height = Math.round(vv?.height ?? window.innerHeight)
      const top = Math.round(vv?.offsetTop ?? 0)
      root.style.setProperty('--app-height', `${height}px`)
      root.style.setProperty('--app-top', `${top}px`)
    }

    sync()

    const vv = window.visualViewport
    vv?.addEventListener('resize', sync)
    vv?.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)

    // iOS sometimes reports the old size until after orientation settles
    const onOrientation = () => {
      window.setTimeout(sync, 250)
      window.setTimeout(sync, 600)
    }
    window.addEventListener('orientationchange', onOrientation)

    return () => {
      vv?.removeEventListener('resize', sync)
      vv?.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.removeEventListener('orientationchange', onOrientation)
    }
  }, [])
}
