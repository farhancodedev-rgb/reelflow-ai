export const COVER_W = 1080
export const COVER_H = 1920

const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Naskh Arabic', sans-serif"

export const backgrounds = [
  { id: 'aurora', name: 'Aurora', colors: ['#8b5cf6', '#3b82f6'] },
  { id: 'midnight', name: 'Midnight', colors: ['#0b1020', '#1e293b'] },
  { id: 'sunset', name: 'Sunset', colors: ['#f97316', '#db2777'] },
  { id: 'forest', name: 'Forest', colors: ['#065f46', '#0e7490'] },
  { id: 'rose', name: 'Rose', colors: ['#be185d', '#7c3aed'] },
  { id: 'mono', name: 'Mono', colors: ['#111111', '#3a3a3a'] },
]

export const textColors = [
  { id: 'white', name: 'White', value: '#ffffff' },
  { id: 'yellow', name: 'Yellow', value: '#fde047' },
  { id: 'black', name: 'Black', value: '#0b0b0b' },
]

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

const isRtl = text => /[\u0590-\u08FF]/.test(text)

export function drawCover(canvas, o) {
  canvas.width = COVER_W
  canvas.height = COVER_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  const bg = backgrounds.find(b => b.id === o.bg) || backgrounds[0]
  const gradient = ctx.createLinearGradient(0, 0, COVER_W, COVER_H)
  gradient.addColorStop(0, bg.colors[0])
  gradient.addColorStop(1, bg.colors[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, COVER_W, COVER_H)

  if (o.image && o.image.naturalWidth) {
    const scale = Math.max(COVER_W / o.image.naturalWidth, COVER_H / o.image.naturalHeight)
    const w = o.image.naturalWidth * scale
    const h = o.image.naturalHeight * scale
    ctx.drawImage(o.image, (COVER_W - w) / 2, (COVER_H - h) / 2, w, h)
    ctx.fillStyle = `rgba(0,0,0,${o.dim / 100})`
    ctx.fillRect(0, 0, COVER_W, COVER_H)
  }

  const padding = 90
  const maxWidth = COVER_W - padding * 2
  const headSize = o.fontSize
  const subSize = Math.round(headSize * 0.4)

  const blocks = []
  const headline = (o.headline || '').trim()
  const subtext = (o.subtext || '').trim()

  ctx.direction = isRtl(headline + subtext) ? 'rtl' : 'ltr'

  ctx.font = `800 ${headSize}px ${FONT}`
  const headLines = wrapLines(ctx, headline, maxWidth).slice(0, 6)
  if (headLines.length) blocks.push({ lines: headLines, size: headSize, weight: 800, lh: 1.15 })

  ctx.font = `500 ${subSize}px ${FONT}`
  const subLines = wrapLines(ctx, subtext, maxWidth).slice(0, 4)
  if (subLines.length) blocks.push({ lines: subLines, size: subSize, weight: 500, lh: 1.3 })

  const gap = 40
  const heights = blocks.map(b => b.lines.length * b.size * b.lh)
  const total = heights.reduce((a, b) => a + b, 0) + gap * Math.max(0, blocks.length - 1)

  // keep text clear of the platform UI zones at top and bottom
  let y
  if (o.layout === 'top') y = 220
  else if (o.layout === 'bottom') y = COVER_H - total - 380
  else y = (COVER_H - total) / 2

  const x = o.align === 'left' ? padding : o.align === 'right' ? COVER_W - padding : COVER_W / 2
  ctx.textAlign = o.align
  ctx.textBaseline = 'top'
  ctx.fillStyle = o.textColor
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 14

  blocks.forEach((block, index) => {
    ctx.font = `${block.weight} ${block.size}px ${FONT}`
    block.lines.forEach(line => {
      ctx.fillText(line, x, y)
      y += block.size * block.lh
    })
    if (index < blocks.length - 1) y += gap
  })
  return true
}
