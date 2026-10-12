import { useCallback, useEffect, useState } from 'react'
import { loadPosts, savePosts, makeId } from '../utils/storage.js'

export function usePosts() {
  const [posts, setPosts] = useState(loadPosts)
  const [storageOk, setStorageOk] = useState(true)

  useEffect(() => {
    setStorageOk(savePosts(posts))
  }, [posts])

  // status: 'draft' | 'demo-published' | 'demo-scheduled'
  const add = useCallback(post => {
    setPosts(list => [{ ...post, id: makeId(), createdAt: new Date().toISOString() }, ...list])
  }, [])

  const remove = useCallback(id => setPosts(list => list.filter(p => p.id !== id)), [])

  return { posts, storageOk, add, remove }
}
