import { useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

/*
  Shared fields for the public forms.

  The three forms each hand-rolled their own inputs, and two of them styled
  focus with inline onFocus/onBlur handlers. That had a real cost: blurring a
  field reset its border to the neutral colour, so the red outline on an invalid
  field disappeared the moment you clicked away. Focus and error states belong
  in CSS (.form-input / .form-input.error), which is what these use.

  Labels are tied to their control with a real id, so tapping a label focuses
  the field, and errors are announced rather than just coloured.
*/

export function Field({ label, htmlFor, required, error, hint, shake, children }) {
  return (
    <div>
      {label && (
        <label className="pf-label" htmlFor={htmlFor}>
          {label}
          {required && <span aria-hidden="true" style={{ color: '#EF4444' }}> *</span>}
        </label>
      )}
      <motion.div animate={{ x: shake ? [0, -6, 6, -6, 6, 0] : 0 }} transition={{ duration: 0.4 }}>
        {children}
      </motion.div>
      <FieldMessage id={htmlFor && `${htmlFor}-msg`} error={error} hint={hint} />
    </div>
  )
}

export function FieldMessage({ id, error, hint }) {
  return (
    <AnimatePresence mode="wait">
      {error ? (
        <motion.p
          key="error"
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pf-error"
        >
          <AlertCircle size={13} aria-hidden="true" /> {error}
        </motion.p>
      ) : hint ? (
        <p key="hint" id={id} className="pf-hint">{hint}</p>
      ) : null}
    </AnimatePresence>
  )
}

/** Wires id, aria-invalid and aria-describedby so the three stay in step. */
function useFieldA11y(error, hint) {
  const id = useId()
  return {
    id,
    describedBy: error || hint ? `${id}-msg` : undefined,
  }
}

export function TextField({ label, required, error, hint, shake, ...input }) {
  const { id, describedBy } = useFieldA11y(error, hint)
  return (
    <Field label={label} htmlFor={id} required={required} error={error} hint={hint} shake={shake}>
      <input
        id={id}
        className={`form-input ${error ? 'error' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...input}
      />
    </Field>
  )
}

export function SelectField({ label, required, error, hint, shake, children, ...select }) {
  const { id, describedBy } = useFieldA11y(error, hint)
  return (
    <Field label={label} htmlFor={id} required={required} error={error} hint={hint} shake={shake}>
      <select
        id={id}
        className={`form-input ${error ? 'error' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...select}
      >
        {children}
      </select>
    </Field>
  )
}

export function TextAreaField({ label, required, error, hint, shake, ...textarea }) {
  const { id, describedBy } = useFieldA11y(error, hint)
  return (
    <Field label={label} htmlFor={id} required={required} error={error} hint={hint} shake={shake}>
      <textarea
        id={id}
        className={`form-input ${error ? 'error' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...textarea}
      />
    </Field>
  )
}

export function CheckboxField({ label, checked, onChange, error, shake, name }) {
  const { id, describedBy } = useFieldA11y(error)
  return (
    <div>
      <motion.div
        animate={{ x: shake ? [0, -6, 6, -6, 6, 0] : 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start gap-3"
      >
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          style={{
            marginTop: 2, width: 18, height: 18,
            accentColor: 'var(--color-accent)', cursor: 'pointer', flexShrink: 0,
          }}
        />
        <label
          htmlFor={id}
          className="text-sm"
          style={{ color: 'var(--color-text)', cursor: 'pointer', lineHeight: 1.5 }}
        >
          {label}
        </label>
      </motion.div>
      <FieldMessage id={`${id}-msg`} error={error} />
    </div>
  )
}

/** Form-level failure. Says what went wrong, never a raw driver message. */
export function FormError({ message }) {
  if (!message) return null
  return (
    <motion.p
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="pf-form-error"
    >
      <AlertCircle size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{message}</span>
    </motion.p>
  )
}
