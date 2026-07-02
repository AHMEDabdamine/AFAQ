import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'

const languages = [
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'ar', label: 'AR', flag: '🇩🇿', name: 'العربية' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const switchLang = useCallback((code) => {
    i18n.changeLanguage(code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
    setOpen(false)
  }, [i18n])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:brightness-95 active:brightness-90"
        style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <Globe size={16} />
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 end-0 overflow-hidden z-50"
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 13,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 140,
          }}
        >
          {languages.map(l => {
            const active = l.code === i18n.language
            return (
              <button
                key={l.code}
                onClick={() => switchLang(l.code)}
                className="w-full text-start px-4 py-2.5 flex items-center gap-2 hover:bg-black/5 active:bg-black/10"
                style={{
                  fontSize: 14,
                  color: active ? 'var(--color-accent)' : 'var(--color-text)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span>{l.flag}</span>
                <span style={{ flex: 1 }}>{l.name}</span>
                {active && <Check size={14} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
