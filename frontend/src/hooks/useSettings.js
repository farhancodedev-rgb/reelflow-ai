import { useCallback, useEffect, useState } from 'react'
import { loadSettings, saveSettings, applyAppearance, defaultSettings } from '../utils/storage.js'

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings)
  const [storageOk, setStorageOk] = useState(true)

  useEffect(() => {
    setStorageOk(saveSettings(settings))
    applyAppearance(settings)
  }, [settings])

  const update = useCallback((key, value) => {
    setSettings(previous => ({ ...previous, [key]: value }))
  }, [])

  const reset = useCallback(() => setSettings({ ...defaultSettings }), [])

  return { settings, storageOk, update, reset }
}
