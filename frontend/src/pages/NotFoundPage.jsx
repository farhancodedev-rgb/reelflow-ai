export default function NotFoundPage() {
  return (
    <div className="rf-page">
      <div className="rf-card rf-empty">
        <strong>Page not found</strong>
        <span>That address does not exist in ReelFlow AI.</span>
        <a className="button-primary rf-link-button" href="#/dashboard">Back to overview</a>
      </div>
    </div>
  )
}
