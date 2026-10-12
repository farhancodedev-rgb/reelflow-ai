import { useCallback, useEffect, useState } from 'react'
import {
  loadProjects,
  saveProjects,
  makeId,
  loadProjectDraft,
  saveProjectDraft,
  deleteProjectDraft,
} from '../utils/storage.js'

export function useProjects() {
  const [projects, setProjects] = useState(loadProjects)
  const [storageOk, setStorageOk] = useState(true)

  useEffect(() => {
    setStorageOk(saveProjects(projects))
  }, [projects])

  const create = useCallback(({ title, ratio }) => {
    const now = new Date().toISOString()
    const project = {
      id: makeId(),
      title,
      ratio,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }

    setProjects(list => [project, ...list])
  }, [])

  const rename = useCallback((id, title) => {
    setProjects(list =>
      list.map(p =>
        p.id === id
          ? { ...p, title, updatedAt: new Date().toISOString() }
          : p
      )
    )
  }, [])

  const duplicate = useCallback((id) => {
    const source = projects.find(p => p.id === id)
    if (!source) return

    const newId = makeId()
    const now = new Date().toISOString()
    const draft = loadProjectDraft(id)

    if (draft) {
      saveProjectDraft(newId, draft)
    }

    const copy = {
      ...source,
      id: newId,
      title: `${source.title} (copy)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }

    setProjects(list => [copy, ...list])
  }, [projects])

  const remove = useCallback((id) => {
    deleteProjectDraft(id)
    setProjects(list => list.filter(p => p.id !== id))
  }, [])

  return {
    projects,
    storageOk,
    create,
    rename,
    duplicate,
    remove,
  }
}
