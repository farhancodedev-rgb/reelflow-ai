// Metadata only. No videos, tokens or secrets are ever stored here.
const KEY = 'reelflow.projects.v1'

export function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function loadProjects() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(p => p && typeof p.id === 'string' && typeof p.title === 'string')
  } catch {
    return []
  }
}

export function saveProjects(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

const SETTINGS_KEY = 'reelflow.settings.v1'

export const defaultSettings = {
  displayName: '',
  defaultRatio: '9:16',
  defaultQuality: '1080p',
  captionLanguage: 'en',
  reduceMotion: false,
  notifyExport: true,
  notifyReminders: false,
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...defaultSettings }

    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { ...defaultSettings }
    }

    const validRatios = ['9:16', '1:1', '16:9']
    const validQualities = ['1080p', '720p']

    return {
      displayName: typeof data.displayName === 'string'
        ? data.displayName.slice(0, 40)
        : defaultSettings.displayName,
      defaultRatio: validRatios.includes(data.defaultRatio)
        ? data.defaultRatio
        : defaultSettings.defaultRatio,
      defaultQuality: validQualities.includes(data.defaultQuality)
        ? data.defaultQuality
        : defaultSettings.defaultQuality,
      captionLanguage: ['en', 'ur'].includes(data.captionLanguage)
        ? data.captionLanguage
        : defaultSettings.captionLanguage,
      reduceMotion: typeof data.reduceMotion === 'boolean'
        ? data.reduceMotion
        : defaultSettings.reduceMotion,
      notifyExport: typeof data.notifyExport === 'boolean'
        ? data.notifyExport
        : defaultSettings.notifyExport,
      notifyReminders: typeof data.notifyReminders === 'boolean'
        ? data.notifyReminders
        : defaultSettings.notifyReminders,
    }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    return true
  } catch {
    return false
  }
}

export function applyAppearance(settings) {
  document.documentElement.dataset.motion = settings.reduceMotion ? 'reduce' : 'normal'
}

const POSTS_KEY = 'reelflow.posts.v1'

export function loadPosts() {
  try {
    const raw = localStorage.getItem(POSTS_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(p => p && typeof p.id === 'string' && typeof p.platform === 'string')
  } catch {
    return []
  }
}

export function savePosts(list) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

// Editor drafts are stored separately from project-list metadata.
// Video files and temporary object URLs are never stored here.
const PROJECT_DRAFTS_KEY = 'reelflow.projectDrafts.v1'

function readProjectDrafts() {
  try {
    const raw = localStorage.getItem(PROJECT_DRAFTS_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' && !Array.isArray(data)
      ? data
      : {}
  } catch {
    return {}
  }
}

export function loadProjectDraft(projectId) {
  if (typeof projectId !== 'string' || !projectId) return null

  const drafts = readProjectDrafts()
  const draft = drafts[projectId]

  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) {
    return null
  }

  return draft
}

export function saveProjectDraft(projectId, draft) {
  if (
    typeof projectId !== 'string' ||
    !projectId ||
    !draft ||
    typeof draft !== 'object' ||
    Array.isArray(draft)
  ) {
    return false
  }

  try {
    const drafts = readProjectDrafts()
    drafts[projectId] = {
      ...draft,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(PROJECT_DRAFTS_KEY, JSON.stringify(drafts))
    return true
  } catch {
    return false
  }
}

export function deleteProjectDraft(projectId) {
  if (typeof projectId !== 'string' || !projectId) return false

  try {
    const drafts = readProjectDrafts()
    delete drafts[projectId]
    localStorage.setItem(PROJECT_DRAFTS_KEY, JSON.stringify(drafts))
    return true
  } catch {
    return false
  }
}
