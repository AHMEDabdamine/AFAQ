export default function Skeleton({ className = '', style }) {
  return <div className={`adm-skeleton ${className}`} style={{ height: 14, ...style }} aria-hidden="true" />
}

export function SkeletonPanel({ rows = 3, className = '' }) {
  return (
    <div className={`adm-panel p-5 ${className}`}>
      <Skeleton style={{ height: 12, width: 110, marginBottom: 18 }} />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} style={{ height: 16, width: `${92 - i * 13}%` }} />
        ))}
      </div>
    </div>
  )
}
