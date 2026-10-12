import { useEffect, useRef, useState } from 'react'
import { Download, ImagePlus, X, AlignLeft, AlignCenter, AlignRight, AlertCircle } from 'lucide-react'
import Toast from '../components/Toast.jsx'
import Button from '../components/Button.jsx'
import { useToast } from '../hooks/useToast.js'
import { drawCover, backgrounds, textColors, COVER_W, COVER_H } from '../utils/coverCanvas.js'

const layouts = [
  { id: 'center', name: 'Centered', align: 'center', fontSize: 120 },
  { id: 'top', name: 'Top title', align: 'left', fontSize: 110 },
  { id: 'bottom', name: 'Bottom title', align: 'center', fontSize: 100 },
]
const aligns = [
  { id: 'left', icon: AlignLeft, label: 'Align left' },
  { id: 'center', icon: AlignCenter, label: 'Align center' },
  { id: 'right', icon: AlignRight, label: 'Align right' },
]

export default function CoverDesignerPage() {
  const { notice, showNotice, dismiss } = useToast()
  const canvasRef = useRef(null)
  const fileRef = useRef(null)

  const [headline, setHeadline] = useState('Your next big story')
  const [subtext, setSubtext] = useState('A moment worth sharing')
  const [bg, setBg] = useState('aurora')
  const [layout, setLayout] = useState('center')
  const [align, setAlign] = useState('center')
  const [fontSize, setFontSize] = useState(120)
  const [textColor, setTextColor] = useState('#ffffff')
  const [dim, setDim] = useState(40)
  const [imageFile, setImageFile] = useState(null)
  const [image, setImage] = useState(null)

  useEffect(() => {
    if (!imageFile) {
      setImage(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    const element = new Image()
    element.onload = () => setImage(element)
    element.onerror = () => {
      setImageFile(null)
      showNotice('Image could not be loaded', 'Please choose a valid image file.', 'error')
    }
    element.src = url
    return () => URL.revokeObjectURL(url)
  }, [imageFile, showNotice])

  useEffect(() => {
    if (canvasRef.current) {
      drawCover(canvasRef.current, { headline, subtext, bg, layout, align, fontSize, textColor, dim, image })
    }
  }, [headline, subtext, bg, layout, align, fontSize, textColor, dim, image])

  function chooseImage(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showNotice('Unsupported file', 'Please choose a JPG, PNG or WebP image.', 'error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      showNotice('Image is too large', 'Please choose an image under 10 MB.', 'error')
      return
    }
    setImageFile(file)
  }

  function applyLayout(item) {
    setLayout(item.id)
    setAlign(item.align)
    setFontSize(item.fontSize)
  }

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!headline.trim() && !subtext.trim()) {
      showNotice('Add some text', 'Write a headline or supporting text first.', 'error')
      return
    }
    canvas.toBlob(blob => {
      if (!blob) {
        showNotice('Export failed', 'Your browser could not create the image.', 'error')
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'reelflow-cover.png'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
      showNotice('Cover downloaded', `Saved as a ${COVER_W}×${COVER_H} PNG.`, 'success')
    }, 'image/png')
  }

  return (
    <div className="rf-page">
      <div className="rf-page-head">
        <div>
          <h1>Cover Designer</h1>
          <p>Design a vertical 9:16 cover and download it as a PNG.</p>
        </div>
        <Button icon={Download} onClick={download}>Download PNG</Button>
      </div>

      <div className="rf-note"><AlertCircle size={15} /> The cover is a separate image. It is not attached to your video or uploaded anywhere.</div>

      <div className="rf-cover-layout">
        <div className="rf-cover-stage">
          <canvas
            ref={canvasRef}
            className="rf-cover-canvas"
            role="img"
            aria-label={`Cover preview: ${headline || 'untitled'}`}
          />
        </div>

        <section className="rf-card rf-form" aria-label="Cover controls">
          <label className="rf-field"><span>Headline</span>
            <input dir="auto" maxLength={80} value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Your headline" />
          </label>
          <label className="rf-field"><span>Supporting text</span>
            <input dir="auto" maxLength={120} value={subtext} onChange={e => setSubtext(e.target.value)} placeholder="Optional supporting line" />
          </label>

          <div className="rf-field"><span>Background</span>
            <div className="rf-swatches">
              {backgrounds.map(item => (
                <button
                  key={item.id}
                  className={`rf-swatch ${bg === item.id ? 'rf-swatch-on' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})` }}
                  onClick={() => setBg(item.id)}
                  aria-pressed={bg === item.id}
                  aria-label={`${item.name} background`}
                  title={item.name}
                />
              ))}
            </div>
          </div>

          <div className="rf-field"><span>Layout preset</span>
            <div className="rf-segment">
              {layouts.map(item => (
                <button key={item.id} className={layout === item.id ? 'rf-seg-on' : ''} aria-pressed={layout === item.id} onClick={() => applyLayout(item)}>{item.name}</button>
              ))}
            </div>
          </div>

          <div className="rf-field-row">
            <div className="rf-field"><span>Text alignment</span>
              <div className="rf-segment">
                {aligns.map(item => {
                  const Icon = item.icon
                  return <button key={item.id} className={align === item.id ? 'rf-seg-on' : ''} aria-pressed={align === item.id} aria-label={item.label} onClick={() => setAlign(item.id)}><Icon size={16} /></button>
                })}
              </div>
            </div>
            <div className="rf-field"><span>Text color</span>
              <div className="rf-segment">
                {textColors.map(item => (
                  <button key={item.id} className={textColor === item.value ? 'rf-seg-on' : ''} aria-pressed={textColor === item.value} onClick={() => setTextColor(item.value)}>{item.name}</button>
                ))}
              </div>
            </div>
          </div>

          <label className="rf-field"><span>Font size: {fontSize}px</span>
            <input type="range" min="48" max="180" step="2" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
          </label>

          <div className="rf-field"><span>Background image (optional)</span>
            <input ref={fileRef} type="file" accept="image/*" className="visually-hidden" onChange={e => { chooseImage(e.target.files?.[0]); e.target.value = '' }} />
            <div className="rf-actions">
              <Button variant="secondary" icon={ImagePlus} onClick={() => fileRef.current?.click()}>{imageFile ? 'Replace image' : 'Choose image'}</Button>
              {imageFile && <Button variant="secondary" icon={X} onClick={() => setImageFile(null)}>Remove</Button>}
            </div>
            {imageFile && <small>{imageFile.name}</small>}
          </div>

          {imageFile && (
            <label className="rf-field"><span>Image darkening: {dim}%</span>
              <input type="range" min="0" max="80" step="5" value={dim} onChange={e => setDim(Number(e.target.value))} />
            </label>
          )}
        </section>
      </div>
      <Toast notice={notice} onDismiss={dismiss} />
    </div>
  )
}
