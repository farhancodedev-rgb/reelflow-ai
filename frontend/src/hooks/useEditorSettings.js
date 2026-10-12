import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadSettings,
  loadProjectDraft,
  saveProjectDraft,
} from '../utils/storage.js'

const defaultOverlay = {
  text: '',
  color: '#ffffff',
  size: 64,
  position: 'top',
  background: true,
}

const defaultSubtitles = {
  style: 'box',
  size: 48,
  color: '#ffffff',
  position: 'bottom',
  items: [],
}

function makeDefaultEditorSettings() {
  const saved = loadSettings()

  return {
    ratio: saved.defaultRatio,
    quality: saved.defaultQuality,
    fps: 30,
    includeAudio: true,
    formatId: '',
    fit: 'crop',
    fillColor: '#000000',
  }
}

export function useEditorSettings(projectId = null) {
  const [settings, setSettings] = useState(makeDefaultEditorSettings)
  const [overlay, setOverlay] = useState({ ...defaultOverlay })
  const [subtitles, setSubtitles] = useState({ ...defaultSubtitles })
  const [loadedProjectId, setLoadedProjectId] = useState(null)
  const lastSavedProjectId = useRef(null)

  useEffect(() => {
    setLoadedProjectId(null)
    lastSavedProjectId.current = null

    if (!projectId) {
      setSettings(makeDefaultEditorSettings())
      setOverlay({ ...defaultOverlay })
      setSubtitles({ ...defaultSubtitles })
      return
    }

    const draft = loadProjectDraft(projectId)

    setSettings({
      ...makeDefaultEditorSettings(),
      ...(draft?.settings && typeof draft.settings === 'object'
        ? draft.settings
        : {}),
    })

    setOverlay({
      ...defaultOverlay,
      ...(draft?.overlay && typeof draft.overlay === 'object'
        ? draft.overlay
        : {}),
    })

    setSubtitles({
      ...defaultSubtitles,
      ...(draft?.subtitles && typeof draft.subtitles === 'object'
        ? draft.subtitles
        : {}),
      items: Array.isArray(draft?.subtitles?.items)
        ? draft.subtitles.items
        : [],
    })

    setLoadedProjectId(projectId)
  }, [projectId])

  useEffect(() => {
    if (!projectId || loadedProjectId !== projectId) return

    const ok = saveProjectDraft(projectId, {
      settings,
      overlay,
      subtitles,
    })

    if (ok) lastSavedProjectId.current = projectId
  }, [projectId, loadedProjectId, settings, overlay, subtitles])

  const update = useCallback(
    (key, value) => setSettings(prev => ({ ...prev, [key]: value })),
    [],
  )

  const updateOverlay = useCallback(
    (key, value) => setOverlay(prev => ({ ...prev, [key]: value })),
    [],
  )

  const updateSubtitles = useCallback(
    (key, value) => setSubtitles(prev => ({ ...prev, [key]: value })),
    [],
  )

  return {
    settings,
    update,
    overlay,
    updateOverlay,
    subtitles,
    updateSubtitles,
  }
}
