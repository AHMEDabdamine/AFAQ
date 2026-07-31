import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Filters live in the URL, so a filtered list can be linked to. The status rail
 * and the command palette both rely on this — clicking "12 waiting" lands you
 * on the pending list, not on the list you then have to filter yourself.
 */
export default function useQueryParam(key, fallback = '') {
  const [params, setParams] = useSearchParams()
  const value = params.get(key) ?? fallback

  const setValue = useCallback(
    next => {
      setParams(
        current => {
          const updated = new URLSearchParams(current)
          if (next === fallback || next === '' || next === null) updated.delete(key)
          else updated.set(key, next)
          return updated
        },
        { replace: true }
      )
    },
    [key, fallback, setParams]
  )

  return [value, setValue]
}
