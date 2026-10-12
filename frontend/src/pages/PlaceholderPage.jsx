export default function PlaceholderPage({ title, text }) {
  return (
    <div className="rf-page">
      <div className="rf-page-head"><div><h1>{title}</h1><p>{text}</p></div></div>
      <div className="rf-card rf-empty">
        <strong>Coming in a later phase</strong>
        <span>This workspace is not built yet.</span>
        <a className="button-secondary rf-link-button" href="#/editor">Open Video Editor</a>
      </div>
    </div>
  )
}
