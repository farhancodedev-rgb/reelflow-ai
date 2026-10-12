import { Menu, X } from 'lucide-react'

export default function Navbar({ open, onToggle }) {
  return (
    <header className="rf-navbar">
      <button className="rf-menu-button" onClick={onToggle} aria-label="Toggle navigation" aria-expanded={open}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <strong className="rf-navbar-title">ReelFlow<span> AI</span></strong>
      <span className="rf-chip">Frontend prototype</span>
    </header>
  )
}
