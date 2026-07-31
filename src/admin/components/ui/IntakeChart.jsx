import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const SERIES = [
  { key: 'registrations', label: 'Event registrations', color: 'var(--adm-series-1)' },
  { key: 'applications', label: 'Membership applications', color: 'var(--adm-series-2)' },
]

const DAY_LABEL = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0)

  return (
    <div
      className="px-3 py-2.5 rounded-xl"
      style={{
        background: 'var(--adm-panel)',
        border: '1px solid var(--adm-trace)',
        boxShadow: 'var(--adm-shadow-lift)',
        minWidth: 190,
      }}
    >
      <p className="adm-data text-xs mb-2" style={{ color: 'var(--adm-silk-faint)' }}>{label}</p>
      {SERIES.map(series => {
        const entry = payload.find(p => p.dataKey === series.key)
        return (
          <p key={series.key} className="flex items-center gap-2 text-[13px] mb-1 last:mb-0">
            <span
              aria-hidden="true"
              style={{ width: 8, height: 8, borderRadius: 2, background: series.color, flexShrink: 0 }}
            />
            {/* Labels stay in text ink; the swatch beside them carries identity. */}
            <span className="flex-1" style={{ color: 'var(--adm-silk-dim)' }}>{series.label}</span>
            <span className="adm-data font-semibold" style={{ color: 'var(--adm-silk)' }}>{entry?.value ?? 0}</span>
          </p>
        )
      })}
      <p
        className="flex items-center justify-between text-[13px] mt-2 pt-2"
        style={{ borderTop: '1px solid var(--adm-trace)', color: 'var(--adm-silk-dim)' }}
      >
        Total <span className="adm-data font-semibold" style={{ color: 'var(--adm-silk)' }}>{total}</span>
      </p>
    </div>
  )
}

/**
 * Thirty days of intake, stacked by source. Club sign-ups arrive in bursts
 * around events rather than as a smooth trend, so daily bars show the real
 * shape — a line would invent slopes between spikes that never happened.
 */
export default function IntakeChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.registrations + d.applications, 0)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={{ height: 216 }}>
        <p className="text-sm" style={{ color: 'var(--adm-silk-dim)' }}>No sign-ups in the last 30 days.</p>
        <p className="text-xs mt-1" style={{ color: 'var(--adm-silk-faint)' }}>
          Open registration on an event and they will appear here.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Two series, so identity is never carried by colour alone. */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {SERIES.map(series => (
          <span key={series.key} className="flex items-center gap-2 text-xs" style={{ color: 'var(--adm-silk-dim)' }}>
            <span
              aria-hidden="true"
              style={{ width: 9, height: 9, borderRadius: 2, background: series.color }}
            />
            {series.label}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={216}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="var(--adm-grid)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: 'var(--adm-grid)' }}
            tick={{ fill: 'var(--adm-silk-faint)', fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: 'var(--adm-silk-faint)', fontSize: 11 }}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: 'var(--adm-signal-wash)' }}
          />
          {SERIES.map(series => (
            <Bar
              key={series.key}
              dataKey={series.key}
              stackId="intake"
              fill={series.color}
              radius={[3, 3, 0, 0]}
              /* A surface-coloured hairline keeps stacked segments from
                 fusing into one block. */
              stroke="var(--adm-panel)"
              strokeWidth={1.5}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Bucket raw rows into the last 30 days, zero-filled so gaps read as gaps. */
export function buildIntakeSeries(registrations, applications, days = 30) {
  const buckets = new Map()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    buckets.set(day.toDateString(), { label: DAY_LABEL.format(day), registrations: 0, applications: 0 })
  }

  const add = (rows, key) => {
    for (const row of rows || []) {
      const day = new Date(row.created_at)
      if (Number.isNaN(day.getTime())) continue
      day.setHours(0, 0, 0, 0)
      const bucket = buckets.get(day.toDateString())
      if (bucket) bucket[key] += 1
    }
  }

  add(registrations, 'registrations')
  add(applications, 'applications')

  return [...buckets.values()]
}
