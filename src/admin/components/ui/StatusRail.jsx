import { useNavigate } from 'react-router-dom'
import Skeleton from './Skeleton'

/**
 * ── The status rail ──────────────────────────────────────────────────────────
 * The signature of this console, and the only thing on screen allowed to glow.
 *
 * Each channel is one queue that can be waiting on a human. The LED is amber
 * while the queue holds work and dark once it is clear, the count is set in the
 * club's pixel face, and the whole channel is a button that lands you on the
 * filtered list. It answers the only question worth asking on arrival: what
 * needs me right now.
 */
export default function StatusRail({ channels, loading = false }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="adm-rail-strip">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="adm-channel" style={{ cursor: 'default' }}>
            <Skeleton style={{ width: 9, height: 9, borderRadius: 999 }} />
            <div className="flex-1">
              <Skeleton style={{ height: 20, width: 34, marginBottom: 7 }} />
              <Skeleton style={{ height: 9, width: 76 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!channels.length) return null

  return (
    <div className="adm-rail-strip" role="group" aria-label="Queues waiting on you">
      {channels.map(channel => {
        const waiting = channel.count > 0
        const state = waiting ? channel.tone || 'wait' : 'idle'
        return (
          <button
            key={channel.id}
            type="button"
            className="adm-channel"
            onClick={() => navigate(channel.to)}
          >
            <span className="adm-led" data-state={state} aria-hidden="true" />
            <span className="min-w-0">
              <span className="flex items-baseline gap-1.5">
                <span
                  className="adm-channel-count"
                  style={{ color: waiting ? 'var(--adm-silk)' : 'var(--adm-silk-faint)' }}
                >
                  {channel.count}
                </span>
                {waiting && (
                  <span className="text-xs font-semibold" style={{ color: 'var(--adm-silk-faint)' }}>
                    waiting
                  </span>
                )}
              </span>
              <span className="adm-eyebrow block mt-1.5">{channel.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
