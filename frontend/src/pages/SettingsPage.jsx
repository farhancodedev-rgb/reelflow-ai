import { useCallback, useState } from 'react'
import { RotateCcw, AlertCircle, ShieldCheck } from 'lucide-react'
import Toast from '../components/Toast.jsx'
import Button from '../components/Button.jsx'
import Modal from '../components/Modal.jsx'
import { useToast } from '../hooks/useToast.js'
import { useSettings } from '../hooks/useSettings.js'

export default function SettingsPage() {
  const { notice, showNotice, dismiss } = useToast()
  const { settings, storageOk, update, reset } = useSettings()
  const [confirmReset, setConfirmReset] = useState(false)
  const closeReset = useCallback(() => setConfirmReset(false), [])

  function doReset() {
    reset()
    closeReset()
    showNotice('Preferences reset', 'All settings are back to their defaults.', 'success')
  }

  return (
    <div className="rf-page">
      <div className="rf-page-head">
        <div><h1>Settings</h1><p>Local preferences for this browser.</p></div>
        <Button variant="secondary" icon={RotateCcw} onClick={() => setConfirmReset(true)}>Reset preferences</Button>
      </div>

      <div className="rf-note"><AlertCircle size={15} /> There are no accounts yet. Everything here is saved only in this browser and is not synced anywhere.</div>
      {!storageOk && <p className="rf-error" role="alert"><AlertCircle size={14} /> Browser storage is unavailable, so settings will be lost on refresh.</p>}

      <div className="rf-two-col">
        <section className="rf-card rf-form" aria-labelledby="s-profile">
          <h2 id="s-profile" className="rf-h2">Profile</h2>
          <label className="rf-field"><span>Display name</span>
            <input dir="auto" maxLength={40} value={settings.displayName} onChange={e => update('displayName', e.target.value)} placeholder="Your name" />
          </label>
          <small className="rf-hint">Stored locally. No email or password is collected.</small>
        </section>

        <section className="rf-card rf-form" aria-labelledby="s-defaults">
          <h2 id="s-defaults" className="rf-h2">Defaults</h2>
          <label className="rf-field"><span>Default aspect ratio</span>
            <select value={settings.defaultRatio} onChange={e => update('defaultRatio', e.target.value)}>
              <option>9:16</option><option>1:1</option><option>16:9</option>
            </select>
          </label>
          <label className="rf-field"><span>Default export quality</span>
            <select value={settings.defaultQuality} onChange={e => update('defaultQuality', e.target.value)}>
              <option>1080p</option><option>720p</option>
            </select>
          </label>
          <label className="rf-field"><span>Caption language</span>
            <select value={settings.captionLanguage} onChange={e => update('captionLanguage', e.target.value)}>
              <option value="en">English</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </label>
          <small className="rf-hint">Applied when you open the Editor or Captions page.</small>
        </section>

        <section className="rf-card rf-form" aria-labelledby="s-appearance">
          <h2 id="s-appearance" className="rf-h2">Appearance</h2>
          <label className="rf-check">
            <input type="checkbox" checked={settings.reduceMotion} onChange={e => update('reduceMotion', e.target.checked)} />
            <span>Reduce motion<small>Turns off animations and transitions.</small></span>
          </label>
          <small className="rf-hint">The app currently has one dark theme.</small>
        </section>

        <section className="rf-card rf-form" aria-labelledby="s-notify">
          <h2 id="s-notify" className="rf-h2">Notifications</h2>
          <label className="rf-check">
            <input type="checkbox" checked={settings.notifyExport} onChange={e => update('notifyExport', e.target.checked)} />
            <span>Export finished</span>
          </label>
          <label className="rf-check">
            <input type="checkbox" checked={settings.notifyReminders} onChange={e => update('notifyReminders', e.target.checked)} />
            <span>Scheduling reminders</span>
          </label>
          <small className="rf-hint">Preference only. No notifications are sent yet; that needs a backend.</small>
        </section>
      </div>

      <section className="rf-card" aria-labelledby="s-privacy">
        <h2 id="s-privacy" className="rf-h2"><ShieldCheck size={17} /> Privacy</h2>
        <ul className="rf-steps">
          <li>Videos are processed in your browser and are never uploaded to a server.</li>
          <li>Only project details and these preferences are stored, in this browser's local storage.</li>
          <li>No passwords, tokens or social account credentials are stored.</li>
          <li>Clearing your browser data removes everything saved here.</li>
        </ul>
      </section>

      <Modal
        open={confirmReset}
        title="Reset preferences?"
        onClose={closeReset}
        actions={<><Button variant="secondary" onClick={closeReset}>Cancel</Button><Button onClick={doReset}>Reset</Button></>}
      >
        <p>All settings return to their defaults. Your projects are not affected.</p>
      </Modal>
      <Toast notice={notice} onDismiss={dismiss} />
    </div>
  )
}
