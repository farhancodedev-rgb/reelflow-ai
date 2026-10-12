import { useCallback, useEffect, useState } from 'react'

export const VIDEO_ACCEPT = 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm'
const MAX_BYTES = 100 * 1024 * 1024
const ALLOWED = ['video/mp4', 'video/quicktime', 'video/webm']

export function useVideoFile() {
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    if (!file) {
      setUrl('')
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  // returns '' on success, or a friendly error message
  const select = useCallback(selected => {
    if (!selected) return 'No file was chosen.'
    const extensionOk = /\.(mp4|mov|webm)$/i.test(selected.name)
    if (!ALLOWED.includes(selected.type) && !extensionOk) return 'Please choose an MP4, MOV or WebM video.'
    if (selected.size > MAX_BYTES) return 'The maximum file size in this prototype is 100 MB.'
    setMeta(null)
    setFile(selected)
    return ''
  }, [])

  const remove = useCallback(() => {
    setFile(null)
    setMeta(null)
  }, [])

  const onMetadata = useCallback(el => {
    setMeta({ duration: el.duration, width: el.videoWidth, height: el.videoHeight })
  }, [])

  return { file, url, meta, select, remove, onMetadata }
}
