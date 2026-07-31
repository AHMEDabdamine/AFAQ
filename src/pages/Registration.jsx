import { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Send, Check, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SideImage from '../components/shared/SideImage'
import ProgresButton from '../components/registration/ProgresButton'

const spring = { type: 'spring', damping: 22, stiffness: 200 }
const fastSpring = { type: 'spring', damping: 16, stiffness: 300 }

const initialForm = {
  event_id: '',
  full_name: '',
  student_id: '',
  email: '',
  phone: '',
  department: '',
  agreed_to_policies: false,
}

export default function Registration() {
  const { t, i18n } = useTranslation('register')
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({})
  const [shaking, setShaking] = useState(null)
  const [autoFilled, setAutoFilled] = useState(false)
  const [events, setEvents] = useState([])
  const [eventsState, setEventsState] = useState('loading')

  const id = useId()
  const fieldId = (name) => `${id}-${name}`
  const errorId = (name) => `${id}-${name}-error`
  const successRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    let cancelled = false
    supabase
      .from('events')
      .select('id, title_en, title_ar, title_fr, date')
      .eq('is_published', true)
      .eq('registration_open', true)
      .gte('date', today)
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        setEvents(data || [])
        // The select used to sit empty and unexplained when this failed or
        // returned nothing.
        setEventsState(error ? 'error' : (data || []).length ? 'ready' : 'empty')
      })
    return () => { cancelled = true }
  }, [])

  // Move focus to the confirmation so the outcome is announced and keyboard
  // users aren't left where a now-removed button used to be.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  const baseDeptKeys = ['fsas', 'fnlses', 'flps', 'fecms', 'fshs', 'fll', 'istaps', 'iot', 'fes']
  const deptKeys = form.department && !baseDeptKeys.includes(form.department)
    ? [...baseDeptKeys, form.department]
    : baseDeptKeys

  const validate = () => {
    const errs = {}
    if (!form.event_id) errs.event_id = t('form.validation.required')
    if (!form.full_name.trim()) errs.full_name = t('form.validation.required')
    if (!form.email.trim()) errs.email = t('form.validation.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t('form.validation.email')
    if (!form.agreed_to_policies) errs.agreed_to_policies = t('form.validation.requiredPolicies')
    setErrors(errs)

    const firstField = Object.keys(errs)[0]
    if (firstField) {
      setShaking(firstField)
      setTimeout(() => setShaking(null), 500)
      // Send focus to the first problem rather than only shaking it.
      formRef.current
        ?.querySelector(`#${CSS.escape(fieldId(firstField))}`)
        ?.focus()
    }
    return !firstField
  }

  const autoFillFields = ['full_name', 'student_id', 'email', 'phone', 'department']

  const updateForm = (patch) => {
    // Functional update: the old version closed over a stale `form`.
    setForm(prev => ({ ...prev, ...patch }))
    setErrors(prev => {
      const next = { ...prev }
      Object.keys(patch).forEach(k => delete next[k])
      return next
    })
    if (autoFilled && Object.keys(patch).some(k => autoFillFields.includes(k))) {
      setAutoFilled(false)
    }
  }

  const handleProgresSuccess = (data) => {
    const patch = {}
    if (data.userName || data.student_id) patch.student_id = data.userName || data.student_id
    if (data.full_name) patch.full_name = data.full_name
    if (data.email) patch.email = data.email
    if (data.phone) patch.phone = data.phone
    if (data.department) patch.department = data.department
    setForm(prev => ({ ...prev, ...patch }))
    setErrors({})
    setAutoFilled(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('loading')
    const { error } = await supabase.from('event_registrations').insert([{
      event_id: form.event_id,
      full_name: form.full_name,
      student_id: form.student_id || null,
      email: form.email,
      phone: form.phone || null,
      department: form.department || null,
      agreed_to_policies: true,
    }])
    if (error) {
      console.error(error)
      setStatus('error')
    } else {
      const ev = events.find(e => e.id === form.event_id)
      const eventTitle = ev ? (ev[`title_${i18n.language}`] || ev.title_en) : ''
      const eventDate = ev?.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString() : ''
      fetch('/api/email/registration-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.full_name, event_title: eventTitle, date: eventDate }),
      }).catch(() => {})
      setStatus('success')
      setForm(initialForm)
    }
  }

  const shake = (field) => ({
    animate: { x: shaking === field ? [0, -6, 6, -6, 6, 0] : 0 },
    transition: { duration: 0.4 },
  })

  const FieldError = ({ name }) => (
    <AnimatePresence>
      {errors[name] && (
        <motion.p
          id={errorId(name)}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="field-error"
        >
          <AlertCircle size={13} aria-hidden="true" />
          {errors[name]}
        </motion.p>
      )}
    </AnimatePresence>
  )

  const inputProps = (name) => ({
    id: fieldId(name),
    className: 'form-input',
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? errorId(name) : undefined,
  })

  return (
    <div className="relative">
      <section
        className="pt-24 pb-16 md:pt-32 md:pb-20"
        style={{ background: 'var(--color-bg-alt)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* The eyebrow used to repeat the h1 verbatim. */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="eyebrow eyebrow-center mb-4"
          >
            {t('hero.eyebrow', 'Event registration')}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t('hero.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-20 -mt-12 relative z-0">
        <SideImage side="right" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-pro p-6 sm:p-8 md:p-10" style={{ transform: 'none' }}>
            {status === 'success' ? (
              <motion.div
                ref={successRef}
                tabIndex={-1}
                role="status"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.1 }}
                className="text-center py-8 outline-none"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...fastSpring, delay: 0.2 }}
                  className="inline-flex items-center justify-center mb-6"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(22, 163, 74, 0.1)',
                    color: 'var(--color-success)',
                  }}
                >
                  <Check size={36} style={{ strokeWidth: 3 }} aria-hidden="true" />
                </motion.div>
                <h2 className="text-2xl mb-3">{t('form.success')}</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  {t('form.successDetail', 'A confirmation is on its way to your inbox.')}
                </p>
              </motion.div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Offering autofill before the empty fields, where it saves work. */}
                <div className="flex flex-col items-center gap-3 pb-5 mb-1 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                  <ProgresButton onSuccess={handleProgresSuccess} />
                  <AnimatePresence>
                    {autoFilled && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="status"
                        className="text-sm text-center flex items-center gap-1.5"
                        style={{ color: 'var(--color-success)' }}
                      >
                        <Check size={14} aria-hidden="true" />
                        {t('form.autoFilled', 'Filled from your Progres account. Check it over before you register.')}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="form-label" htmlFor={fieldId('event_id')}>
                    {t('form.event')} <span className="required" aria-hidden="true">*</span>
                  </label>
                  <motion.div {...shake('event_id')}>
                    <select
                      {...inputProps('event_id')}
                      required
                      value={form.event_id}
                      onChange={e => updateForm({ event_id: e.target.value })}
                      disabled={eventsState !== 'ready'}
                    >
                      <option value="">
                        {eventsState === 'loading'
                          ? t('form.loadingEvents', 'Loading events…')
                          : eventsState === 'empty'
                          ? t('form.noEvents', 'No events are open for registration')
                          : eventsState === 'error'
                          ? t('form.eventsError', 'Events could not be loaded')
                          : t('form.selectEvent')}
                      </option>
                      {events.map(e => {
                        const title = e[`title_${i18n.language}`] || e.title_en || ''
                        const d = e.date ? new Date(e.date + 'T00:00:00').toLocaleDateString() : ''
                        return (
                          <option key={e.id} value={e.id}>
                            {title}{d ? ` (${d})` : ''}
                          </option>
                        )
                      })}
                    </select>
                  </motion.div>
                  <FieldError name="event_id" />
                </div>

                <div>
                  <label className="form-label" htmlFor={fieldId('full_name')}>
                    {t('form.fullName')} <span className="required" aria-hidden="true">*</span>
                  </label>
                  <motion.div {...shake('full_name')}>
                    <input
                      {...inputProps('full_name')}
                      required
                      autoComplete="name"
                      value={form.full_name}
                      onChange={e => updateForm({ full_name: e.target.value })}
                      placeholder="Ahmed Mansouri"
                    />
                  </motion.div>
                  <FieldError name="full_name" />
                </div>

                <div>
                  <label className="form-label" htmlFor={fieldId('student_id')}>
                    {t('form.studentId')}
                  </label>
                  <input
                    {...inputProps('student_id')}
                    value={form.student_id}
                    onChange={e => updateForm({ student_id: e.target.value })}
                    placeholder="2024XXXXX"
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor={fieldId('email')}>
                    {t('form.email')} <span className="required" aria-hidden="true">*</span>
                  </label>
                  <motion.div {...shake('email')}>
                    <input
                      {...inputProps('email')}
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      value={form.email}
                      onChange={e => updateForm({ email: e.target.value })}
                      placeholder="ahmed@univ-bouira.dz"
                    />
                  </motion.div>
                  <FieldError name="email" />
                </div>

                <div>
                  <label className="form-label" htmlFor={fieldId('phone')}>
                    {t('form.phone')}
                  </label>
                  <input
                    {...inputProps('phone')}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={e => updateForm({ phone: e.target.value })}
                    placeholder="+213 6XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor={fieldId('department')}>
                    {t('form.department')}
                  </label>
                  <select
                    {...inputProps('department')}
                    value={form.department}
                    onChange={e => updateForm({ department: e.target.value })}
                  >
                    <option value="">{t('form.selectDepartment')}</option>
                    {deptKeys.map(key => (
                      <option key={key} value={key}>{t(`departments.${key}`)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <motion.div {...shake('agreed_to_policies')} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={fieldId('agreed_to_policies')}
                      checked={form.agreed_to_policies}
                      onChange={e => updateForm({ agreed_to_policies: e.target.checked })}
                      aria-invalid={errors.agreed_to_policies ? true : undefined}
                      aria-describedby={errors.agreed_to_policies ? errorId('agreed_to_policies') : undefined}
                      style={{
                        marginTop: 2,
                        width: 18,
                        height: 18,
                        accentColor: 'var(--color-accent)',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <label
                      htmlFor={fieldId('agreed_to_policies')}
                      className="text-sm"
                      style={{ color: 'var(--color-text)', cursor: 'pointer', lineHeight: 1.5 }}
                    >
                      {t('form.policies')}
                    </label>
                  </motion.div>
                  <FieldError name="agreed_to_policies" />
                </div>

                <AnimatePresence>
                  {status === 'error' && (
                    <motion.p
                      role="alert"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="field-error justify-center"
                      style={{ paddingInlineStart: 0 }}
                    >
                      <AlertCircle size={14} aria-hidden="true" />
                      {t('form.error')}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn btn-accent btn-lg w-full"
                >
                  {status === 'loading'
                    ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    : <Send size={15} aria-hidden="true" />}
                  {status === 'loading' ? t('form.submitting') : t('form.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
