import { Eraser } from 'lucide-react'
import Button from './Button.jsx'
import { TEXT_COLORS } from '../utils/overlayDraw.js'

const POSITIONS = [['top', 'Top'], ['center', 'Center'], ['bottom', 'Bottom']]

export default function TextOverlay({ overlay, update, disabled }) {
  return (
    <section className="rf-card rf-form" aria-labelledby="ov-title">
      <h2 id="ov-title" className="rf-h2">Text overlay</h2>
      <fieldset className="rf-fieldset" disabled={disabled}>
        <label className="rf-field"><span>Text ({overlay.text.length} / 120)</span>
          <textarea dir="auto" rows={2} maxLength={120} value={overlay.text}
            onChange={e => update('text', e.target.value)} placeholder="e.g. Eid Mubarak" />
        </label>
        <div className="rf-field"><span>Position</span>
          <div className="rf-segment">
            {POSITIONS.map(([id, name]) => (
              <button key={id} className={overlay.position === id ? 'rf-seg-on' : ''} aria-pressed={overlay.position === id} onClick={() => update('position', id)}>{name}</button>
            ))}
          </div>
        </div>
        <div className="rf-field"><span>Text color</span>
          <div className="rf-segment">
            {TEXT_COLORS.map(c => (
              <button key={c.value} className={overlay.color === c.value ? 'rf-seg-on' : ''} aria-pressed={overlay.color === c.value} onClick={() => update('color', c.value)}>{c.name}</button>
            ))}
          </div>
        </div>
        <label className="rf-field"><span>Text size: {overlay.size}</span>
          <input type="range" min="24" max="140" step="2" value={overlay.size} onChange={e => update('size', Number(e.target.value))} />
        </label>
        <label className="rf-check">
          <input type="checkbox" checked={overlay.background} onChange={e => update('background', e.target.checked)} />
          <span>Readable background<small>Off uses an outline instead.</small></span>
        </label>
        <Button variant="secondary" icon={Eraser} disabled={!overlay.text} onClick={() => update('text', '')}>Clear overlay</Button>
      </fieldset>
    </section>
  )
}
