import { useState } from 'react'
import { Sparkles, Copy, RefreshCw, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import Toast from '../components/Toast.jsx'
import Button from '../components/Button.jsx'
import { useToast } from '../hooks/useToast.js'
import { captionProvider } from '../utils/captionTemplates.js'
import { generateAICaption } from '../utils/captionApi.js'
import { loadSettings } from '../utils/storage.js'

const platforms = [
  { id: 'instagram', name: 'Instagram Reels' },
  { id: 'facebook', name: 'Facebook Reels' },
  { id: 'youtube', name: 'YouTube Shorts' },
]
const tones = ['professional', 'friendly', 'funny', 'emotional', 'promotional']
const lengths = ['short', 'medium', 'long']

export default function CaptionsPage() {
  const { notice, showNotice, dismiss } = useToast()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [language, setLanguage] = useState(() => loadSettings().captionLanguage)
  const [tone, setTone] = useState('friendly')
  const [length, setLength] = useState('medium')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [variant, setVariant] = useState(0)
  const [providerName, setProviderName] = useState('Hybrid: AI + local fallback')

  async function run(nextVariant) {
    setLoading(true)
    setError('')

    const options = { topic, platform, language, tone, length, variant: nextVariant }

    try {
      let result
      let usedAI = false

      try {
        const response = await generateAICaption(options)
        if (typeof response.caption !== 'string' || typeof response.hashtags !== 'string') {
          throw new Error('AI returned an invalid caption response.')
        }
        result = response
        usedAI = true
      } catch (aiError) {
        // Keep validation errors visible; use local fallback for provider/network failures.
        if (aiError.status === 400) throw aiError
        result = await captionProvider.generate(options)
      }

      setCaption(result.caption)
      setHashtags(result.hashtags)
      setVariant(nextVariant)
      setProviderName(usedAI ? 'OpenAI' : 'Local templates')
      showNotice(
        'Draft ready',
        usedAI
          ? 'AI-generated draft ready. Review it before posting.'
          : 'AI unavailable or out of credits. Local template draft created; review and edit it.',
        'success'
      )
    } catch (err) {
      setError(err.message || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  async function copy(value, label) {
    if (!value.trim()) {
      showNotice('Nothing to copy', `Add some ${label.toLowerCase()} first.`, 'error')
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      showNotice(`${label} copied`, 'Copied to your clipboard.', 'success')
    } catch {
      showNotice('Copy unavailable', 'Select the text and copy it manually.', 'error')
    }
  }

  const tagCount = hashtags.trim() ? hashtags.trim().split(/\s+/).length : 0
  const hasOutput = caption || hashtags

  return (
    <div className="rf-page">
      <div className="rf-page-head">
        <div>
          <h1>Captions &amp; Hashtags</h1>
          <p>Draft post copy for your short-form video.</p>
        </div>
        <span className="rf-chip">{providerName}</span>
      </div>

      <div className="rf-note"><AlertCircle size={15} /> AI is tried first. If it is unavailable or out of credits, local templates are used. Review every draft before posting.</div>

      <div className="rf-two-col">
        <section className="rf-card rf-form" aria-labelledby="cp-title">
          <h2 id="cp-title" className="rf-h2">Brief</h2>
          <label className="rf-field"><span>Topic or video description</span>
            <textarea rows={3} maxLength={300} value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Morning routine for productive days" />
          </label>
          <div className="rf-field-row">
            <label className="rf-field"><span>Platform</span>
              <select value={platform} onChange={e => setPlatform(e.target.value)}>
                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="rf-field"><span>Language</span>
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </label>
            <label className="rf-field"><span>Tone</span>
              <select value={tone} onChange={e => setTone(e.target.value)}>
                {tones.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
              </select>
            </label>
            <label className="rf-field"><span>Caption length</span>
              <select value={length} onChange={e => setLength(e.target.value)}>
                {lengths.map(l => <option key={l} value={l}>{l[0].toUpperCase() + l.slice(1)}</option>)}
              </select>
            </label>
          </div>
          {error && <p className="rf-error" role="alert"><AlertCircle size={14} /> {error}</p>}
          <Button icon={loading ? Loader2 : Sparkles} disabled={loading} onClick={() => run(0)}>
            {loading ? 'Generating...' : 'Generate draft'}
          </Button>
        </section>

        <section className="rf-card rf-form" aria-labelledby="out-title">
          <h2 id="out-title" className="rf-h2">Your draft</h2>
          {!hasOutput && !loading && (
            <div className="rf-empty">
              <strong>No draft yet</strong>
              <span>Fill in the brief and press Generate, or type your own caption below.</span>
            </div>
          )}
          <label className="rf-field"><span>Caption</span>
            <textarea dir="auto" rows={6} maxLength={2200} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Your caption" />
          </label>
          <div className="rf-meta"><span>{caption.length} / 2,200</span>
            <button className="text-button" onClick={() => setCaption('')}><RotateCcw size={13} /> Clear</button></div>
          <label className="rf-field"><span>Hashtags ({tagCount})</span>
            <textarea dir="auto" rows={3} value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#YourTopic" />
          </label>
          <div className="rf-actions">
            <Button variant="secondary" icon={Copy} onClick={() => copy(caption, 'Caption')}>Copy caption</Button>
            <Button variant="secondary" icon={Copy} onClick={() => copy(hashtags, 'Hashtags')}>Copy hashtags</Button>
            <Button variant="secondary" icon={Copy} onClick={() => copy(`${caption}\n\n${hashtags}`.trim(), 'Caption and hashtags')}>Copy all</Button>
            <Button variant="secondary" icon={RefreshCw} disabled={loading || !topic.trim()} onClick={() => run(variant + 1)}>Regenerate</Button>
          </div>
        </section>
      </div>
      <Toast notice={notice} onDismiss={dismiss} />
    </div>
  )
}
