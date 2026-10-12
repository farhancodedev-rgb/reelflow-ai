import { useEffect, useMemo, useRef, useState } from 'react'
import { Upload, X, Download, Square, Film, AlertCircle, FileVideo } from 'lucide-react'
import Toast from '../components/Toast.jsx'
import Button from '../components/Button.jsx'
import VideoPreview from '../components/VideoPreview.jsx'
import EditorTimeline from '../components/EditorTimeline.jsx'
import TextOverlay from '../components/TextOverlay.jsx'
import SubtitleEditor from '../components/SubtitleEditor.jsx'
import { useToast } from '../hooks/useToast.js'
import { VIDEO_ACCEPT } from '../hooks/useVideoFile.js'
import { exportVideo, getExportSize, getSupportedFormats } from '../utils/exportVideo.js'
import { drawOverlays } from '../utils/overlayDraw.js'

const RATIOS = ['9:16', '1:1', '16:9']
const FILLS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Navy', value: '#0b1020' },
]

const fmtDuration = s => {
  if (!Number.isFinite(s)) return ''
  const t = Math.floor(s)
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}
const fmtMB = b => `${(b / 1048576).toFixed(2)} MB`

export default function EditorPage({ video, editor }) {
  const { notice, showNotice, dismiss } = useToast()
  const { settings, update, overlay, updateOverlay, subtitles, updateSubtitles } = editor
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const abortRef = useRef(null)
  const formats = useMemo(() => getSupportedFormats(), [])
  const format = formats.find(f => f.id === settings.formatId) || formats[0]
  const size = getExportSize(settings.ratio, settings.quality)

  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => () => abortRef.current?.abort(), [])
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url) }, [result])

  function choose(file) {
    if (!file) return
    const problem = video.select(file)
    if (problem) return showNotice('Cannot use this file', problem, 'error')
    setResult(null)
    setError('')
    showNotice('Video selected', 'Ready for local preview. Nothing is uploaded.', 'success')
  }

  function removeVideo() {
    video.remove()
    setResult(null)
    setError('')
  }

  async function runExport() {
    if (!video.url || !format) return
    const controller = new AbortController()
    abortRef.current = controller
    setBusy(true)
    setProgress(0)
    setError('')
    setResult(null)
    try {
      const out = await exportVideo({
        url: video.url,
        ratio: settings.ratio,
        quality: settings.quality,
        fps: settings.fps,
        includeAudio: settings.includeAudio,
        format,
        fit: settings.fit,
        fillColor: settings.fillColor,
        signal: controller.signal,
        drawExtras: (ctx, { width, height, time }) => drawOverlays(ctx, width, height, time, overlay, subtitles),
        onProgress: p => setProgress(Math.round(p * 100)),
      })
      const base = video.file.name.replace(/\.[^.]+$/, '')
      setResult({
        url: URL.createObjectURL(out.blob),
        name: `${base}-reelflow-${out.width}x${out.height}.${format.ext}`,
        size: out.blob.size,
        width: out.width,
        height: out.height,
        label: format.label,
        audioCaptured: out.audioCaptured,
      })
      if (settings.includeAudio && !out.audioCaptured) {
        showNotice('Exported without audio', 'No audio track could be captured in this browser. Check the file.', 'error')
      } else {
        showNotice('Export complete', 'Your file is ready to download.', 'success')
      }
    } catch (err) {
      if (err.name === 'AbortError') showNotice('Export cancelled', 'No file was created.')
      else setError(err.message || 'Your browser could not export this video.')
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  return (
    <div className="rf-page">
      <div className="rf-page-head">
        <div><h1>Video Editor</h1><p>Resize, add text and subtitles, then export in your browser.</p></div>
        {video.file && <Button variant="secondary" icon={X} disabled={busy} onClick={removeVideo}>Remove video</Button>}
      </div>

      <div className="rf-note"><AlertCircle size={15} /> Your video stays in this browser. Text overlay and manual subtitles are drawn into the export; always play the downloaded file to check it.</div>

      <input ref={fileRef} type="file" accept={VIDEO_ACCEPT} className="visually-hidden"
        onChange={e => { choose(e.target.files?.[0]); e.target.value = '' }} />

      <div className="rf-editor-layout">
        <div className="rf-card rf-form rf-editor-left">
          {!video.url ? (
            <div
              className={`rf-drop ${dragging ? 'rf-drop-on' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files?.[0]) }}
            >
              <FileVideo size={30} />
              <strong>Drop your video here</strong>
              <span>MP4, MOV or WebM, up to 100 MB</span>
              <Button icon={Upload} onClick={() => fileRef.current?.click()}>Browse files</Button>
            </div>
          ) : (
            <>
              <VideoPreview
                videoRef={videoRef}
                url={video.url}
                ratio={settings.ratio}
                fit={settings.fit}
                fillColor={settings.fillColor}
                size={size}
                overlay={overlay}
                subtitles={subtitles}
                onMetadata={video.onMetadata}
              />
              <EditorTimeline
                videoRef={videoRef}
                duration={video.meta?.duration}
                subtitles={subtitles}
                disabled={busy}
              />
              <div className="rf-meta-block">
                <strong dir="auto">{video.file.name}</strong>
                <span>
                  {fmtMB(video.file.size)}
                  {video.meta ? ` · ${fmtDuration(video.meta.duration)} · ${video.meta.width}×${video.meta.height}` : ''}
                </span>
              </div>
              <Button variant="secondary" icon={Upload} disabled={busy} onClick={() => fileRef.current?.click()}>Replace video</Button>
            </>
          )}
        </div>

        <div className="rf-editor-right">
          <TextOverlay overlay={overlay} update={updateOverlay} disabled={busy} />
          <SubtitleEditor
            subtitles={subtitles}
            update={updateSubtitles}
            getTime={() => videoRef.current?.currentTime || 0}
            duration={video.meta?.duration}
            disabled={busy}
          />

          <section className="rf-card rf-form" aria-label="Export settings">
            <h2 className="rf-h2">Export</h2>
            <fieldset className="rf-fieldset" disabled={busy}>
              <div className="rf-field"><span>Aspect ratio</span>
                <div className="rf-segment">
                  {RATIOS.map(r => (
                    <button key={r} className={settings.ratio === r ? 'rf-seg-on' : ''} aria-pressed={settings.ratio === r} onClick={() => update('ratio', r)}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="rf-field"><span>Framing</span>
                <div className="rf-segment">
                  <button className={settings.fit === 'crop' ? 'rf-seg-on' : ''} aria-pressed={settings.fit === 'crop'} onClick={() => update('fit', 'crop')}>Fill (crop)</button>
                  <button className={settings.fit === 'fit' ? 'rf-seg-on' : ''} aria-pressed={settings.fit === 'fit'} onClick={() => update('fit', 'fit')}>Fit (bars)</button>
                </div>
              </div>
              <div className="rf-field"><span>Canvas fill</span>
                <div className="rf-segment">
                  {FILLS.map(f => (
                    <button key={f.value} className={settings.fillColor === f.value ? 'rf-seg-on' : ''} aria-pressed={settings.fillColor === f.value} onClick={() => update('fillColor', f.value)}>{f.name}</button>
                  ))}
                </div>
              </div>
              <div className="rf-field-row">
                <label className="rf-field"><span>Resolution</span>
                  <select value={settings.quality} onChange={e => update('quality', e.target.value)}>
                    <option>1080p</option><option>720p</option>
                  </select>
                </label>
                <label className="rf-field"><span>Frame rate</span>
                  <select value={settings.fps} onChange={e => update('fps', Number(e.target.value))}>
                    <option value={24}>24 fps</option><option value={30}>30 fps</option>
                  </select>
                </label>
                <label className="rf-field"><span>Format</span>
                  <select value={format?.id || ''} onChange={e => update('formatId', e.target.value)} disabled={!formats.length}>
                    {formats.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </label>
              </div>
              <label className="rf-check">
                <input type="checkbox" checked={settings.includeAudio} onChange={e => update('includeAudio', e.target.checked)} />
                <span>Include audio<small>When on, the video plays out loud while it is being recorded.</small></span>
              </label>
            </fieldset>

            <p className="rf-hint">
              Output: {size.width}×{size.height} · {format ? format.label : 'no format available'} · {settings.fps} fps
            </p>
            {!formats.length && <p className="rf-error" role="alert"><AlertCircle size={14} /> This browser cannot record video, so export is unavailable.</p>}

            {busy ? (
              <>
                <div className="rf-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Export progress">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <p className="rf-hint">Exporting {progress}%. Keep this tab open and visible until it finishes.</p>
                <Button variant="secondary" icon={Square} onClick={() => abortRef.current?.abort()}>Cancel export</Button>
              </>
            ) : (
              <Button icon={Film} disabled={!video.url || !format} onClick={runExport}>Export video</Button>
            )}

            {error && <p className="rf-error" role="alert"><AlertCircle size={14} /> {error}</p>}

            {result && (
              <div className="rf-result">
                <strong>Export ready</strong>
                <span>{result.width}×{result.height} · {result.label} · {fmtMB(result.size)} · {result.audioCaptured ? 'with audio' : 'no audio track'}</span>
                <a className="button-primary rf-link-button" href={result.url} download={result.name}><Download size={16} /> Download</a>
              </div>
            )}
          </section>
        </div>
      </div>
      <Toast notice={notice} onDismiss={dismiss} />
    </div>
  )
}
