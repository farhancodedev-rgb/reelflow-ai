import { useCallback, useEffect, useState } from 'react'

export function useToast(duration = 5500) {
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), duration)
    return () => clearTimeout(timer)
  }, [notice, duration])

  const showNotice = useCallback(
    (title, message, type = 'info') => setNotice({ title, message, type }),
    []
  )
  const dismiss = useCallback(() => setNotice(null), [])

  return { notice, showNotice, dismiss }
}
