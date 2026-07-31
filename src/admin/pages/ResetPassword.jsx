import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Check, Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import useAdminStore from '../store/adminStore'
import Button from '../components/ui/Button'
import { TextField } from '../components/ui/Field'
import '../admin.css'

export default function ResetPassword() {
  const theme = useAdminStore(s => s.theme)
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (!window.location.hash.includes('type=recovery')) {
      setInvalid(true)
      return
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN') setInvalid(false)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setInvalid(false)
    })
    return () => subscription?.unsubscribe()
  }, [])

  const submit = async e => {
    e.preventDefault()
    const found = {}
    if (password.length < 8) found.password = 'Use at least 8 characters.'
    if (password !== confirm) found.confirm = 'The two passwords do not match.'
    if (Object.keys(found).length) { setErrors(found); return }

    setErrors({})
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => navigate('/admin/login', { replace: true }), 2500)
    } catch (err) {
      setErrors({ password: err.message || 'The password could not be changed. Request a new link.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      dir="ltr"
      data-theme={theme}
      className="adm adm-chassis min-h-screen flex items-center justify-center p-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="adm-panel w-full p-6"
        style={{ maxWidth: 380, boxShadow: 'var(--adm-shadow-lift)' }}
      >
        {invalid ? (
          <Notice
            tone="fault"
            icon={AlertCircle}
            title="This link no longer works"
            body="Reset links expire after an hour and can only be used once. Ask for a new one from the sign-in screen."
            action={<Button variant="primary" onClick={() => navigate('/admin/login')}>Back to sign in</Button>}
          />
        ) : done ? (
          <Notice
            tone="ok"
            icon={Check}
            title="Password changed"
            body="Taking you to the sign-in screen…"
          />
        ) : (
          <>
            <div className="text-center mb-6">
              <span
                className="inline-flex items-center justify-center mb-4"
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--adm-signal-wash)', color: 'var(--adm-signal)',
                }}
                aria-hidden="true"
              >
                <KeyRound size={20} />
              </span>
              <h1 className="text-lg mb-1.5">Set a new password</h1>
              <p className="text-sm" style={{ color: 'var(--adm-silk-faint)' }}>
                Pick something you have not used on another site.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="adm-label" htmlFor="new-password">New password</label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="adm-input"
                    style={{ paddingRight: 40 }}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors({}) }}
                    aria-invalid={errors.password ? 'true' : undefined}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="adm-icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                    style={{ width: 30, height: 30 }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: 'var(--adm-fault)' }}>
                    <AlertCircle size={13} /> {errors.password}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs" style={{ color: 'var(--adm-silk-faint)' }}>At least 8 characters.</p>
                )}
              </div>

              <TextField
                label="Confirm new password" type="password" required
                autoComplete="new-password"
                value={confirm} error={errors.confirm}
                onChange={e => { setConfirm(e.target.value); setErrors({}) }}
              />

              <Button type="submit" variant="primary" busy={loading} busyLabel="Changing…" className="w-full">
                Change password
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}

function Notice({ tone, icon: Icon, title, body, action }) {
  return (
    <div className="text-center">
      <span
        className="inline-flex items-center justify-center mb-4"
        style={{
          width: 44, height: 44, borderRadius: 12,
          background: `var(--adm-${tone}-wash)`, color: `var(--adm-${tone})`,
        }}
        aria-hidden="true"
      >
        <Icon size={20} />
      </span>
      <h1 className="text-lg mb-1.5">{title}</h1>
      <p className="text-sm" style={{ color: 'var(--adm-silk-faint)' }}>{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
