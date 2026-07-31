import { motion } from 'framer-motion'

/**
 * Section heading. The display face has a single weight, so no `font-bold`
 * here - asking for 700 only made the browser smear a synthetic bold over a
 * pixel font.
 */
export default function SectionHeader({ title, subtitle, light = false, center = true, eyebrow }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ type: 'spring', damping: 28, stiffness: 120 }}
      className={`mb-10 md:mb-14 relative ${center ? 'text-center' : ''}`}
    >
      {eyebrow && (
        <div className={`eyebrow mb-4 ${center ? 'eyebrow-center' : ''}`}>
          {eyebrow}
        </div>
      )}

      <h2
        className="text-3xl md:text-4xl lg:text-5xl"
        style={{ color: light ? '#fff' : 'var(--color-text)' }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mt-4 text-base md:text-lg max-w-2xl leading-relaxed"
          style={{
            color: light ? 'rgba(255,255,255,0.78)' : 'var(--color-text-muted)',
            marginInline: center ? 'auto' : undefined,
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
