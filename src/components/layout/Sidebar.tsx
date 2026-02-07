import { useLocation, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Inbox,
  Sun,
  Moon,
  Calendar,
  Layers,
  Archive,
  BookOpen,
  ChevronDown,
  FolderOpen,
  PanelLeftClose,
} from 'lucide-react'
import { db } from '@/db'
import { useProjects } from '@/db/hooks'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface NavItem {
  id: string
  label: string
  icon: ReactNode
  path: string
  countQuery?: () => Promise<number>
}

const mainNavItems: NavItem[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: <Inbox size={18} />,
    path: '/inbox',
    countQuery: () => db.tasks.where('status').equals('inbox').count(),
  },
  {
    id: 'today',
    label: 'Today',
    icon: <Sun size={18} />,
    path: '/today',
    countQuery: () => {
      const today = new Date().toISOString().split('T')[0]
      return db.tasks
        .where('status')
        .equals('active')
        .filter((t) => (t.dueDate === today || t.scheduledDate === today) && !t.isEvening)
        .count()
    },
  },
  {
    id: 'evening',
    label: 'This Evening',
    icon: <Moon size={18} />,
    path: '/evening',
    countQuery: () => {
      const today = new Date().toISOString().split('T')[0]
      return db.tasks
        .where('status')
        .anyOf(['inbox', 'active'])
        .filter(
          (t) =>
            t.isEvening &&
            (t.dueDate === today || t.scheduledDate === today || (!t.dueDate && !t.scheduledDate)),
        )
        .count()
    },
  },
  {
    id: 'upcoming',
    label: 'Upcoming',
    icon: <Calendar size={18} />,
    path: '/upcoming',
    countQuery: () => {
      const today = new Date().toISOString().split('T')[0]
      return db.tasks
        .where('status')
        .equals('active')
        .filter((t) => t.dueDate !== null && t.dueDate > today)
        .count()
    },
  },
  {
    id: 'anytime',
    label: 'Anytime',
    icon: <Layers size={18} />,
    path: '/anytime',
    countQuery: () =>
      db.tasks
        .where('status')
        .equals('active')
        .count(),
  },
  {
    id: 'someday',
    label: 'Someday',
    icon: <Archive size={18} />,
    path: '/someday',
  },
  {
    id: 'logbook',
    label: 'Logbook',
    icon: <BookOpen size={18} />,
    path: '/logbook',
  },
]

function NavItemBadge({ query }: { query: () => Promise<number> }) {
  const count = useLiveQuery(query)
  if (!count) return null
  return (
    <span className="ml-auto text-xs font-medium text-muted-foreground tabular-nums">
      {count}
    </span>
  )
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const location = useLocation()
  const navigate = useNavigate()
  const setActiveView = useUIStore((s) => s.setActiveView)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  const isActive = location.pathname === item.path || (item.path === '/inbox' && location.pathname === '/')

  function handleClick() {
    navigate(item.path)
    setActiveView(item.id as Parameters<typeof setActiveView>[0])
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
      )}
    >
      <span
        className={cn(
          'shrink-0 transition-colors',
          isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70',
        )}
      >
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
      {item.countQuery && <NavItemBadge query={item.countQuery} />}
    </button>
  )
}

function ProjectsSection() {
  const projects = useProjects()
  const location = useLocation()
  const navigate = useNavigate()
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  if (!projects || projects.length === 0) return null

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 px-3 pb-2">
        <ChevronDown size={14} className="text-sidebar-foreground/40" />
        <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Projects
        </span>
      </div>
      <div className="space-y-0.5">
        {projects.map((project) => {
          const isActive = location.pathname === `/project/${project.id}`
          return (
            <button
              key={project.id}
              onClick={() => {
                navigate(`/project/${project.id}`)
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              )}
            >
              <span
                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded text-xs"
                style={{ backgroundColor: project.color + '20', color: project.color }}
              >
                {project.emoji || <FolderOpen size={14} />}
              </span>
              <span className="truncate">{project.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-sidebar-border bg-sidebar-background',
              'md:relative md:z-auto',
            )}
          >
            <div className="flex w-[260px] flex-col overflow-hidden">
              {/* Header */}
              <div className="flex h-14 shrink-0 items-center justify-between px-4">
                <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">
                  Zenith
                </h1>
                <button
                  onClick={toggleSidebar}
                  className="rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose size={18} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-2 pb-4">
                <div className="space-y-0.5">
                  {mainNavItems.map((item) => (
                    <SidebarNavItem key={item.id} item={item} />
                  ))}
                </div>

                <ProjectsSection />
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
