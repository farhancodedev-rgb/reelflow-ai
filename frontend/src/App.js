import { useEffect, useRef, useState } from 'react'


import {
  Clapperboard,
  Sparkles,
  Upload,
  Video,
  Scissors,
  Music2,
  Languages,
  Image,
  Camera,
  Users,
  Check,
  Clock,
  Copy,
  X,
  Settings2,
  CircleCheck,
  AlertCircle,
  Film,
  Zap,
  FileVideo,
  Play,
  PlayCircle,
  ChevronDown,
  Captions,
  WandSparkles,
  Menu,
  RotateCcw,
} from "lucide-react";


import './App.css'



const platforms = [
  { id: 'instagram', name: 'Instagram Reels', icon: Instagram, color: '#E879A9' },
  { id: 'facebook', name: 'Facebook Reels', icon: Facebook, color: '#60A5FA' },
  { id: 'youtube', name: 'YouTube Shorts', icon: Youtube, color: '#F87171' },
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: '#E5E7EB' },
]

const initialSettings = {
  autoCut: true,
  removePauses: true,
  captions: true,
  language: 'Urdu + English',
  voice: 'Off',
  music: 'Soft cinematic',
  transitions: 'Subtle',
  ratio: '9:16',
  captionStyle: 'Bold',
  quality: '1080p',
}

const demoCaption =
  'A little story, a big feeling ✨ Watch till the end and share it with someone who needs to see this.'

const demoHashtags = '#Reels #ShortVideo #ContentCreator #Storytelling #ReelFlowAI'

