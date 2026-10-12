import { Plus, Film, Captions, Image, Send, FolderOpen, Activity } from 'lucide-react'
import { useProjects } from '../hooks/useProjects.js'
import { useSettings } from '../hooks/useSettings.js'

const quickActions = [
  { href: '#/editor', icon: Film, title: 'Edit a video', text: 'Upload, resize and export a WebM.' },
  { href: '#/captions', icon: Captions, title: 'Write captions', text: 'Draft captions and hashtags.' },
  { href: '#/cover', icon: Image, title: 'Design a cover', text: 'Build a cover concept.' },
  { href: '#/publishing', icon: Send, title: 'Prepare publishing', text: 'Demo workflow, nothing is posted.' },
]

const steps = [
  'Upload a video',
  'Customize its presentation',
  'Prepare captions and hashtags',
  'Select a platform and format',
  'Export or prepare for publishing',
]

const formatDate = iso =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

export default function DashboardPage() {
  const { projects } = useProjects()
  const { settings } = useSettings()
  const recent = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)
  const drafts = projects.filter(p => p.status !== 'exported').length
  const exported = projects.length - drafts

  return (
    <div className="rf-page">
      <div className="rf-page-head">
        <div>
          <h1>{settings.displayName.trim() ? `Welcome, ${settings.displayName.trim()}` : 'Welcome to ReelFlow AI'}</h1>
          <p>Prepare short-form videos for Reels and Shorts in one workspace.</p>
        </div>
        <a className="button-primary rf-link-button" href="#/projects"><Plus size={16} /> New project</a>
      </div>

      <section aria-labelledby="qa-title">
        <h2 id="qa-title" className="rf-h2">Quick actions</h2>
        <div className="rf-card-grid">
          {quickActions.map(item => {
            const Icon = item.icon
            return (
              <a key={item.href} href={item.href} className="rf-card rf-card-link">
                <span className="rf-card-icon"><Icon size={20} /></span>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </a>
            )
          })}
        </div>
      </section>

      <div className="rf-two-col">
        <section className="rf-card" aria-labelledby="rp-title">
          <h2 id="rp-title" className="rf-h2"><FolderOpen size={17} /> Recent projects</h2>
          {recent.length === 0 ? (
            <div className="rf-empty">
              <strong>No projects yet</strong>
              <span>Create one on the Projects page to see it here.</span>
            </div>
          ) : (
            <>
              <ul className="rf-recent">
                {recent.map(p => (
                  <li key={p.id}>
                    <strong dir="auto">{p.title}</strong>
                    <span>{p.ratio} · {p.status === 'exported' ? 'Exported' : 'Draft'} · {formatDate(p.updatedAt)}</span>
                  </li>
                ))}
              </ul>
              <p className="rf-hint">{drafts} draft{drafts === 1 ? '' : 's'} · {exported} exported</p>
              <a className="rf-more" href="#/projects">View all projects</a>
            </>
          )}
        </section>

        <section className="rf-card" aria-labelledby="ra-title">
          <h2 id="ra-title" className="rf-h2"><Activity size={17} /> Recent activity</h2>
          <div className="rf-empty">
            <strong>Nothing yet</strong>
            <span>Activity tracking is not built yet. No analytics are collected.</span>
          </div>
        </section>
      </div>

      <section className="rf-card" aria-labelledby="wf-title">
        <h2 id="wf-title" className="rf-h2">Content workflow</h2>
        <ol className="rf-steps">
          {steps.map(step => <li key={step}>{step}</li>)}
        </ol>
      </section>
    </div>
  )
}
