import { Clapperboard } from 'lucide-react'
import { navItems } from '../utils/navItems.js'

export default function Sidebar({ path, open, onNavigate }) {
  const current = path === '/' ? '/dashboard' : path
  return (
    <>
      {open && <div className="rf-scrim" onClick={() => onNavigate()} />}
      <aside className={`rf-sidebar ${open ? 'rf-sidebar-open' : ''}`} aria-label="Main navigation">
        <a className="rf-brand" href="#/dashboard" onClick={() => onNavigate()}>
          <span className="rf-brand-icon"><Clapperboard size={20} /></span>
          <strong>ReelFlow<span> AI</span></strong>
        </a>
        <nav className="rf-nav">
          {navItems.map(item => {
            const Icon = item.icon
            const active = current === item.path
            return (
              <a
                key={item.path}
                href={`#${item.path}`}
                className={`rf-nav-link ${active ? 'rf-nav-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate()}
              >
                <Icon size={18} /> {item.label}
              </a>
            )
          })}
        </nav>
        <p className="rf-sidebar-note">Local prototype. Your videos stay in this browser.</p>
      </aside>
    </>
  )
}
