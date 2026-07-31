/**
 * Boot screen. The pixel wordmark is the club's own face — it is the one thing
 * on screen while the session resolves, so it may as well be the identity.
 */
export default function LoadingScreen({ label = 'Starting console…' }) {
  return (
    <div className="adm adm-chassis min-h-screen flex flex-col items-center justify-center gap-5" data-theme="system">
      <p className="adm-pixel text-lg tracking-widest" style={{ color: 'var(--adm-silk)' }}>AFAQ</p>
      <div
        style={{
          width: 26, height: 26, borderRadius: '50%',
          border: '2px solid var(--adm-trace)', borderTopColor: 'var(--adm-signal)',
        }}
        className="adm-spin"
      />
      <p className="text-sm" style={{ color: 'var(--adm-silk-faint)' }}>{label}</p>
    </div>
  )
}
