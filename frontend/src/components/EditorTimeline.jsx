import { useEffect, useRef, useState } from 'react'

const formatTime = value => {
  if (!Number.isFinite(value)) return '0:00'
  const seconds = Math.max(0, Math.floor(value))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

const roundTime = value => Math.round(value * 10) / 10

export default function EditorTimeline({
  videoRef,
  duration,
  subtitles,
  update,
  disabled
}) {
  const [currentTime, setCurrentTime] = useState(0)
  const dragRef = useRef(null)
  const total = Number.isFinite(duration) && duration > 0 ? duration : 0
  const items = subtitles?.items || []

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const sync = () => setCurrentTime(video.currentTime || 0)
    const events = ['timeupdate', 'seeked', 'loadedmetadata', 'durationchange']
    events.forEach(event => video.addEventListener(event, sync))
    sync()

    return () => {
      events.forEach(event => video.removeEventListener(event, sync))
    }
  }, [videoRef, duration])

  function seek(value) {
    const next = Number(value)
    const safeTime = Math.max(0, Math.min(next, total))
    setCurrentTime(safeTime)

    const video = videoRef.current
    if (video && Number.isFinite(safeTime)) {
      try {
        video.currentTime = safeTime
      } catch {
        // The browser may not be ready to seek yet.
      }
    }
  }

  function startDrag(event, item) {
    if (disabled || !total || event.button !== 0) return

    const start = Number(item.start)
    const end = Number(item.end)
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return

    dragRef.current = {
      id: item.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      originalStart: start,
      originalEnd: end,
      moved: false
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId || !total) return

    const track = event.currentTarget.parentElement
    const width = track?.getBoundingClientRect().width
    if (!width) return

    const deltaPixels = event.clientX - drag.startX
    if (Math.abs(deltaPixels) > 2) drag.moved = true

    if (!drag.moved) return

    const originalLength = drag.originalEnd - drag.originalStart
    const maxStart = Math.max(0, total - originalLength)
    const deltaSeconds = (deltaPixels / width) * total
    const nextStart = roundTime(
      Math.max(0, Math.min(drag.originalStart + deltaSeconds, maxStart))
    )
    const nextEnd = roundTime(Math.min(total, nextStart + originalLength))

    update?.('items', items.map(item =>
      item.id === drag.id
        ? { ...item, start: nextStart, end: nextEnd }
        : item
    ))
  }

  function endDrag(event) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
  }

  return (
    <section className="rf-card rf-editor-timeline" aria-label="Video timeline">
      <div className="rf-timeline-heading">
        <div>
          <h2 className="rf-h2">Timeline</h2>
          <p>Scrub through your video and adjust subtitle timing.</p>
        </div>
        <span className="rf-timeline-time">
          {formatTime(currentTime)} <span>/</span> {formatTime(total)}
        </span>
      </div>

      <label className="rf-timeline-scrubber">
        <span className="visually-hidden">Video playback position</span>
        <input
          type="range"
          min="0"
          max={total || 1}
          step="0.1"
          value={Math.min(currentTime, total || 0)}
          disabled={disabled || !total}
          onChange={event => seek(event.target.value)}
          style={{
            '--rf-timeline-progress':
              `${total ? (currentTime / total) * 100 : 0}%`
          }}
        />
      </label>

      <div className="rf-timeline-lane-heading">
        <span>SUBTITLES</span>
        <span>{items.length} {items.length === 1 ? 'clip' : 'clips'}</span>
      </div>

      <div className="rf-timeline-track" role="list" aria-label="Subtitle clips">
        {items.length === 0 ? (
          <p className="rf-timeline-empty">Add subtitles to see clips here.</p>
        ) : (
          items.map((item, index) => {
            const start = Number(item.start)
            const end = Number(item.end)
            const valid = total > 0 &&
              Number.isFinite(start) &&
              Number.isFinite(end) &&
              end > start &&
              start < total &&
              end <= total

            const left = valid ? Math.max(0, start / total * 100) : 0
            const width = valid
              ? Math.max(1.5, Math.min(100 - left, (end - start) / total * 100))
              : 0

            return (
              <button
                key={item.id}
                type="button"
                className="rf-timeline-clip"
                role="listitem"
                title={`${formatTime(start)}–${formatTime(end)}: ${item.text || 'Untitled subtitle'}`}
                aria-label={`Subtitle ${index + 1}, ${formatTime(start)} to ${formatTime(end)}. Drag to change timing.`}
                style={{ left: `${left}%`, width: `${width}%` }}
                disabled={disabled || !valid}
                onPointerDown={event => startDrag(event, item)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClick={() => {
                  if (!dragRef.current) seek(start)
                }}
              >
                <span>{item.text || `Subtitle ${index + 1}`}</span>
              </button>
            )
          })
        )}
      </div>

      <p className="rf-timeline-footnote">
        Drag a subtitle clip to change its timing without changing its duration.
        Use the Subtitles panel to edit text or adjust start and end separately.
      </p>
    </section>
  )
}
