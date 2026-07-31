import { supabase } from '../../lib/supabase'
import useAdminStore from '../store/adminStore'

/**
 * Every write in this console used to be fire-and-forget — `await supabase
 * .from('events').update(...)` with the error discarded, then a toast saying
 * "Event updated" whether or not anything changed. These helpers make a failed
 * write say so, in words that name what went wrong and what to do about it.
 */

const PG_MESSAGES = {
  '23505': 'That already exists. Use a different value.',
  '23503': 'Something else still links to this record. Remove those links first.',
  '23502': 'A required field is empty.',
  '22P02': 'One of the values is the wrong type.',
  '42501': 'Your role does not allow this change.',
  'PGRST301': 'Your session expired. Sign in again.',
}

export function describeError(error, fallback = 'The change did not save.') {
  if (!error) return fallback
  if (error.code && PG_MESSAGES[error.code]) return PG_MESSAGES[error.code]
  const msg = error.message || ''
  if (/JWT|token|expired/i.test(msg)) return 'Your session expired. Sign in again.'
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'Cannot reach the server. Check your connection.'
  if (/row-level security|permission denied/i.test(msg)) return 'Your role does not allow this change.'
  return msg || fallback
}

const toast = (message, type) => useAdminStore.getState().addToast(message, type)

/**
 * Await a supabase query and report failure. Returns `{ ok, data, count }`
 * so callers can branch without re-inspecting the error shape.
 *
 * @param builder  a supabase query builder (thenable)
 * @param success  toast to show on success; omit for silent reads
 * @param failure  fallback wording when the driver gives us nothing useful
 */
export async function run(builder, { success, failure } = {}) {
  try {
    const { data, error, count } = await builder
    if (error) {
      toast(describeError(error, failure), 'error')
      return { ok: false, data: null, count: 0, error }
    }
    if (success) toast(success, 'success')
    return { ok: true, data, count: count ?? 0, error: null }
  } catch (err) {
    toast(describeError(err, failure), 'error')
    return { ok: false, data: null, count: 0, error: err }
  }
}

/**
 * Record who changed what. Best-effort by design: a failed log must never
 * block or undo the change it describes, so errors are swallowed here and
 * surface as an empty Activity screen rather than a broken save.
 */
export function logActivity(action, entityType, entityId, metadata) {
  const userId = useAdminStore.getState().adminProfile?.user_id
  if (!userId) return
  supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: metadata ?? null,
    })
    .then(() => {}, () => {})
}

/** Read that never toasts on its own — the page renders its own error state. */
export async function read(builder) {
  try {
    const { data, error, count } = await builder
    if (error) return { ok: false, data: null, count: 0, error, message: describeError(error) }
    return { ok: true, data, count: count ?? 0, error: null, message: null }
  } catch (err) {
    return { ok: false, data: null, count: 0, error: err, message: describeError(err) }
  }
}

/** Count-only read, for the status rail. */
export function countOf(table, apply) {
  const q = supabase.from(table).select('*', { count: 'exact', head: true })
  return apply ? apply(q) : q
}

/** Call our own Express API with the admin session attached. */
export async function api(path, { method = 'GET', body, signal } = {}) {
  const token = useAdminStore.getState().session?.access_token
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(path, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    return { ok: false, data: null, message: 'Cannot reach the server. Check your connection.' }
  }

  let payload = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  if (!res.ok) {
    const message =
      payload?.error ||
      (res.status === 401
        ? 'Your session expired. Sign in again.'
        : res.status === 403
          ? 'Your role does not allow this action.'
          : `The server returned ${res.status}.`)
    return { ok: false, data: payload, message, status: res.status }
  }
  return { ok: true, data: payload, message: null, status: res.status }
}

/** Upload one file, reporting progress. Resolves to the stored URL. */
export function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const token = useAdminStore.getState().session?.access_token
    const fd = new FormData()
    fd.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let payload = null
      try {
        payload = JSON.parse(xhr.responseText)
      } catch { /* server sent no JSON */ }
      if (xhr.status >= 200 && xhr.status < 300 && payload?.url) resolve(payload.url)
      else reject(new Error(payload?.error || `Upload failed (${xhr.status}).`))
    }
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'))
    xhr.open('POST', '/api/upload')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(fd)
  })
}

export async function deleteUploadedFile(url) {
  if (!url || !url.startsWith('/uploads/')) return
  await api('/api/upload', { method: 'DELETE', body: { url } })
}

export { supabase }
