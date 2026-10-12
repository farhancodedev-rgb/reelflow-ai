import { Plus, Trash2, AlertCircle } from 'lucide-react'
import Button from './Button.jsx'
import { makeId } from '../utils/storage.js'
import { TEXT_COLORS } from '../utils/overlayDraw.js'

const STYLES = [['box', 'Box'], ['outline', 'Outline'], ['plain', 'Plain']]
const POSITIONS = [['top', 'Top'], ['center', 'Center'], ['bottom', 'Bottom']]
const round1 = n => Math.round(n * 10) / 10

function cueProblem(c, duration) {
  if (!c.text.trim()) return 'Add the subtitle text.'
  if (!Number.isFinite(c.start) || !Number.isFinite(c.end)) return 'Enter both start and end times.'
  if (c.start < 0) return 'Start cannot be negative.'
  if (c.end <= c.start) return 'End must be after start.'
  if (Number.isFinite(duration) && c.start >= duration) return 'This starts after the video ends.'
  return ''
}

export default function SubtitleEditor({ subtitles, update, getTime, duration, disabled }) {
  const items = subtitles.items
  const setItems = next => update('items', next)
  const patch = (id, changes) => setItems(items.map(c => (c.id === id ? { ...c, ...changes } : c)))
  const num = value => (value === '' ? NaN : Number(value))

  function add() {
    const start = round1(getTime())
    const limit = Number.isFinite(duration) ? duration : start + 3
    const end = round1(Math.min(start + 3, limit))
    setItems([...items, { id: makeId(), start, end: end > start ? end : round1(start + 1), text: '' }])
  }

  return (
    <section className="rf-card rf-form" aria-labelledby="sub-title">
      <h2 id="sub-title" className="rf-h2">Subtitles</h2>
      <div className="rf-note"><AlertCircle size={15} /> Manual subtitles. You type the text and timing yourself; nothing is transcribed automatically.</div>
      <fieldset className="rf-fieldset" disabled={disabled}>
        <div className="rf-field"><span>Style</span>
          <div className="rf-segment">
            {STYLES.map(([id, name]) => (
              <button key={id} className={subtitles.style === id ? 'rf-seg-on' : ''} aria-pressed={subtitles.style === id} onClick={() => update('style', id)}>{name}</button>
            ))}
          </div>
        </div>
        <div className="rf-field"><span>Position</span>
          <div className="rf-segment">
            {POSITIONS.map(([id, name]) => (
              <button key={id} className={subtitles.position === id ? 'rf-seg-on' : ''} aria-pressed={subtitles.position === id} onClick={() => update('position', id)}>{name}</button>
            ))}
          </div>
        </div>
        <div className="rf-field"><span>Text color</span>
          <div className="rf-segment">
            {TEXT_COLORS.map(c => (
              <button key={c.value} className={subtitles.color === c.value ? 'rf-seg-on' : ''} aria-pressed={subtitles.color === c.value} onClick={() => update('color', c.value)}>{c.name}</button>
            ))}
          </div>
        </div>
        <label className="rf-field"><span>Text size: {subtitles.size}</span>
          <input type="range" min="24" max="100" step="2" value={subtitles.size} onChange={e => update('size', Number(e.target.value))} />
        </label>

        {items.length === 0 ? (
          <div className="rf-empty"><strong>No subtitles yet</strong><span>Play or pause the video where a line should start, then add it.</span></div>
        ) : (
          <ul className="rf-cues">
            {items.map((c, i) => {
              const problem = cueProblem(c, duration)
              return (
                <li key={c.id} className="rf-cue">
                  <label className="rf-field"><span>Subtitle {i + 1}</span>
                    <input dir="auto" maxLength={120} value={c.text} onChange={e => patch(c.id, { text: e.target.value })} placeholder="Subtitle text" />
                  </label>
                  <div className="rf-cue-times">
                    <label className="rf-field"><span>Start (s)</span>
                      <input type="number" min="0" step="0.1" inputMode="decimal" value={Number.isFinite(c.start) ? c.start : ''} onChange={e => patch(c.id, { start: num(e.target.value) })} />
                    </label>
                    <label className="rf-field"><span>End (s)</span>
                      <input type="number" min="0" step="0.1" inputMode="decimal" value={Number.isFinite(c.end) ? c.end : ''} onChange={e => patch(c.id, { end: num(e.target.value) })} />
                    </label>
                    <button type="button" className="rf-icon-btn rf-danger" onClick={() => setItems(items.filter(x => x.id !== c.id))} aria-label={`Delete subtitle ${i + 1}`} title="Delete"><Trash2 size={16} /></button>
                  </div>
                  {problem && <p className="rf-error" role="alert"><AlertCircle size={14} /> {problem} This line is skipped until fixed.</p>}
                </li>
              )
            })}
          </ul>
        )}
        <Button variant="secondary" icon={Plus} onClick={add}>Add subtitle at current time</Button>
      </fieldset>
    </section>
  )
}
