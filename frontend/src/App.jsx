import { useEffect, useState } from 'react'
import './App.css'
import LandingPage from './pages/LandingPage.jsx'
import { useRoute } from './hooks/useRoute.js'
import { useVideoFile } from './hooks/useVideoFile.js'
import { useEditorSettings } from './hooks/useEditorSettings.js'
import { loadSettings, applyAppearance } from './utils/storage.js'
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import EditorPage from './pages/EditorPage.jsx'
import CaptionsPage from './pages/CaptionsPage.jsx'
import VideoScriptPage from './pages/VideoScriptPage.jsx'
import CoverDesignerPage from './pages/CoverDesignerPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import PublishingPage from './pages/PublishingPage.jsx'
import SchedulePage from './pages/SchedulePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function renderPage(path, shared) {
  switch (path) {
    case '/dashboard':
      return <DashboardPage />
    case '/editor':
      return <EditorPage video={shared.video} editor={shared.editor} projectId={shared.projectId} />
    case '/video-script':
      return <VideoScriptPage />
    case '/captions':
      return <CaptionsPage />
    case '/cover':
      return <CoverDesignerPage />
    case '/publishing':
      return <PublishingPage />
    case '/projects':
      return <ProjectsPage />
    case '/schedule':
      return <SchedulePage />
    case '/settings':
      return <SettingsPage />
    default:
      return <NotFoundPage />
  }
}

export default function App() {
  const { path, params } = useRoute()
  const [navOpen, setNavOpen] = useState(false)
  const video = useVideoFile()
  const editor = useEditorSettings(params.get('id'))

  useEffect(() => {
    applyAppearance(loadSettings())
  }, [])

  if (path === '/') {
    return <LandingPage />
  }

  return (
    <div className="rf-app">
      <Sidebar path={path} open={navOpen} onNavigate={() => setNavOpen(false)} />
      <div className="rf-content">
        <Navbar open={navOpen} onToggle={() => setNavOpen(o => !o)} />
        <main>{renderPage(path, { video, editor, projectId: params.get('id') })}</main>
      </div>
    </div>
  )
}
