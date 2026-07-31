export default function Panel({ children, className = '', as: Tag = 'section', ...rest }) {
  return <Tag className={`adm-panel ${className}`} {...rest}>{children}</Tag>
}

/**
 * Panel headers carry an eyebrow in the club's pixel face — the one place the
 * identity type appears inside a working screen. It labels the module the way
 * silkscreen labels a component on a board.
 */
export function PanelHead({ eyebrow, title, description, action }) {
  return (
    <header className="adm-panel-head">
      <div className="min-w-0">
        {eyebrow && <p className="adm-eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="text-[15px] leading-tight">{title}</h2>
        {description && (
          <p className="text-xs mt-1" style={{ color: 'var(--adm-silk-faint)' }}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </header>
  )
}
