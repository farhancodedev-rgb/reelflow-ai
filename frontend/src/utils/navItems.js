import {
  LayoutDashboard, Film, FolderOpen, Captions, Image, Send, CalendarClock, Settings, ScrollText,
} from 'lucide-react'

export const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/editor', label: 'Video Editor', icon: Film },
  { path: '/video-script', label: 'Video Script Generator', icon: ScrollText },
  { path: '/projects', label: 'Projects', icon: FolderOpen },
  { path: '/captions', label: 'Captions & Hashtags', icon: Captions },
  { path: '/cover', label: 'Cover Designer', icon: Image },
  { path: '/publishing', label: 'Publishing', icon: Send },
  { path: '/schedule', label: 'Schedule', icon: CalendarClock },
  { path: '/settings', label: 'Settings', icon: Settings },
]
