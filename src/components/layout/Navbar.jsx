import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import LanguageSwitcher from '../shared/LanguageSwitcher'
import ThemeToggle from '../shared/ThemeToggle'
import Logo from '../shared/Logo'
import useScrollLock from '../../hooks/useScrollLock'
import useFocusTrap from '../../hooks/useFocusTrap'

const sidebarSpring = { type: 'spring', damping: 28, stiffness: 200 }
const linkVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { ...sidebarSpring, delay: 0.1 + i * 0.04 } }),
}

// "Join" is the call to action in the bar, so it isn't repeated in the link
// row; the drawer shows it once, as a button at the end.
const navLinks = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'projects', path: '/projects' },
  { key: 'events', path: '/events' },
  { key: 'gallery', path: '/gallery' },
  { key: 'announcements', path: '/announcements' },
  { key: 'contact', path: '/contact' },
]

export default function Navbar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useScrollLock(mobileOpen)
  const drawerRef = useFocusTrap(mobileOpen, closeMobile)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
      style={{
        background: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border-light)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label={t('nav.home')}
          >
            <div className="transition-transform duration-300 group-hover:scale-105">
              <Logo size={36} decorative />
            </div>
            <span
              className="text-lg tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
            >
              AFAQ
            </span>
          </Link>

          {/* Seven links don't fit beside the logo and CTA until ~1024px, so the
              full row starts at lg and the drawer covers everything below. */}
          <nav className="hidden lg:flex items-center" aria-label={t('nav.primary', 'Main')}>
            {navLinks.map(l => (
              <NavLink
                key={l.key}
                to={l.path}
                end={l.path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {t(`nav.${l.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link to="/join" className="hidden sm:inline-flex btn btn-primary btn-sm">
              {t('nav.join')}
            </Link>
            <button
              type="button"
              className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              onClick={() => setMobileOpen(true)}
              aria-label={t('nav.openMenu', 'Open menu')}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={closeMobile}
              aria-hidden="true"
            />
            <motion.div
              ref={drawerRef}
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.menu', 'Menu')}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={sidebarSpring}
              className="fixed top-0 end-0 h-full w-[290px] max-w-[85vw] z-50 shadow-2xl lg:hidden overflow-y-auto"
              style={{ background: 'var(--color-card)', borderInlineStart: '1px solid var(--color-border-light)' }}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                <div className="flex items-center gap-2">
                  <Logo size={32} decorative />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>AFAQ</span>
                </div>
                <button
                  type="button"
                  className="w-11 h-11 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 cursor-pointer"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={closeMobile}
                  aria-label={t('nav.closeMenu', 'Close menu')}
                  data-autofocus
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <nav className="flex flex-col p-4 gap-1" aria-label={t('nav.primary', 'Main')}>
                {navLinks.map((l, i) => (
                  <motion.div key={l.key} custom={i} variants={linkVariants} initial="hidden" animate="visible">
                    <NavLink
                      to={l.path}
                      end={l.path === '/'}
                      className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                      style={({ isActive }) => ({
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        background: isActive ? 'var(--color-accent-soft)' : 'transparent',
                      })}
                    >
                      {t(`nav.${l.key}`)}
                    </NavLink>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...sidebarSpring, delay: 0.35 }}
                  className="mt-4 pt-4 border-t"
                  style={{ borderColor: 'var(--color-border-light)' }}
                >
                  <Link to="/join" className="btn btn-primary btn-md w-full">
                    {t('nav.join')}
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
