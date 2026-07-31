import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Download, Loader2, UserCheck, UserRoundPlus, X } from 'lucide-react'
import { api, logActivity, read, run, supabase } from '../lib/db'
import useAdminStore from '../store/adminStore'
import useCounts from '../hooks/useCounts'
import useQueryParam from '../hooks/useQueryParam'
import { downloadCSV, formatDate, formatDateTime } from '../lib/format'
import PageHeader, { FilterTabs } from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Drawer, { DetailRow, TagList } from '../components/ui/Drawer'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'
import Button, { IconButton } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import Panel from '../components/ui/Panel'
import { TextField } from '../components/ui/Field'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Members' },
  { value: 'rejected', label: 'Rejected' },
]

export default function MembershipPage() {
  const addToast = useAdminStore(s => s.addToast)
  const { refresh: refreshCounts } = useCounts()

  const [rows, setRows] = useState([])
  const [state, setState] = useState({ loading: true, error: null })
  const [status, setStatus] = useQueryParam('status', 'all')
  const [search] = useQueryParam('q')

  const [detail, setDetail] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [bulk, setBulk] = useState(null)
  const [working, setWorking] = useState({})

  const load = useCallback(async () => {
    setState(s => ({ ...s, error: null }))
    const { ok, data, message } = await read(
      supabase.from('membership_applications').select('*').order('created_at', { ascending: false })
    )
    if (!ok) { setState({ loading: false, error: message }); return }
    setRows(data || [])
    setState({ loading: false, error: null })
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(
    () => (status === 'all' ? rows : rows.filter(r => r.status === status)),
    [rows, status]
  )

  const filterOptions = FILTERS.map(f => ({
    ...f,
    count: f.value === 'all' ? rows.length : rows.filter(r => r.status === f.value).length,
  }))

  const setStatusFor = async (row, next) => {
    setWorking(w => ({ ...w, [row.id]: true }))

    if (next === 'approved') {
      const { ok, message } = await api('/api/approve/membership', { method: 'POST', body: { id: row.id } })
      setWorking(w => ({ ...w, [row.id]: false }))
      if (!ok) { addToast(message, 'error'); return false }
      addToast(`${row.full_name} is now a member. A welcome email is on the way.`)
    } else {
      const { ok } = await run(
        supabase.from('membership_applications').update({ status: next }).eq('id', row.id),
        { success: `${row.full_name} marked ${next}.`, failure: 'The status did not change.' }
      )
      setWorking(w => ({ ...w, [row.id]: false }))
      if (!ok) return false
    }

    logActivity(next, 'membership_applications', row.id, { name: row.full_name })
    await load()
    refreshCounts()
    return true
  }

  const runBulk = async () => {
    const pending = bulk.rows.filter(r => r.status === 'pending')
    if (!pending.length) { addToast('None of the selected rows are still pending.', 'info'); setBulk(null); return }

    let done = 0
    for (const row of pending) {
      if (bulk.action === 'approve') {
        const { ok } = await api('/api/approve/membership', { method: 'POST', body: { id: row.id } })
        if (ok) done += 1
      } else {
        const { error } = await supabase.from('membership_applications').update({ status: 'rejected' }).eq('id', row.id)
        if (!error) done += 1
      }
    }

    const verb = bulk.action === 'approve' ? 'approved' : 'rejected'
    if (done === pending.length) addToast(`${done} ${done === 1 ? 'application' : 'applications'} ${verb}.`)
    else addToast(`${done} of ${pending.length} ${verb}. The rest failed — try them individually.`, 'warning')

    setBulk(null)
    await load()
    refreshCounts()
  }

  const exportCSV = () => {
    downloadCSV(
      `members-${status}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Name', 'Email', 'Phone', 'Student ID', 'Department', 'Study year', 'Skills', 'Interests', 'Motivation', 'Status', 'Applied'],
      filtered.map(r => [
        r.full_name, r.email, r.phone, r.student_id, r.department, r.study_year,
        r.skills, r.interests, r.motivation, r.status, formatDateTime(r.created_at),
      ])
    )
    addToast(`Exported ${filtered.length} rows.`)
  }

  const columns = useMemo(() => [
    {
      header: 'Name',
      accessorKey: 'full_name',
      cell: ({ row }) => (
        <span className="min-w-0 block">
          <span className="block text-sm font-semibold adm-truncate" style={{ maxWidth: 210 }}>{row.original.full_name}</span>
          <span className="adm-data block text-[11px] adm-truncate" style={{ color: 'var(--adm-silk-faint)', maxWidth: 210 }}>
            {row.original.email}
          </span>
        </span>
      ),
    },
    { header: 'Student ID', accessorKey: 'student_id', cell: ({ row }) => (
      <span className="adm-data text-[12px]">{row.original.student_id || '—'}</span>
    )},
    { header: 'Department', accessorKey: 'department', cell: ({ row }) => (
      <span className="text-[13px]" style={{ color: 'var(--adm-silk-dim)' }}>{row.original.department || '—'}</span>
    )},
    { header: 'Year', accessorKey: 'study_year', cell: ({ row }) => (
      <span className="text-[13px]" style={{ color: 'var(--adm-silk-dim)' }}>{row.original.study_year || '—'}</span>
    )},
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      header: 'Applied',
      accessorKey: 'created_at',
      cell: ({ row }) => <span className="adm-data text-[12px]">{formatDate(row.original.created_at)}</span>,
    },
    {
      header: '',
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        const r = row.original
        const busy = working[r.id]
        if (r.status !== 'pending') return null
        return (
          <div className="flex items-center justify-end gap-0.5" onClick={e => e.stopPropagation()}>
            {busy && <Loader2 size={14} className="adm-spin mr-1" style={{ color: 'var(--adm-silk-faint)' }} />}
            <IconButton icon={Check} label="Approve" disabled={busy} onClick={() => setStatusFor(r, 'approved')} />
            <IconButton icon={X} label="Reject" danger disabled={busy} onClick={() => setStatusFor(r, 'rejected')} />
          </div>
        )
      },
    },
  ], [working]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <PageHeader
        eyebrow="Operate"
        title="Membership"
        description="People asking to join the club. Approving one sends a welcome email and counts them as a member."
        actions={
          <>
            <Button icon={Download} onClick={exportCSV} disabled={!filtered.length}>
              Export {filtered.length ? `${filtered.length} rows` : 'CSV'}
            </Button>
            <Button variant="primary" icon={UserRoundPlus} onClick={() => setAddOpen(true)}>Add a member</Button>
          </>
        }
      />

      {state.error ? (
        <Panel><ErrorState message={state.error} onRetry={load} /></Panel>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          loading={state.loading}
          initialSearch={search}
          getRowId={row => String(row.id)}
          onRowClick={setDetail}
          enableSelection
          searchPlaceholder="Search by name, email, department…"
          toolbar={<FilterTabs options={filterOptions} value={status} onChange={setStatus} label="Status filter" />}
          bulkActions={selected => {
            const pending = selected.filter(r => r.status === 'pending').length
            return (
              <>
                <Button size="sm" variant="primary" icon={Check} disabled={!pending}
                  onClick={() => setBulk({ action: 'approve', rows: selected })}>
                  Approve {pending || ''}
                </Button>
                <Button size="sm" icon={X} disabled={!pending}
                  onClick={() => setBulk({ action: 'reject', rows: selected })}>
                  Reject
                </Button>
              </>
            )
          }}
          emptyState={
            rows.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title="Nobody has applied yet"
                description="Applications from the join form land here. You can also add a member by hand."
                action={<Button variant="primary" icon={UserRoundPlus} onClick={() => setAddOpen(true)}>Add a member</Button>}
              />
            ) : (
              <EmptyState compact icon={UserCheck} title="Nothing in this view" description="Try another status." />
            )
          }
        />
      )}

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.full_name || ''}
        subtitle={detail ? `Applied ${formatDateTime(detail.created_at)}` : ''}
        badge={detail && <StatusBadge status={detail.status} />}
        footer={
          detail?.status === 'pending' && (
            <>
              <Button icon={X} onClick={async () => { if (await setStatusFor(detail, 'rejected')) setDetail(null) }}>
                Reject
              </Button>
              <Button
                variant="primary" icon={Check} busy={working[detail.id]} busyLabel="Approving…"
                onClick={async () => { if (await setStatusFor(detail, 'approved')) setDetail(null) }}
              >
                Approve
              </Button>
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Email" mono>{detail.email}</DetailRow>
              <DetailRow label="Phone" mono>{detail.phone || '—'}</DetailRow>
              <DetailRow label="Student ID" mono>{detail.student_id || '—'}</DetailRow>
              <DetailRow label="Study year">{detail.study_year || '—'}</DetailRow>
              <DetailRow label="Department">{detail.department || '—'}</DetailRow>
            </div>
            <DetailRow label="Skills"><TagList items={detail.skills} empty="None listed" /></DetailRow>
            <DetailRow label="Interests"><TagList items={detail.interests} empty="None listed" /></DetailRow>
            <DetailRow label="Why they want to join">
              {detail.motivation
                ? <p className="whitespace-pre-wrap leading-relaxed">{detail.motivation}</p>
                : <span style={{ color: 'var(--adm-silk-faint)' }}>They left this blank.</span>}
            </DetailRow>
          </div>
        )}
      </Drawer>

      <AddMember open={addOpen} onClose={() => setAddOpen(false)} onAdded={() => { load(); refreshCounts() }} />

      <ConfirmDialog
        open={!!bulk}
        onClose={() => setBulk(null)}
        onConfirm={runBulk}
        danger={bulk?.action === 'reject'}
        title={bulk?.action === 'approve' ? 'Approve these applications?' : 'Reject these applications?'}
        confirmLabel={bulk?.action === 'approve' ? 'Approve all' : 'Reject all'}
        busyLabel={bulk?.action === 'approve' ? 'Approving…' : 'Rejecting…'}
        message={
          bulk
            ? bulk.action === 'approve'
              ? `${bulk.rows.filter(r => r.status === 'pending').length} people will join the club and get a welcome email.`
              : `${bulk.rows.filter(r => r.status === 'pending').length} applications will be rejected. No email is sent.`
            : ''
        }
      />
    </div>
  )
}

function AddMember({ open, onClose, onAdded }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', department: '', student_id: '', study_year: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ full_name: '', email: '', phone: '', department: '', student_id: '', study_year: '' })
      setErrors({})
    }
  }, [open])

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const submit = async () => {
    const next = {}
    if (!form.full_name.trim()) next.full_name = 'Enter the member’s name.'
    if (!form.email.trim()) next.email = 'Enter an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'That is not a valid email address.'
    if (Object.keys(next).length) { setErrors(next); return }

    setSaving(true)
    const { ok } = await run(
      supabase.from('membership_applications').insert({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        department: form.department.trim() || null,
        student_id: form.student_id.trim() || null,
        study_year: form.study_year.trim() || null,
        status: 'approved',
      }),
      { success: `${form.full_name.trim()} added to the club.`, failure: 'The member was not added.' }
    )
    setSaving(false)
    if (ok) { onClose(); onAdded() }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a member"
      description="For people who joined in person. They are saved as approved and no email is sent."
      footer={
        <>
          <Button onClick={onClose} data-dialog-dismiss="true">Cancel</Button>
          <Button variant="primary" onClick={submit} busy={saving} busyLabel="Adding…">Add member</Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField label="Full name" required value={form.full_name} error={errors.full_name}
          onChange={e => set('full_name', e.target.value)} placeholder="Ahmed Mansouri" />
        <TextField label="Email" type="email" required value={form.email} error={errors.email}
          onChange={e => set('email', e.target.value)} placeholder="ahmed@univ-bouira.dz" />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+213 6XX XXX XXX" />
          <TextField label="Student ID" value={form.student_id} onChange={e => set('student_id', e.target.value)} />
          <TextField label="Department" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Computer Science" />
          <TextField label="Study year" value={form.study_year} onChange={e => set('study_year', e.target.value)} placeholder="L2" />
        </div>
      </div>
    </Modal>
  )
}
