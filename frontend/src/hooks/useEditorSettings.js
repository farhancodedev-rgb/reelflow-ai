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

const RATIOS = ['9:16', '1:1', '16:9']
const QUALITIES = ['720p', '1080p']
const COLORS = ['#ffffff', '#fde047', '#0b0b0b']
const FILL_COLORS = ['#000000', '#ffffff', '#0b1020']
const POSITIONS = ['top', 'center', 'bottom']

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

function isRecord(value) {
  return Boolean(value) &&
    typeof value === 'object' &&
    !Array.isArray(value)
}

function validateSettings(value) {
  const defaults = makeDefaultEditorSettings()
  if (!isRecord(value)) return defaults

  return {
    ratio: RATIOS.includes(value.ratio) ? value.ratio : defaults.ratio,
    quality: QUALITIES.includes(value.quality) ? value.quality : defaults.quality,
    fps: [24, 30].includes(value.fps) ? value.fps : defaults.fps,
    includeAudio: typeof value.includeAudio === 'boolean'
      ? value.includeAudio
      : defaults.includeAudio,
    formatId: ['', 'mp4', 'webm'].includes(value.formatId)
      ? value.formatId
      : defaults.formatId,
    fit: ['crop', 'fit'].includes(value.fit) ? value.fit : defaults.fit,
    fillColor: FILL_COLORS.includes(value.fillColor)
      ? value.fillColor
      : defaults.fillColor,
  }
}

function validateOverlay(value) {
  if (!isRecord(value)) return { ...defaultOverlay }

  return {
    text: typeof value.text === 'string' ? value.text.slice(0, 120) : '',
    color: COLORS.includes(value.color) ? value.color : defaultOverlay.color,
    size: Number.isInteger(value.size) &&
      value.size >= 24 && value.size <= 140 && value.size % 2 === 0
      ? value.size
      : defaultOverlay.size,
    position: POSITIONS.includes(value.position)
      ? value.position
      : defaultOverlay.position,
    background: typeof value.background === 'boolean'
      ? value.background
      : defaultOverlay.background,
  }
}

function validateSubtitles(value) {
  if (!isRecord(value)) return { ...defaultSubtitles }

  const items = Array.isArray(value.items)
    ? value.items.slice(0, 500).filter(c =>
        isRecord(c) &&
        typeof c.id === 'string' &&
        c.id.length > 0 &&
        typeof c.text === 'string' &&
        (c.start === null || (typeof c.start === 'number' && Number.isFinite(c.start))) &&
        (c.end === null || (typeof c.end === 'number' && Number.isFinite(c.end)))
      ).map(c => ({
        id: c.id.slice(0, 100),
        text: c.text.slice(0, 120),
        start: Number.isFinite(c.start) ? c.start : NaN,
        end: Number.isFinite(c.end) ? c.end : NaN,
      }))
    : []

  return {
    style: ['box', 'outline', 'plain'].includes(value.style)
      ? value.style
      : defaultSubtitles.style,
    size: Number.isInteger(value.size) &&
      value.size >= 24 && value.size <= 100 && value.size % 2 === 0
      ? value.size
      : defaultSubtitles.size,
    color: COLORS.includes(value.color) ? value.color : defaultSubtitles.color,
    position: POSITIONS.includes(value.position)
      ? value.position
      : defaultSubtitles.position,
    items,
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
      ...validateSettings(draft?.settings),
    })

    setOverlay(validateOverlay(draft?.overlay))
    setSubtitles(validateSubtitles(draft?.subtitles))
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
