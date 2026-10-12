import { useEffect, useRef } from 'react'
import { drawOverlays } from '../utils/overlayDraw.js'

const FRAME_MAX = { '9:16': '340px', '1:1': '440px', '16:9': '100%' }

export default function VideoPreview({ videoRef, url, ratio, fit, fillColor, size, overlay, subtitles, onMetadata }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawOverlays(ctx, canvas.width, canvas.height, video.currentTime, overlay, subtitles)
    }
    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      cancelAnimationFrame(raf)
      loop()
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      draw()
    }

    const redrawEvents = ['timeupdate', 'seeked', 'loadedmetadata']
    const stopEvents = ['pause', 'ended']
    redrawEvents.forEach(e => video.addEventListener(e, draw))
    stopEvents.forEach(e => video.addEventListener(e, stop))
    video.addEventListener('play', start)
    if (video.paused) draw()
    else start()

    return () => {
      cancelAnimationFrame(raf)
      redrawEvents.forEach(e => video.removeEventListener(e, draw))
      stopEvents.forEach(e => video.removeEventListener(e, stop))
      video.removeEventListener('play', start)
    }
  }, [videoRef, url, size.width, size.height, overlay, subtitles])

  return (
    <div
      className="rf-frame"
      style={{ aspectRatio: ratio.replace(':', ' / '), maxWidth: FRAME_MAX[ratio], background: fillColor }}
    >
      <video
        ref={videoRef}
        src={url}
        controls
        playsInline
        style={{ objectFit: fit === 'fit' ? 'contain' : 'cover' }}
        onLoadedMetadata={e => onMetadata(e.currentTarget)}
      />
      <canvas ref={canvasRef} width={size.width} height={size.height} aria-hidden="true" />
    </div>
  )
}
