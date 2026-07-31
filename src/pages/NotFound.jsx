import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '../components/shared/Button'

/**
 * A dead end should still point somewhere. Rather than an apology, this names
 * what happened and offers the three places people actually came looking for.
 */
export default function NotFound() {
  const { t } = useTranslation()

  const destinations = [
    { key: 'projects', path: '/projects' },
    { key: 'events', path: '/events' },
    { key: 'contact', path: '/contact' },
  ]

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-20 min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 130 }}
        >
          <p
            className="mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(72px, 18vw, 148px)',
              lineHeight: 1,
              color: 'var(--color-accent)',
            }}
            aria-hidden="true"
          >
            404
          </p>

          <h1 className="text-2xl md:text-4xl mb-4">
            {t('notFound.title', 'This page is not here')}
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed mb-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t(
              'notFound.body',
              'The link may be out of date, or the page may have moved. Here is where to go next.'
            )}
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Button to="/" variant="primary" icon="arrow">
              {t('notFound.home', 'Back to home')}
            </Button>
          </div>

          <ul className="flex flex-wrap gap-2 justify-center list-none p-0 m-0">
            {destinations.map(d => (
              <li key={d.key}>
                <Link to={d.path} className="pill">
                  {t(`nav.${d.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
