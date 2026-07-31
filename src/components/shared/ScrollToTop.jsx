import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLenis } from 'lenis/react'

/**
 * Reset scroll on navigation.
 *
 * `window.scrollTo` alone doesn't do it while Lenis is running - Lenis keeps
 * its own scroll position and immediately restores it, so pages opened from
 * halfway down the previous page started halfway down.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    // An in-page anchor is a deliberate destination; don't fight it.
    if (hash) return
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash, lenis])

  return null
}
