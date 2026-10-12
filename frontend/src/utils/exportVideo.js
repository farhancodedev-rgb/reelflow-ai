export const RATIOS = { '9:16': [9, 16], '1:1': [1, 1], '16:9': [16, 9] }
export const QUALITIES = { '720p': 720, '1080p': 1080 }

const even = n => Math.max(2, Math.round(n / 2) * 2)

export function getExportSize(ratio, quality) {
  const short = QUALITIES[quality] ?? 1080
  const [rw, rh] = RATIOS[ratio] ?? RATIOS['9:16']
  const width = rw >= rh ? (short * rw) / rh : short
  const height = rh > rw ? (short * rh) / rw : short
  return { width: even(width), height: even(height) }
}

const CANDIDATES = [
  { id: 'mp4', ext: 'mp4', label: 'MP4 (browser-encoded)', mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2' },
  { id: 'mp4', ext: 'mp4', label: 'MP4 (browser-encoded)', mime: 'video/mp4' },
  { id: 'webm', ext: 'webm', label: 'WebM', mime: 'video/webm;codecs=vp9,opus' },
  { id: 'webm', ext: 'webm', label: 'WebM', mime: 'video/webm;codecs=vp8,opus' },
  { id: 'webm', ext: 'webm', label: 'WebM', mime: 'video/webm' },
]

// Only formats this browser can really record. Never fakes MP4.
export function getSupportedFormats() {
  if (typeof MediaRecorder === 'undefined') return []
  const found = []
  for (const c of CANDIDATES) {
    if (found.some(f => f.id === c.id)) continue
    try {
      if (MediaRecorder.isTypeSupported(c.mime)) found.push(c)
    } catch {
      /* ignore */
    }
  }
  return found
}

// Shared by preview and export so both crop/fit the same way.
export function drawVideoFrame(ctx, video, width, height, { fit, fillColor }) {
  ctx.fillStyle = fillColor
  ctx.fillRect(0, 0, width, height)
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return
  const scale = fit === 'fit' ? Math.min(width / vw, height / vh) : Math.max(width / vw, height / vh)
  const dw = vw * scale
  const dh = vh * scale
  ctx.drawImage(video, (width - dw) / 2, (height - dh) / 2, dw, dh)
}

const abortError = () => new DOMException('Export cancelled', 'AbortError')

export async function exportVideo({
  url, ratio, quality, fps = 30, includeAudio = true, format,
  fit = 'crop', fillColor = '#000000', drawExtras, onProgress, signal,
}) {
  if (typeof MediaRecorder === 'undefined') throw new Error('This browser cannot record video.')
  if (!format) throw new Error('No supported output format was found in this browser.')
  if (signal?.aborted) throw abortError()

  const { width, height } = getExportSize(ratio, quality)
  const video = document.createElement('video')
  let raf = 0
  let recorder = null
  let canvasStream = null
  let audioStream = null

  const cleanup = () => {
    cancelAnimationFrame(raf)
    if (recorder && recorder.state !== 'inactive') {
      try { recorder.stop() } catch { /* ignore */ }
    }
    canvasStream?.getTracks().forEach(t => t.stop())
    audioStream?.getTracks().forEach(t => t.stop())
    video.pause()
    video.removeAttribute('src')
    video.load()
  }

  try {
    video.playsInline = true
    video.preload = 'auto'
    video.muted = !includeAudio
    video.src = url

    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve
      video.onerror = () => reject(new Error('The selected video could not be loaded.'))
      video.load()
    })
    if (!video.videoWidth || !video.videoHeight) throw new Error('The video has no readable picture.')
    const duration = video.duration
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('The video length could not be read.')

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas rendering is unavailable.')

    const draw = () => {
      drawVideoFrame(ctx, video, width, height, { fit, fillColor })
      if (drawExtras) drawExtras(ctx, { width, height, time: video.currentTime })
    }
    draw()

    canvasStream = canvas.captureStream(fps)
    const tracks = [...canvasStream.getVideoTracks()]
    let audioCaptured = false
    if (includeAudio) {
      const capture = video.captureStream || video.webkitCaptureStream
      if (capture) {
        try {
          audioStream = capture.call(video)
          const audioTracks = audioStream.getAudioTracks()
          audioTracks.forEach(t => tracks.push(t))
          audioCaptured = audioTracks.length > 0
        } catch {
          audioCaptured = false
        }
      }
    }

    const bitrate = Math.min(12_000_000, Math.max(1_500_000, Math.round(width * height * fps * 0.1)))
    recorder = new MediaRecorder(new MediaStream(tracks), { mimeType: format.mime, videoBitsPerSecond: bitrate })
    const chunks = []
    recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data) }
    const stopped = new Promise((resolve, reject) => {
      recorder.onerror = () => reject(new Error('Video recording failed.'))
      recorder.onstop = () => resolve()
    })
    stopped.catch(() => {})

    recorder.start(500)
    await video.play()

    await new Promise((resolve, reject) => {
      let lastTime = -1
      let lastChange = performance.now()
      video.onended = () => resolve()
      const tick = () => {
        if (signal?.aborted) return reject(abortError())
        if (video.ended) return resolve()
        try { draw() } catch (e) { return reject(e) }
        onProgress?.(Math.min(1, video.currentTime / duration))
        const now = performance.now()
        if (video.currentTime !== lastTime) {
          lastTime = video.currentTime
          lastChange = now
        } else if (now - lastChange > 10000) {
          return reject(new Error('Export stalled. Keep this tab open and visible, then try again.'))
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })

    draw()
    onProgress?.(1)
    if (recorder.state !== 'inactive') recorder.stop()
    await stopped

    const blob = new Blob(chunks, { type: format.mime.split(';')[0] })
    if (!blob.size) throw new Error('The exported video is empty.')
    return { blob, width, height, audioCaptured }
  } finally {
    cleanup()
  }
}
