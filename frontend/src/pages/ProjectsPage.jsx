import { useCallback, useMemo, useState } from 'react'
import { Plus, Search, Film, Pencil, Copy, Trash2, FolderOpen, AlertCircle } from 'lucide-react'
import Toast from '../components/Toast.jsx'
import Button from '../components/Button.jsx'
import Modal from '../components/Modal.jsx'
import { useToast } from '../hooks/useToast.js'
import { useProjects } from '../hooks/useProjects.js'

const sorters = {
  updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  name: (a, b) => a.title.localeCompare(b.title),
}

const formatDate = iso =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

function ProjectForm({ initial, withRatio, onSubmit }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [ratio, setRatio] = useState(initial?.ratio || '9:16')
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    const clean = title.trim()
    if (!clean) return setError('Please enter a project name.')
    if (clean.length > 60) return setError('Use 60 characters or fewer.')
    onSubmit({ title: clean, ratio })
  }

  return (
    <form id="project-form" className="rf-form" onSubmit={submit}>
      <label className="rf-field"><span>Project name</span>
        <input autoFocus dir="auto" maxLength={60} value={title} onChange={e => { setTitle(e.target.value); setError('') }} placeholder="e.g. Eid campaign reel" />
      </label>
      {withRatio && (
        <label className="rf-field"><span>Aspect ratio</span>
          <select value={ratio} onChange={e => setRatio(e.target.value)}>
            <option>9:16</option><option>1:1</option><option>16:9</option>
          </select>
        </label>
      )}
      {error && <p className="rf-error" role="alert"><AlertCircle size={14} /> {error}</p>}
    </form>
  )
}

export default function ProjectsPage() {
  const { notice, showNotice, dismiss } = useToast()
  const { projects, storageOk, create, rename, duplicate, remove } = useProjects()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('updated')
  const [dialog, setDialog] = useState(null)

  const close = useCallback(() => setDialog(null), [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter(p => p.title.toLowerCase().includes(q)).sort(sorters[sort])
  }, [projects, query, sort])

  function submitForm(values) {
    if (dialog.type === 'create') {
      create(values)
      showNotice('Project created', 'Saved as a local draft in this browser.', 'success')
    } else {
      rename(dialog.project.id, values.title)
      showNotice('Project renamed', 'The new name was saved.', 'success')
    }
    close()
  }

  function confirmDelete() {
    remove(dialog.project.id)
    showNotice('Project deleted', 'The project entry was removed.', 'success')
    close()
  }

  const isForm = dialog && dialog.type !== 'delete'
  const titles = { create: 'New project', rename: 'Rename project', delete: 'Delete project?' }

  return (
    <div className="rf-page">
      <div className="rf-page-head">
        <div><h1>Projects</h1><p>Your local project list.</p></div>
        <Button icon={Plus} onClick={() => setDialog({ type: 'create' })}>New project</Button>
      </div>

      <div className="rf-note"><AlertCircle size={15} /> Only project details (name, date, ratio, status) are saved in this browser. Video files are not stored, so re-upload your video in the editor.</div>
      {!storageOk && <p className="rf-error" role="alert"><AlertCircle size={14} /> Browser storage is unavailable, so changes will be lost on refresh.</p>}

      <div className="rf-toolbar">
        <label className="rf-search">
          <Search size={16} />
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects" aria-label="Search projects" />
        </label>
        <label className="rf-field rf-sort"><span className="visually-hidden">Sort projects</span>
          <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort projects">
            <option value="updated">Recently updated</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>

      {projects.length === 0 ? (
        <div className="rf-card rf-empty">
          <strong>No projects yet</strong>
          <span>Create your first project to start organizing your reels.</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="rf-card rf-empty"><strong>No matches</strong><span>Try a different search.</span></div>
      ) : (
        <ul className="rf-project-grid">
          {visible.map(p => (
            <li key={p.id} className="rf-card rf-project">
              <div className={`rf-thumb rf-thumb-${p.ratio.replace(':', '-')}`} aria-hidden="true"><Film size={22} /></div>
              <div className="rf-project-body">
                <strong dir="auto">{p.title}</strong>
                <span>Created {formatDate(p.createdAt)}</span>
                <div className="rf-tags"><span className="rf-chip">{p.ratio}</span><span className="rf-chip">{p.status === 'exported' ? 'Exported' : 'Draft'}</span></div>
              </div>
              <div className="rf-project-actions">
                <a className="rf-icon-btn" href={`#/editor?id=${encodeURIComponent(p.id)}`} aria-label={`Open ${p.title} in editor`} title="Open editor"><FolderOpen size={16} /></a>
                <button className="rf-icon-btn" onClick={() => setDialog({ type: 'rename', project: p })} aria-label={`Rename ${p.title}`} title="Rename"><Pencil size={16} /></button>
                <button className="rf-icon-btn" onClick={() => { duplicate(p.id); showNotice('Project duplicated', 'A copy was added as a draft.', 'success') }} aria-label={`Duplicate ${p.title}`} title="Duplicate"><Copy size={16} /></button>
                <button className="rf-icon-btn rf-danger" onClick={() => setDialog({ type: 'delete', project: p })} aria-label={`Delete ${p.title}`} title="Delete"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(dialog)}
        title={dialog ? titles[dialog.type] : ''}
        onClose={close}
        actions={dialog && (
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            {isForm
              ? <Button type="submit" form="project-form">{dialog.type === 'create' ? 'Create' : 'Save'}</Button>
              : <Button onClick={confirmDelete}>Delete</Button>}
          </>
        )}
      >
        {dialog && isForm && (
          <ProjectForm key={dialog.type + (dialog.project?.id || '')} initial={dialog.project} withRatio={dialog.type === 'create'} onSubmit={submitForm} />
        )}
        {dialog && dialog.type === 'delete' && (
          <p>“{dialog.project.title}” will be removed from this list. This cannot be undone. Your original video file is not affected.</p>
        )}
      </Modal>
      <Toast notice={notice} onDismiss={dismiss} />
    </div>
  )
}
