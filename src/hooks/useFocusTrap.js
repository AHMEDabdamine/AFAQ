import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Keep Tab inside an open overlay, close it on Escape, and hand focus back to
 * whatever opened it. Returns a ref to put on the overlay container.
 *
 * Without this, tabbing out of a dialog lands on the page behind it, which is
 * both disorienting and lets keyboard users operate controls they can't see.
 */
export function useFocusTrap(active, onEscape) {
  const containerRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!active) return

    previouslyFocused.current = document.activeElement
    const container = containerRef.current
    if (!container) return

    const focusFirst = () => {
      const target =
        container.querySelector('[data-autofocus]') ||
        container.querySelector(FOCUSABLE) ||
        container
      if (target === container && !container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1')
      }
      target.focus({ preventScroll: true })
    }
    // Wait a frame so entrance animations don't fight the focus move.
    const raf = requestAnimationFrame(focusFirst)

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onEscape?.()
        return
      }
      if (e.key !== 'Tab') return

      const items = Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        el => el.offsetParent !== null || el === document.activeElement
      )
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      const restore = previouslyFocused.current
      if (restore && typeof restore.focus === 'function') {
        restore.focus({ preventScroll: true })
      }
    }
  }, [active, onEscape])

  return containerRef
}

export default useFocusTrap
