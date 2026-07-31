import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Shown while a route's chunk downloads.
 *
 * It stays blank for the first moment: on a fast connection the chunk arrives
 * in well under 300ms, and flashing a spinner for two frames reads as jank
 * rather than progress.
 */
export default function RouteFallback() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: '60vh' }}
      role="status"
      aria-live="polite"
    >
      {visible && (
        <span
          className="text-sm"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {t('loading', 'Loading…')}
        </span>
      )}
    </div>
  )
}