function formatBytes(bytes) {
  if (!bytes) return '0 MB'
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function App() {
  const fileInput = useRef(null)
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [dragging, setDragging] = useState(false)
  const [settings, setSettings] = useState(initialSettings)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [schedule, setSchedule] = useState('')
  const [notice, setNotice] = useState(null)
  const [settingsApplied, setSettingsApplied] = useState(false)
  const [coverTitle, setCoverTitle] = useState('')
  const [coverStyle, setCoverStyle] = useState('Gradient')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!file) {
      setVideoUrl('')
      return
    }

    const url = URL.createObjectURL(file)
    setVideoUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 5500)
    return () => clearTimeout(timer)
  }, [notice])

  function showNotice(title, message, type = 'info') {
    setNotice({ title, message, type })
  }

  function selectFile(selected) {
    if (!selected) return

    const allowed = ['video/mp4', 'video/quicktime', 'video/webm']
    const extensionOK = /\.(mp4|mov|webm)$/i.test(selected.name)

    if (!allowed.includes(selected.type) && !extensionOK) {
      showNotice('Unsupported format', 'Please choose an MP4, MOV, or WebM video.', 'error')
      return
    }

    if (selected.size > 100 * 1024 * 1024) {
      showNotice('Video is too large', 'The maximum supported file size in this frontend is 100 MB.', 'error')
      return
    }

    setFile(selected)
    setDuration('')
    setSettingsApplied(false)
    showNotice('Video selected', 'Your video is ready for local preview. It has not been uploaded to a server.', 'success')
  }

  function updateSetting(key, value) {
    setSettings(previous => ({ ...previous, [key]: value }))
    setSettingsApplied(false)
  }

  function togglePlatform(id) {
    setSelectedPlatforms(previous =>
      previous.includes(id)
        ? previous.filter(item => item !== id)
        : [...previous, id]
    )
  }

  function applySettings() {
    if (!file) {
      showNotice('Choose a video first', 'Upload a video before preparing editing settings.', 'error')
      return
    }

    setSettingsApplied(true)
    showNotice(
      'Settings prepared',
      'Your editing preferences are saved in this page. Connect an AI processing service to render the edited video.',
      'success'
    )
  }

  function generateCaption() {
    setCaption(demoCaption)
    showNotice('Sample caption added', 'This is demonstration text, not a response from a live AI service.')
  }

  function generateHashtags() {
    setHashtags(demoHashtags)
    showNotice('Sample hashtags added', 'These sample hashtags were generated locally for demonstration.')
  }

  async function copyText(value, label) {
    if (!value.trim()) {
      showNotice('Nothing to copy', `Add some ${label.toLowerCase()} first.`, 'error')
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      showNotice(`${label} copied`, 'Text copied to your clipboard.', 'success')
    } catch {
      showNotice('Copy unavailable', 'Your browser may require HTTPS or clipboard permission. Select and copy the text manually.', 'error')
    }
  }

  function publishDemo() {
    if (!file) {
      showNotice('Choose a video first', 'Upload a video before preparing a publishing workflow.', 'error')
      return
    }

    if (!selectedPlatforms.length) {
      showNotice('Select a platform', 'Choose at least one social media platform.', 'error')
      return
    }

    showNotice(
      'Publishing is not connected',
      `You selected ${selectedPlatforms.length} platform(s). No video was published. Official APIs, account authorization, and a backend service are required.`,
      'error'
    )
  }

  function scheduleDemo() {
    if (!file || !selectedPlatforms.length || !schedule) {
      showNotice('Complete scheduling details', 'Select a video, at least one platform, and a date and time.', 'error')
      return
    }

    if (new Date(schedule).getTime() <= Date.now()) {
      showNotice('Choose a future time', 'The scheduled date and time must be in the future.', 'error')
      return
    }

    showNotice(
      'Scheduling is in demo mode',
      'Your scheduling details have not been saved to a server. A backend scheduler and platform integrations are required.'
    )
  }

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  const completedSteps = [
    Boolean(file),
    settingsApplied,
    Boolean(caption.trim() || hashtags.trim()),
    selectedPlatforms.length > 0,
  ]

  const workflow = [
    'Video selected',
    'Editing settings prepared',
    'Post content prepared',
    'Platforms selected',
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="ReelFlow AI home">
          <span className="brand-icon"><Clapperboard size={23} /></span>
          <span className="brand-copy">
            <strong>ReelFlow<span> AI</span></strong>
            <small>YOUR CREATIVE STUDIO</small>
          </span>
        </a>

        <button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav className={`topnav ${menuOpen ? 'topnav-open' : ''}`}>
          <button onClick={() => scrollTo('studio')}>Studio</button>
          <button onClick={() => scrollTo('captions')}>Captions</button>
          <button onClick={() => scrollTo('publishing')}>Publishing</button>
        </nav>

        <div className="workspace-status">
          <span className="status-dot" />
          <span>Workspace ready</span>
        </div>
      </header>

      <main id="home" className="main-content">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> YOUR AI VIDEO WORKSPACE</div>
            <h1>Turn raw videos into <span>ready-to-publish</span> reels.</h1>
            <p>One creative workspace for video editing, engaging captions, and social media publishing.</p>
            <div className="hero-actions">
              <button className="button-primary" onClick={() => fileInput.current?.click()}>
                <Upload size={17} /> Upload your video
              </button>
              <button className="button-secondary" onClick={() => scrollTo('studio')}>
                Explore studio <ChevronDown size={16} />
              </button>
            </div>
            <div className="hero-features">
              <span><Check size={14} /> Smart editing controls</span>
              <span><Check size={14} /> Caption workspace</span>
              <span><Check size={14} /> Multi-platform prep</span>
            </div>
          </div>

          <div className="hero-art" aria-label="ReelFlow video editing workspace illustration">
            <div className="art-glow" />
            <div className="floating-tag tag-top"><Sparkles size={15} /> Creative mode</div>
            <div className="art-video">
              <div className="art-video-scene">
                <div className="scene-sun" />
                <div className="scene-mountain mountain-one" />
                <div className="scene-mountain mountain-two" />
                <div className="scene-ground" />
                <div className="scene-person" />
                <div className="scene-caption">YOUR NEXT STORY</div>
                <div className="scene-play"><Play size={19} fill="currentColor" /></div>
              </div>
              <div className="art-timeline">
                <span /><span /><span /><span /><span /><span /><span />
              </div>
              <div className="art-bottom"><span><Film size={13} /> VIDEO PREVIEW</span><span>9:16</span></div>
            </div>
            <div className="floating-tag tag-bottom"><Zap size={15} /> Made for creators</div>
          </div>
        </section>

        <section className="metrics-row" aria-label="Workspace features">
          <div className="metric"><span className="metric-icon purple"><Video size={19} /></span><div><strong>Video studio</strong><small>Preview locally</small></div></div>
          <div className="metric"><span className="metric-icon blue"><Captions size={19} /></span><div><strong>Smart captions</strong><small>Prepare your copy</small></div></div>
          <div className="metric"><span className="metric-icon pink"><WandSparkles size={19} /></span><div><strong>Editing controls</strong><small>Configure your style</small></div></div>
          <div className="metric"><span className="metric-icon green"><Clock size={19} /></span><div><strong>Publish workflow</strong><small>Integration-ready</small></div></div>
        </section>

        <section id="studio" className="content-section">
          <div className="section-heading">
            <div><div className="section-kicker">01 / CREATE</div><h2>Your video studio</h2><p>Start with a video. Shape the settings around your story.</p></div>
            <span className="demo-badge"><span /> FRONTEND DEMO</span>
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
            className="visually-hidden"
            onChange={event => {
              selectFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />

          <div
            className={`upload-card ${dragging ? 'dragging' : ''} ${file ? 'upload-has-file' : ''}`}
            onDragOver={event => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={event => {
              event.preventDefault()
              setDragging(false)
              selectFile(event.dataTransfer.files?.[0])
            }}
          >
            <div className="upload-icon"><Upload size={25} /></div>
            <div className="upload-copy">
              <h3>{file ? 'Your video is ready' : 'Drop your video here'}</h3>
              <p>{file ? file.name : 'Drag and drop your video, or browse files on your device.'}</p>
              <span>MP4, MOV, WEBM <i /> Up to 100 MB <i /> Local preview</span>
            </div>
            <button className="button-secondary browse-button" onClick={() => fileInput.current?.click()}>
              {file ? 'Replace video' : 'Browse files'}
            </button>
            {file && <button className="icon-button remove-file" onClick={() => { setFile(null); setDuration(''); setSettingsApplied(false) }} aria-label="Remove video"><X size={17} /></button>}
          </div>

          <div className="studio-grid">
            <article className="panel preview-panel">
              <div className="panel-header"><div><h3>Video preview</h3><p>Your original video, right here.</p></div><span className="live-label"><span /> LOCAL</span></div>
              <div className={`video-frame ratio-${settings.ratio.replace(':', '-')}`}>
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    onLoadedMetadata={event => {
                      const seconds = Math.floor(event.currentTarget.duration)
                      setDuration(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`)
                    }}
                  />
                ) : (
                  <div className="preview-empty">
                    <div className="preview-empty-icon"><FileVideo size={29} /></div>
                    <strong>Your story starts here</strong>
                    <span>Upload a video to see the preview</span>
                    <button className="button-primary small-button" onClick={() => fileInput.current?.click()}><Upload size={15} /> Choose video</button>
                  </div>
                )}
              </div>
              <div className="video-meta">
                <div className="video-meta-icon"><Video size={17} /></div>
                <div className="video-meta-copy"><strong>{file ? file.name : 'No video selected'}</strong><span>{file ? `${formatBytes(file.size)}${duration ? ` · ${duration}` : ''}` : 'Your selected file will appear here'}</span></div>
                {file && <CircleCheck size={18} className="meta-check" />}
              </div>
              <div className="local-note"><AlertCircle size={15} /><span>Your video stays in this browser. No server upload occurs in this demo.</span></div>
            </article>

            <article className="panel settings-panel">
              <div className="panel-header"><div><h3><Settings2 size={18} /> Editing controls</h3><p>Configure your ideal reel.</p></div><span className="setting-count">10 options</span></div>

              <div className="toggle-list">
                {[
                  { key: 'autoCut', title: 'Smart auto-cut', desc: 'Configure a faster-paced edit', icon: Scissors },
                  { key: 'removePauses', title: 'Remove long pauses', desc: 'Mark pauses for processing', icon: Zap },
                  { key: 'captions', title: 'Automatic captions', desc: 'Prepare caption settings', icon: Captions },
                ].map(item => {
                  const Icon = item.icon
                  return <div className="toggle-row" key={item.key}>
                    <span className="control-icon"><Icon size={17} /></span>
                    <div className="toggle-copy"><strong>{item.title}</strong><span>{item.desc}</span></div>
                    <button className={`switch ${settings[item.key] ? 'switch-on' : ''}`} role="switch" aria-checked={settings[item.key]} aria-label={item.title} onClick={() => updateSetting(item.key, !settings[item.key])}><span /></button>
                  </div>
                })}
              </div>

              <div className="settings-divider" />
              <div className="field-grid">
                <label className="field"><span><Languages size={14} /> Caption language</span><select value={settings.language} onChange={event => updateSetting('language', event.target.value)}><option>Urdu + English</option><option>Urdu</option><option>English</option></select></label>
                <label className="field"><span><Music2 size={14} /> Background music</span><select value={settings.music} onChange={event => updateSetting('music', event.target.value)}><option>Soft cinematic</option><option>Upbeat</option><option>Ambient</option><option>Off</option></select></label>
                <label className="field"><span><Video size={14} /> Aspect ratio</span><select value={settings.ratio} onChange={event => updateSetting('ratio', event.target.value)}><option>9:16</option><option>1:1</option><option>16:9</option></select></label>
                <label className="field"><span><Sparkles size={14} /> Transitions</span><select value={settings.transitions} onChange={event => updateSetting('transitions', event.target.value)}><option>Subtle</option><option>Dynamic</option><option>Off</option></select></label>
                <label className="field"><span><Captions size={14} /> Caption style</span><select value={settings.captionStyle} onChange={event => updateSetting('captionStyle', event.target.value)}><option>Bold</option><option>Minimal</option><option>Highlighted</option></select></label>
                <label className="field"><span><Film size={14} /> Output quality</span><select value={settings.quality} onChange={event => updateSetting('quality', event.target.value)}><option>1080p</option><option>720p</option></select></label>
                <label className="field field-full"><span><Languages size={14} /> Voice-over</span><select value={settings.voice} onChange={event => updateSetting('voice', event.target.value)}><option>Off</option><option>Pakistani Urdu — illustrative</option><option>English — illustrative</option></select></label>
              </div>

              <button className="button-primary apply-button" onClick={applySettings}><WandSparkles size={17} /> Apply editing settings</button>
              <p className="integration-note"><AlertCircle size={14} /> Configuration only. Real AI editing and video export require a processing service.</p>
            </article>
          </div>
        </section>

        <section id="captions" className="content-section">
          <div className="section-heading">
            <div><div className="section-kicker">02 / WRITE</div><h2>Captions that connect</h2><p>Prepare your post copy before you publish.</p></div>
            <span className="section-number"><Captions size={19} /> CONTENT STUDIO</span>
          </div>

          <div className="content-grid">
            <article className="panel caption-panel">
              <div className="panel-header"><div><h3>Post caption</h3><p>Write or edit the message for your audience.</p></div><span className="sample-label">EDITABLE</span></div>
              <textarea value={caption} onChange={event => setCaption(event.target.value)} placeholder="Tell your story... What should viewers feel, learn, or remember?" rows={6} maxLength={2200} />
              <div className="textarea-footer"><span>{caption.length} / 2,200 characters</span><button className="text-button" onClick={() => setCaption('')}><RotateCcw size={14} /> Clear</button></div>
              <div className="caption-actions"><button className="button-secondary" onClick={generateCaption}><Sparkles size={15} /> Insert sample caption</button><button className="button-secondary" onClick={() => copyText(caption, 'Caption')}><Copy size={15} /> Copy caption</button></div>
              <p className="integration-note"><AlertCircle size={14} /> Sample text is local demo content, not live AI-generated copy.</p>
            </article>

            <article className="panel hashtags-panel">
              <div className="panel-header"><div><h3>Hashtags</h3><p>Organize your discoverability keywords.</p></div><span className="sample-label">EDITABLE</span></div>
              <textarea value={hashtags} onChange={event => setHashtags(event.target.value)} placeholder="#YourTopic #YourAudience #YourStory" rows={4} />
              <div className="textarea-footer"><span>{hashtags.trim() ? hashtags.trim().split(/\s+/).filter(Boolean).length : 0} tags</span><button className="text-button" onClick={() => setHashtags('')}><RotateCcw size={14} /> Clear</button></div>
              <button className="button-secondary full-button" onClick={generateHashtags}><Sparkles size={15} /> Insert sample hashtags</button>
              <button className="button-secondary full-button" onClick={() => copyText(hashtags, 'Hashtags')}><Copy size={15} /> Copy hashtags</button>
              <div className="hashtag-tip"><Sparkles size={16} /><span>Tip: use relevant hashtags that accurately describe your video and audience.</span></div>
            </article>
          </div>
        </section>

        <section id="cover" className="content-section">
          <div className="section-heading">
            <div><div className="section-kicker">03 / DESIGN</div><h2>Your reel cover</h2><p>Prepare a cover concept for your video.</p></div>
            <span className="section-number"><Image size={18} /> COVER STUDIO</span>
          </div>
          <div className="panel cover-panel">
            <div className={`cover-preview cover-${coverStyle.toLowerCase()}`}>
              <div className="cover-preview-inner">
                <span className="cover-brand"><Clapperboard size={13} /> REELFLOW AI</span>
                <strong>{coverTitle || 'YOUR NEXT BIG STORY'}</strong>
                <span className="cover-subtitle">A MOMENT WORTH SHARING</span>
              </div>
            </div>
            <div className="cover-controls">
              <h3>Customize your cover</h3>
              <p>Choose a visual direction and add a title.</p>
              <label className="field"><span>Cover headline</span><input value={coverTitle} maxLength={70} onChange={event => setCoverTitle(event.target.value)} placeholder="Your next big story" /></label>
              <div className="cover-style-label">Visual style</div>
              <div className="cover-style-options">
                {['Gradient', 'Midnight', 'Sunset'].map(style => <button key={style} className={`style-option ${coverStyle === style ? 'style-selected' : ''}`} onClick={() => setCoverStyle(style)}><span className={`style-swatch swatch-${style.toLowerCase()}`} />{style}{coverStyle === style && <Check size={14} />}</button>)}
              </div>
              <button className="button-secondary full-button" onClick={() => showNotice('Cover concept prepared', 'This is a local visual concept. Exporting a real cover image or generating one with AI requires further implementation.') }><Image size={16} /> Prepare cover concept</button>
              <p className="integration-note"><AlertCircle size={14} /> AI cover generation and image export are not connected.</p>
            </div>
          </div>
        </section>

        <section id="publishing" className="content-section">
          <div className="section-heading">
            <div><div className="section-kicker">04 / SHARE</div><h2>Ready for every platform</h2><p>Select where you want your reel to go.</p></div>
            <span className="demo-badge"><span /> NOT CONNECTED</span>
          </div>

          <div className="platform-grid">
            {platforms.map(platform => {
              const Icon = platform.icon
              const selected = selectedPlatforms.includes(platform.id)
              return <button key={platform.id} className={`platform-card ${selected ? 'platform-selected' : ''}`} onClick={() => togglePlatform(platform.id)} aria-pressed={selected}>
                <span className="platform-icon" style={{ '--platform-color': platform.color }}><Icon size={23} /></span>
                <span className="platform-copy"><strong>{platform.name}</strong><small>Account not connected</small></span>
                <span className={`platform-check ${selected ? 'platform-check-on' : ''}`}>{selected && <Check size={14} />}</span>
              </button>
            })}
          </div>

          <div className="publish-layout">
            <article className="panel publish-panel">
              <div className="panel-header"><div><h3>Publishing settings</h3><p>Prepare your distribution workflow.</p></div><span className="sample-label">DEMO MODE</span></div>
              <div className="publish-summary">
                <span className="summary-icon"><Clapperboard size={20} /></span>
                <div><strong>{file ? file.name : 'No video selected'}</strong><span>{selectedPlatforms.length} platform{selectedPlatforms.length === 1 ? '' : 's'} selected · {settings.ratio} format</span></div>
              </div>
              <div className="selected-platforms">
                {selectedPlatforms.length ? selectedPlatforms.map(id => {
                  const platform = platforms.find(item => item.id === id)
                  return <span key={id}><Check size={12} /> {platform.name}</span>
                }) : <span className="muted-selection">Choose one or more platforms above.</span>}
              </div>
              <button className="button-primary publish-button" onClick={publishDemo}><Upload size={17} /> Publish now <span className="demo-pill">DEMO</span></button>
              <div className="schedule-row">
                <label className="field"><span><Clock size={14} /> Schedule date & time</span><input type="datetime-local" value={schedule} min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} onChange={event => setSchedule(event.target.value)} /></label>
                <button className="button-secondary schedule-button" onClick={scheduleDemo}>Schedule post</button>
              </div>
              <p className="integration-note"><AlertCircle size={14} /> No accounts are connected. These actions do not publish or schedule posts.</p>
            </article>

            <article className="panel workflow-panel">
              <div className="panel-header"><div><h3>Workflow status</h3><p>Your preparation checklist.</p></div></div>
              <div className="workflow-list">
                {workflow.map((step, index) => <div className="workflow-item" key={step}>
                  <span className={`workflow-icon ${completedSteps[index] ? 'workflow-done' : ''}`}>{completedSteps[index] ? <Check size={15} /> : index + 1}</span>
                  <div><strong>{step}</strong><span>{completedSteps[index] ? 'Ready' : 'Waiting for input'}</span></div>
                </div>)}
                <div className="workflow-item">
                  <span className="workflow-icon workflow-pending"><Clock size={15} /></span>
                  <div><strong>AI render & publish</strong><span>Unavailable — integrations required</span></div>
                </div>
              </div>
              <div className="workflow-footer"><AlertCircle size={15} /><span>Real publishing requires official platform APIs, account authorization, and a secure backend.</span></div>
            </article>
          </div>
        </section>

        <section className="bottom-cta">
          <div className="bottom-cta-icon"><Sparkles size={24} /></div>
          <div><h2>Your next reel starts here.</h2><p>Upload a video and prepare your content in one creative workspace.</p></div>
          <button className="button-primary" onClick={() => { scrollTo('studio'); fileInput.current?.click() }}><Upload size={16} /> Start creating</button>
        </section>

        <footer className="footer">
          <a className="footer-brand" href="#home"><Clapperboard size={18} /> ReelFlow AI</a>
          <span>Designed for creators, built for your next story.</span>
          <span className="footer-demo"><span /> Frontend demo</span>
        </footer>
      </main>

      {notice && <div className={`toast toast-${notice.type}`} role="status" aria-live="polite">
        <span className="toast-icon">{notice.type === 'error' ? <AlertCircle size={19} /> : notice.type === 'success' ? <CircleCheck size={19} /> : <Sparkles size={19} />}</span>
        <div><strong>{notice.title}</strong><p>{notice.message}</p></div>
        <button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={17} /></button>
      </div>}
    </div>
  )
}

export default App
