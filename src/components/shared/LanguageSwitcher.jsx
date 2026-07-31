import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ar', label: 'AR', name: 'العربية' },
]

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const current =
    languages.find(l => l.code === i18n.resolvedLanguage) ||
    languages.find(l => l.code === i18n.language) ||
    languages[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  // Move focus into the menu when it opens so keyboard users aren't stranded.
  useEffect(() => {
    if (open) menuRef.current?.querySelector('button')?.focus()
  }, [open])

  const close = useCallback((returnFocus = true) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  const switchLang = useCallback((code) => {
    // i18n's languageChanged handler owns dir/lang on <html>.
    i18n.changeLanguage(code)
    close()
  }, [i18n, close])

  const onMenuKeyDown = (e) => {
    const items = Array.from(menuRef.current?.querySelectorAll('button') || [])
    const index = items.indexOf(document.activeElement)
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(index + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(index - 1 + items.length) % items.length]?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true) }
        }}
        className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:brightness-95 active:brightness-90"
        style={{
          background: 'var(--color-bg-alt)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('nav.language', 'Language')}: ${current.name}`}
      >
        <Globe size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={t('nav.language', 'Language')}
          onKeyDown={onMenuKeyDown}
          className="absolute top-full mt-1 end-0 overflow-hidden z-50"
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 13,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 150,
          }}
        >
          {languages.map(l => {
            const active = l.code === current.code
            return (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                lang={l.code}
                onClick={() => switchLang(l.code)}
                className="w-full text-start px-4 py-2.5 flex items-center gap-2 hover:bg-black/5 active:bg-black/10 cursor-pointer"
                style={{
                  fontSize: 14,
                  color: active ? 'var(--color-accent)' : 'var(--color-text)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    opacity: 0.75,
                    minWidth: 20,
                  }}
                >
                  {l.label}
                </span>
                <span style={{ flex: 1 }}>{l.name}</span>
                {active && <Check size={14} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
