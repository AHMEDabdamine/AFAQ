import { useCallback, useEffect, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'afaq-theme'

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readInitial() {
  if (typeof window === 'undefined') return 'light'
  // index.html already resolved this before first paint; trust the attribute
  // so the hook can never disagree with what's on screen.
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return systemTheme()
}

/* A single source of truth. Per-component useState would let the toggle and
   the logo drift apart the moment one of them re-rendered. */
let current = readInitial()
const listeners = new Set()

function emit() {
  listeners.forEach(fn => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setTheme(next) {
  if (next === current) return
  current = next
  document.documentElement.setAttribute('data-theme', next)
  emit()
}

/**
 * Light/dark with an explicit user choice.
 *
 * The previous implementation was a stub that always reported light while a
 * `prefers-color-scheme` block quietly rewrote half the palette, so dark-OS
 * visitors got a half-inverted site they couldn't opt out of. Now the choice
 * is stored, and the OS only supplies the default.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => current, () => 'light')

  // Follow the OS until the visitor expresses a preference of their own.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) setTheme(e.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next = current === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }, [])

  return { theme, toggle, isDark: theme === 'dark' }
}

export default useTheme
