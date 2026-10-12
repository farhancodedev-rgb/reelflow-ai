import { useCallback, useEffect, useState } from 'react'

function readRoute() {
  const hash = window.location.hash.replace(/^#/, '')
  const value = hash.startsWith('/') ? hash : '/'
  const [path, query = ''] = value.split('?')

  return {
    path,
    params: new URLSearchParams(query),
  }
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((to) => {
    window.location.hash = to.startsWith('/') ? to : `/${to}`
  }, [])

  return { ...route, navigate }
}
