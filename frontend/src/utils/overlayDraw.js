// Shared by the live preview canvas and the export pipeline.
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Naskh Arabic', sans-serif"
const POSITIONS = { top: 0.14, center: 0.5, bottom: 0.74 }

export const TEXT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Yellow', value: '#fde047' },
  { name: 'Black', value: '#0b0b0b' },
]

export const isValidCue = cue =>
  Boolean(cue) &&
  typeof cue.text === 'string' &&
  cue.text.trim().length > 0 &&
  Number.isFinite(cue.start) &&
  Number.isFinite(cue.end) &&
  cue.start >= 0 &&
  cue.end > cue.start

const isRtl = text => /[\u0590-\u08FF]/.test(text)

function isDark(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return false
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b < 110
}

function fillRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
  ctx.fill()
}

function wrapLines(ctx, text, maxWidth) {
  const lines = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

// mode: 'box' | 'outline' | 'plain'
function drawBlock(ctx, width, height, text, { size, color, position, mode }) {
  const clean = (text || '').trim()
  if (!clean) return
  const scale = Math.min(width, height) / 1080
  const fontPx = Math.max(10, Math.round(size * scale))
  const dark = isDark(color)

  ctx.save()
  ctx.font = `700 ${fontPx}px ${FONT}`
  ctx.direction = isRtl(clean) ? 'rtl' : 'ltr'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const lines = wrapLines(ctx, clean, width * 0.86).slice(0, 5)
  if (!lines.length) {
    ctx.restore()
    return
  }
  const lineHeight = fontPx * 1.25
  const pad = fontPx * 0.35
  const boxH = lines.length * lineHeight + pad * 2
  const widest = Math.max(...lines.map(l => ctx.measureText(l).width))

  let top = height * (POSITIONS[position] ?? POSITIONS.bottom) - boxH / 2
  top = Math.min(Math.max(top, height * 0.04), height * 0.96 - boxH)
  const cx = width / 2

  if (mode === 'box') {
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.62)'
    fillRoundRect(ctx, cx - widest / 2 - pad, top, widest + pad * 2, boxH, fontPx * 0.25)
  }

  lines.forEach((line, i) => {
    const y = top + pad + i * lineHeight + (lineHeight - fontPx) / 2
    if (mode === 'outline') {
      ctx.lineJoin = 'round'
      ctx.lineWidth = fontPx * 0.16
      ctx.strokeStyle = dark ? '#ffffff' : '#000000'
      ctx.strokeText(line, cx, y)
    } else if (mode === 'plain') {
      ctx.shadowColor = dark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)'
      ctx.shadowBlur = fontPx * 0.2
    }
    ctx.fillStyle = color
    ctx.fillText(line, cx, y)
    ctx.shadowBlur = 0
  })
  ctx.restore()
}

export function drawOverlays(ctx, width, height, time, overlay, subtitles) {
  if (overlay && overlay.text) {
    drawBlock(ctx, width, height, overlay.text, {
      size: overlay.size,
      color: overlay.color,
      position: overlay.position,
      mode: overlay.background ? 'box' : 'outline',
    })
  }
  if (subtitles) {
    const cue = subtitles.items.find(c => isValidCue(c) && time >= c.start && time < c.end)
    if (cue) {
      drawBlock(ctx, width, height, cue.text, {
        size: subtitles.size,
        color: subtitles.color,
        position: subtitles.position,
        mode: subtitles.style,
      })
    }
  }
}
