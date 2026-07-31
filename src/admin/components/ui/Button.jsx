import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  default: 'adm-btn',
  primary: 'adm-btn adm-btn-primary',
  danger: 'adm-btn adm-btn-danger',
  ghost: 'adm-btn adm-btn-ghost',
}

/**
 * A button says what happens when it is used, and keeps saying the same thing
 * while it is busy — "Save changes" becomes "Saving…", never a bare spinner.
 */
const Button = forwardRef(function Button(
  { variant = 'default', size, icon: Icon, busy = false, busyLabel, children, className = '', disabled, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`${VARIANTS[variant] || VARIANTS.default} ${size === 'sm' ? 'adm-btn-sm' : ''} ${className}`}
      {...rest}
    >
      {busy ? <Loader2 size={15} className="adm-spin" /> : Icon ? <Icon size={15} /> : null}
      {busy && busyLabel ? busyLabel : children}
    </button>
  )
})

export default Button

export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, danger = false, size = 16, className = '', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      data-danger={danger || undefined}
      className={`adm-icon-btn ${className}`}
      {...rest}
    >
      <Icon size={size} />
    </button>
  )
})
