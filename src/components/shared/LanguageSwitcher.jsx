import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ar', label: 'AR', name: 'العربية' },
]

/* Detection can hand back a regional code — `fr-FR`, `ar-DZ` — so comparing it
   against a bare 'fr' never matched and no entry was ever marked as current.
   Normalising here keeps the fix inside this component. */
const baseCode = value => (value || 'en').split('-')[0].toLowerCase()

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const current =
    languages.find(l => l.code === baseCode(i18n.resolvedLanguage || i18n.language)) || languages[0]

  useEffect(() => {
    if (!open) return

    const onPointerDown = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    // Tabbing out of the menu should close it, not strand it open on screen.
    const onFocusIn = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [open])

  useEffect(() => {
    if (open) menuRef.current?.querySelector('[data-current="true"], button')?.focus()
  }, [open])

  const switchLang = useCallback(
    code => {
      i18n.changeLanguage(code)
      document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = code
      setOpen(false)
      buttonRef.current?.focus()
    },
    [i18n]
  )

  return (
    <div className="relative" ref={ref}>
      {/* The trigger names the language you are in. It used to be a bare globe,
          so the only way to find out was to open the menu. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Language: ${current.name}. Change language`}
        className="lang-trigger"
      >
        <span aria-hidden="true">{current.label}</span>
        <ChevronDown
          size={13}
          aria-hidden="true"
          style={{
            transition: 'transform 0.18s ease',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      {open && (
        <div ref={menuRef} role="menu" aria-label="Language" className="lang-menu">
          {languages.map(l => {
            const active = l.code === current.code
            return (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                data-current={active || undefined}
                onClick={() => switchLang(l.code)}
                className="lang-option"
                lang={l.code}
              >
                <span className="lang-option-code" aria-hidden="true">{l.label}</span>
                <span style={{ flex: 1, textAlign: 'start' }}>{l.name}</span>
                {active && <Check size={14} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
