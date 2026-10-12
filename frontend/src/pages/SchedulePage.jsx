import { useCallback, useState } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import Toast from '../components/Toast.jsx'
import Button from '../components/Button.jsx'
import Modal from '../components/Modal.jsx'
import { useToast } from '../hooks/useToast.js'
import { usePosts } from '../hooks/usePosts.js'
import { platformRules } from '../utils/publishProvider.js'

const statusLabel = {
  draft: 'Local draft',
  'demo-published': 'Demo published (not posted)',
  'demo-scheduled': 'Demo scheduled (not queued)',
}

const fmt = iso => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export default function SchedulePage() {
  const { notice, showNotice, dismiss } = useToast()
  const { posts, storageOk, remove } = usePosts()
  const [target, setTarget] = useState(null)
  const close = useCallback(() => setTarget(null), [])

  function confirmDelete() {
    remove(target.id)
    showNotice('Entry removed', 'The local entry was deleted.', 'success')
    close()
  }

  return (
    <div className="rf-page">
      <div className="rf-page-head">
        <div><h1>Schedule</h1><p>Your local drafts and demo entries.</p></div>
        <a className="button-primary rf-link-button" href="#/publishing">New post</a>
      </div>

      <div className="rf-note"><AlertCircle size={15} /> Everything here is stored only in this browser. No post is queued on any platform.</div>
      {!storageOk && <p className="rf-error" role="alert"><AlertCircle size={14} /> Browser storage is unavailable, so entries will be lost on refresh.</p>}

      {posts.length === 0 ? (
        <div className="rf-card rf-empty">
          <strong>No entries yet</strong>
          <span>Save a draft or record a demo schedule on the Publishing page.</span>
        </div>
      ) : (
        <ul className="rf-post-list">
          {posts.map(p => (
            <li key={p.id} className="rf-card rf-post">
              <div className="rf-post-body">
                <div className="rf-tags">
                  <span className="rf-chip">{platformRules[p.platform]?.name || p.platform}</span>
                  <span className={`rf-chip rf-status-${p.status}`}>{statusLabel[p.status] || p.status}</span>
                </div>
                <p dir="auto" className="rf-post-caption">{p.caption}</p>
                {p.hashtags && <small dir="auto">{p.hashtags}</small>}
                <small>{p.scheduledAt ? `Planned for ${fmt(p.scheduledAt)} · ` : ''}Created {fmt(p.createdAt)}</small>
              </div>
              <button className="rf-icon-btn rf-danger" onClick={() => setTarget(p)} aria-label="Delete entry" title="Delete"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(target)}
        title="Delete entry?"
        onClose={close}
        actions={<><Button variant="secondary" onClick={close}>Cancel</Button><Button onClick={confirmDelete}>Delete</Button></>}
      >
        <p>This removes the local entry. It cannot be undone.</p>
      </Modal>
      <Toast notice={notice} onDismiss={dismiss} />
    </div>
  )
}
