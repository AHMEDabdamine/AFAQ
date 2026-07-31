import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './Navbar'
import Footer from './Footer'
import SmoothScroll from '../shared/SmoothScroll'
import ScrollToTop from '../shared/ScrollToTop'

export default function Layout() {
  const { t } = useTranslation()

  return (
    <SmoothScroll>
      {/* Inside the Lenis provider, so it can reset Lenis's own scroll
          position rather than only the window's. */}
      <ScrollToTop />

      <a className="skip-link" href="#main">
        {t('nav.skipToContent', 'Skip to content')}
      </a>

      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      >
        <Navbar />
        {/* Pages own their own clearance under the fixed header (pt-24/md:pt-32),
            and the home hero is deliberately full-bleed, so no padding here. */}
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  )
}
