import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, title, children, onClose, actions }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialogRef.current?.contains(document.activeElement)) dialogRef.current?.focus()

    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="rf-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="rf-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="rf-modal-head">
          <h3>{title}</h3>
          <button className="rf-modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="rf-modal-body">{children}</div>
        {actions && <div className="rf-modal-actions">{actions}</div>}
      </div>
    </div>
  )
}
