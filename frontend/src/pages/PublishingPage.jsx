import { useCallback, useState } from 'react'
import { Save, Send, CalendarClock, Check, Circle, AlertCircle } from 'lucide-react'
import Toast from '../components/Toast.jsx'
import Button from '../components/Button.jsx'
import Modal from '../components/Modal.jsx'
import { useToast } from '../hooks/useToast.js'
import { usePosts } from '../hooks/usePosts.js'
import { platformRules, validatePost, publishProvider } from '../utils/publishProvider.js'

const localNow = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

export default function PublishingPage() {
  const { notice, showNotice, dismiss } = useToast()
  const { posts, storageOk, add } = usePosts()
  const [platform, setPlatform] = useState('instagram')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [errors, setErrors] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const close = useCallback(() => setConfirm(null), [])

  const rules = platformRules[platform]
  const checklist = [
    { label: 'Platform selected', done: Boolean(platform) },
    { label: 'Caption written', done: caption.trim().length > 0 },
    { label: 'Hashtags added', done: hashtags.trim().length > 0 },
    { label: 'Video exported (you confirm)', done: videoReady },
  ]

  function saveDraft() {
    const problems = validatePost({ platform, caption, hashtags, needsSchedule: false })
    if (problems.length) return setErrors(problems)
    setErrors([])
    add({ platform, caption, hashtags, status: 'draft', scheduledAt: null })
    showNotice('Draft saved', 'Saved locally in this browser. Nothing was posted.', 'success')
  }

  function ask(kind) {
    const problems = validatePost({ platform, caption, hashtags, scheduledAt, needsSchedule: kind === 'schedule' })
    if (problems.length) return setErrors(problems)
    setErrors([])
    setConfirm(kind)
  }

  async function runDemo() {
    const kind = confirm
    setBusy(true)
    try {
      const result = kind === 'schedule' ? await publishProvider.schedule() : await publishProvider.publish()
      if (!result.ok) throw new Error('The demo provider failed.')
      add({
        platform, caption, hashtags,
        status: kind === 'schedule' ? 'demo-scheduled' : 'demo-published',
        scheduledAt: kind === 'schedule' ? scheduledAt : null,
      })
      showNotice(
        kind === 'schedule' ? 'Demo schedule recorded' : 'Demo publish recorded',
        'This is a local demo entry only. Nothing was posted or scheduled on any platform.',
        'info'
      )
      close()
    } catch (err) {
      showNotice('Action failed', err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const tagCount = hashtags.trim() ? hashtags.trim().split(/\s+/).length : 0

  return (
    <div className="rf-page">
      <div className="rf-page-head">
        <div><h1>Publishing</h1><p>Prepare a post for Reels or Shorts.</p></div>
        <span className="rf-chip">{publishProvider.name}</span>
      </div>

      <div className="rf-note"><AlertCircle size={15} /> Demo workflow. No accounts are connected, so nothing is posted or scheduled on Instagram, Facebook or YouTube. Real publishing needs official APIs and a backend.</div>
      {!storageOk && <p className="rf-error" role="alert"><AlertCircle size={14} /> Browser storage is unavailable, so drafts will be lost on refresh.</p>}

      <div className="rf-two-col">
        <section className="rf-card rf-form" aria-labelledby="pb-title">
          <h2 id="pb-title" className="rf-h2">Post details</h2>
          <label className="rf-field"><span>Platform</span>
            <select value={platform} onChange={e => setPlatform(e.target.value)}>
              {Object.entries(platformRules).map(([id, r]) => <option key={id} value={id}>{r.name}</option>)}
            </select>
          </label>
          <label className="rf-field"><span>Caption</span>
            <textarea dir="auto" rows={5} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write or paste your caption" />
          </label>
          <div className="rf-meta"><span>{caption.length} / {rules.captionMax}</span></div>
          <label className="rf-field"><span>Hashtags ({tagCount} / {rules.maxHashtags})</span>
            <textarea dir="auto" rows={2} value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#Reels #YourTopic" />
          </label>
          <label className="rf-field"><span>Schedule date and time (demo)</span>
            <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </label>
          {errors.length > 0 && (
            <ul className="rf-error rf-error-list" role="alert">{errors.map(e => <li key={e}>{e}</li>)}</ul>
          )}
          <div className="rf-actions">
            <Button variant="secondary" icon={Save} onClick={saveDraft}>Save draft</Button>
            <Button icon={Send} onClick={() => ask('publish')}>Publish now (demo)</Button>
            <Button variant="secondary" icon={CalendarClock} onClick={() => ask('schedule')}>Schedule (demo)</Button>
          </div>
        </section>

        <section className="rf-card rf-form" aria-labelledby="ck-title">
          <h2 id="ck-title" className="rf-h2">Readiness checklist</h2>
          <ul className="rf-check-list">
            {checklist.map(item => (
              <li key={item.label} className={item.done ? 'rf-done' : ''}>
                {item.done ? <Check size={16} /> : <Circle size={16} />} {item.label}
              </li>
            ))}
          </ul>
          <label className="rf-check">
            <input type="checkbox" checked={videoReady} onChange={e => setVideoReady(e.target.checked)} />
            <span>I have exported my video<small>Videos are not stored here, so this is your own confirmation.</small></span>
          </label>
          <a className="rf-more" href="#/schedule">View saved drafts and demo entries</a>
        </section>
      </div>

      <Modal
        open={Boolean(confirm)}
        title={confirm === 'schedule' ? 'Record demo schedule?' : 'Record demo publish?'}
        onClose={close}
        actions={<><Button variant="secondary" onClick={close}>Cancel</Button><Button disabled={busy} onClick={runDemo}>{busy ? 'Working...' : 'Confirm demo'}</Button></>}
      >
        <p>This only adds a labelled demo entry to your local list for {rules.name}. <strong>Nothing will be posted or scheduled on the real platform.</strong></p>
      </Modal>
      <Toast notice={notice} onDismiss={dismiss} />
    </div>
  )
}
