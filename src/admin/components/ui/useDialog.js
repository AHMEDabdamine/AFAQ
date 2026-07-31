import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',')

// Nested dialogs (confirm on top of a form modal) must not fight over the
// scroll lock — count depth and release only when the last one closes.
let lockDepth = 0

/**
 * Dialog behaviour every overlay in the console shares: escape closes, focus
 * moves in and stays in, focus returns to whatever opened it, and the page
 * behind stops scrolling. None of this existed before.
 */
export function useDialog(open, onClose) {
  const ref = useRef(null)
  const restoreTo = useRef(null)

  // Callers pass an inline arrow, so `onClose` is a new function on every
  // render. Holding it in a ref keeps the effect keyed on `open` alone —
  // otherwise each parent render tore the dialog down and re-focused the first
  // field, stealing the cursor mid-sentence.
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose })

  useEffect(() => {
    if (!open) return

    restoreTo.current = document.activeElement

    lockDepth += 1
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus the first meaningful control, not the close button.
    const raf = requestAnimationFrame(() => {
      const node = ref.current
      if (!node) return
      const targets = node.querySelectorAll(FOCUSABLE)
      const preferred = [...targets].find(el => !el.hasAttribute('data-dialog-dismiss'))
      ;(preferred || targets[0] || node).focus({ preventScroll: true })
    })

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeRef.current?.()
        return
      }
      if (event.key !== 'Tab' || !ref.current) return

      const targets = [...ref.current.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null)
      if (!targets.length) return
      const first = targets[0]
      const last = targets[targets.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown, true)
      lockDepth = Math.max(0, lockDepth - 1)
      if (lockDepth === 0) document.body.style.overflow = previousOverflow
      const target = restoreTo.current
      if (target && document.contains(target)) target.focus({ preventScroll: true })
    }
  }, [open])

  return ref
}
