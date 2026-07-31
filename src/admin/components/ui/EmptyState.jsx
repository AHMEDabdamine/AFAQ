import { Inbox } from 'lucide-react'

/**
 * An empty screen is an invitation to act, so every one of these ends in a
 * button or an explanation of what will fill it.
 */
export default function EmptyState({ icon: Icon = Inbox, title, description, action, compact = false }) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'py-10 px-5' : 'py-16 px-6'}`}>
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 46, height: 46, borderRadius: 12,
          background: 'var(--adm-board-sunk)', color: 'var(--adm-silk-faint)',
        }}
      >
        <Icon size={20} />
      </div>
      <h3 className="text-[15px] mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm max-w-sm" style={{ color: 'var(--adm-silk-faint)' }}>{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Failure state — says what broke and offers the way out. */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div
        className="flex items-center justify-center mb-4 adm-pixel"
        style={{
          width: 46, height: 46, borderRadius: 12, fontSize: 20,
          background: 'var(--adm-fault-wash)', color: 'var(--adm-fault)',
        }}
        aria-hidden="true"
      >
        !
      </div>
      <h3 className="text-[15px] mb-1.5">This did not load</h3>
      <p className="text-sm max-w-sm" style={{ color: 'var(--adm-silk-faint)' }}>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="adm-btn mt-5">Try again</button>
      )}
    </div>
  )
}
