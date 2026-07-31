import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Loader2 } from 'lucide-react'

/**
 * One button, four looks. Variants live in index.css (.btn-*) so hover, active,
 * focus-visible and disabled states are all expressible - inline styles can't
 * carry pseudo-classes, which is why none of those states worked before.
 */
export function Button({
  children,
  to,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  loading = false,
  disabled = false,
  ...props
}) {
  const classes = `btn btn-${variant} btn-${size} ${className}`.trim()

  const content = (
    <>
      {loading && <Loader2 size={16} className="btn-icon animate-spin" aria-hidden="true" />}
      <span>{children}</span>
      {!loading && icon === 'arrow' && <ArrowRight size={16} className="btn-icon" aria-hidden="true" />}
      {!loading && icon === 'external' && <ArrowUpRight size={16} className="btn-icon" aria-hidden="true" />}
    </>
  )

  // A disabled link isn't a thing in HTML, so render it as an inert span that
  // still announces its state.
  if (to && !disabled) {
    return <Link to={to} className={classes} {...props}>{content}</Link>
  }

  if (href && !disabled) {
    return (
      <a
        className={classes}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {content}
      </a>
    )
  }

  if (to || href) {
    return <span className={classes} aria-disabled="true" role="link">{content}</span>
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  )
}

export default Button
