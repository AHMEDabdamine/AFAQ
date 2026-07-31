import { useEffect } from 'react'
import { useLenis } from 'lenis/react'

/**
 * Freeze page scrolling while an overlay is open.
 *
 * Setting `body { overflow: hidden }` alone is not enough here: Lenis drives
 * scrolling with its own RAF loop and keeps going underneath the overlay, so
 * the page scrolled behind open dialogs. Stop the instance too.
 *
 * Also compensates for the scrollbar so the layout doesn't jump on lock.
 */
export function useScrollLock(active) {
  const lenis = useLenis()

  useEffect(() => {
    if (!active) return

    const { body, documentElement: html } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingInlineEnd
    const scrollbar = window.innerWidth - html.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingInlineEnd = `${scrollbar}px`
    lenis?.stop()

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingInlineEnd = previousPadding
      lenis?.start()
    }
  }, [active, lenis])
}

export default useScrollLock
