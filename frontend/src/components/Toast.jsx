import { AlertCircle, CircleCheck, Sparkles, X } from 'lucide-react'

export default function Toast({ notice, onDismiss }) {
  if (!notice) return null
  const Icon =
    notice.type === 'error' ? AlertCircle : notice.type === 'success' ? CircleCheck : Sparkles
  return (
    <div className={`toast toast-${notice.type}`} role="status" aria-live="polite">
      <span className="toast-icon"><Icon size={19} /></span>
      <div><strong>{notice.title}</strong><p>{notice.message}</p></div>
      <button onClick={onDismiss} aria-label="Dismiss notification"><X size={17} /></button>
    </div>
  )
}
