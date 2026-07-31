import { useTranslation } from 'react-i18next'
import { Sun, Moon } from 'lucide-react'
import useTheme from '../../hooks/useTheme'

/**
 * Reads as a power switch for the board: the icon shows the theme you'd get by
 * pressing it, and the label says so out loud.
 */
export default function ThemeToggle() {
  const { t } = useTranslation()
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-pressed={isDark}
      aria-label={
        isDark
          ? t('nav.themeLight', 'Switch to light theme')
          : t('nav.themeDark', 'Switch to dark theme')
      }
      title={
        isDark
          ? t('nav.themeLight', 'Switch to light theme')
          : t('nav.themeDark', 'Switch to dark theme')
      }
    >
      {isDark
        ? <Sun size={16} aria-hidden="true" />
        : <Moon size={16} aria-hidden="true" />}
    </button>
  )
}
