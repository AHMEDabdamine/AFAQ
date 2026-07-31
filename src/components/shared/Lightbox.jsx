import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import useScrollLock from '../../hooks/useScrollLock'
import useFocusTrap from '../../hooks/useFocusTrap'

export default function Lightbox({ images, currentIndex, onClose, onPrev, onNext, captions }) {
  const { t, i18n } = useTranslation('gallery')
  const isRTL = i18n.dir() === 'rtl'
  const total = images.length

  useScrollLock(true)
  const dialogRef = useFocusTrap(true, onClose)

  // In RTL the visual "next" sits to the left, so the arrow keys swap with it.
  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowLeft') (isRTL ? onNext : onPrev)?.()
    if (e.key === 'ArrowRight') (isRTL ? onPrev : onNext)?.()
  }, [isRTL, onPrev, onNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const navButton = 'absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-colors bg-white/10 text-white/85 hover:bg-white/25 hover:text-white cursor-pointer'

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('lightbox.label', 'Image viewer')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="on-dark fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        data-autofocus
        className="absolute top-4 end-4 z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-colors bg-white/10 text-white/85 hover:bg-white/25 hover:text-white cursor-pointer"
        aria-label={t('lightbox.close', 'Close')}
      >
        <X size={22} aria-hidden="true" />
      </button>

      {onPrev && total > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className={`${navButton} start-4`}
          aria-label={t('lightbox.previous', 'Previous image')}
        >
          {isRTL ? <ChevronRight size={22} aria-hidden="true" /> : <ChevronLeft size={22} aria-hidden="true" />}
        </button>
      )}

      {onNext && total > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className={`${navButton} end-4`}
          aria-label={t('lightbox.next', 'Next image')}
        >
          {isRTL ? <ChevronLeft size={22} aria-hidden="true" /> : <ChevronRight size={22} aria-hidden="true" />}
        </button>
      )}

      <motion.img
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        src={images[currentIndex]}
        alt={captions?.[currentIndex] || ''}
        className="max-w-full max-h-[82vh] object-contain"
        onClick={e => e.stopPropagation()}
        style={{ borderRadius: 14 }}
      />

      {total > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: 'rgba(0,0,0,0.55)',
            color: 'rgba(255,255,255,0.9)',
            fontFamily: 'var(--font-mono)',
          }}
          aria-live="polite"
        >
          {currentIndex + 1} / {total}
        </div>
      )}
    </motion.div>
  )
}
