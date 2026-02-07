import { useState, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Inbox,
  Sun,
  Moon,
  Calendar,
  CalendarDays,
  Layers,
  Archive,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  PanelLeftClose,
  Plus,
  MoreHorizontal,
  Pencil,
  GripVertical,
} from 'lucide-react'
import { db, updateProject } from '@/db'
import { useProjects, useAreas } from '@/db/hooks'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { ProjectDialog } from './ProjectDialog'
import { AreaDialog } from './AreaDialog'
import type { ReactNode } from 'react'
import type { Project, Area } from '@/types'

// --- Nav items ---

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
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <CalendarDays size={18} />,
    path: '/calendar',
  },
]

// --- Badge ---

function NavItemBadge({ query }: { query: () => Promise<number> }) {
  const count = useLiveQuery(query)
  if (!count) return null
  return (
    <span className="ml-auto text-xs font-medium text-muted-foreground tabular-nums">
      {count}
    </span>
  )
}

// --- Nav item ---

function SidebarNavItem({ item }: { item: NavItem }) {
  const location = useLocation()
  const navigate = useNavigate()
  const setActiveView = useUIStore((s) => s.setActiveView)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  const isActive = location.pathname === item.path || (item.path === '/inbox' && location.pathname === '/')

  function handleClick() {
    navigate(item.path)
    setActiveView(item.id as Parameters<typeof setActiveView>[0])
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

// --- Sortable project item ---

function SortableProjectItem({
  project,
  isActive,
  onClick,
  onEdit,
}: {
  project: Project
  isActive: boolean
  onClick: () => void
  onEdit: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex w-full items-center rounded-lg text-sm font-medium transition-colors',
        isDragging && 'z-50 opacity-80 shadow-lg',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none px-1 py-2 text-sidebar-foreground/20 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 py-2 pr-1"
      >
        <span
          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded text-xs"
          style={{ backgroundColor: project.color + '20', color: project.color }}
        >
          {project.emoji || <FolderOpen size={14} />}
        </span>
        <span className="truncate">{project.name}</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        className="shrink-0 rounded p-1 text-sidebar-foreground/30 opacity-0 transition-opacity hover:text-sidebar-foreground group-hover:opacity-100"
        aria-label={`Edit ${project.name}`}
      >
        <MoreHorizontal size={14} />
      </button>
    </div>
  )
}

// --- Area section ---

function AreaSection({
  area,
  projects,
  onEditArea,
  onEditProject,
  onNewProject,
}: {
  area: Area
  projects: Project[]
  onEditArea: (area: Area) => void
  onEditProject: (project: Project) => void
  onNewProject: (areaId: string) => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const collapsed = useUIStore((s) => s.collapsedAreas[area.id] ?? false)
  const toggleCollapsed = useUIStore((s) => s.toggleAreaCollapsed)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = projects.findIndex((p) => p.id === active.id)
      const newIndex = projects.findIndex((p) => p.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      // Reorder positions
      const reordered = [...projects]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)

      await Promise.all(
        reordered.map((p, i) => updateProject(p.id, { position: i })),
      )
    },
    [projects],
  )

  return (
    <div className="mt-2">
      <div className="group flex items-center gap-1 px-1 pb-1">
        <button
          onClick={() => toggleCollapsed(area.id)}
          className="flex items-center gap-1.5 rounded px-1.5 py-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 transition-colors hover:text-sidebar-foreground/60"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          {area.name}
        </button>
        <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onNewProject(area.id)}
            className="rounded p-1 text-sidebar-foreground/30 transition-colors hover:text-sidebar-foreground"
            aria-label={`Add project to ${area.name}`}
          >
            <Plus size={12} />
          </button>
          <button
            onClick={() => onEditArea(area)}
            className="rounded p-1 text-sidebar-foreground/30 transition-colors hover:text-sidebar-foreground"
            aria-label={`Edit ${area.name}`}
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {projects.length === 0 ? (
              <p className="px-4 py-2 text-xs text-sidebar-foreground/30">
                No projects
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0.5 pl-1">
                    {projects.map((project) => (
                      <SortableProjectItem
                        key={project.id}
                        project={project}
                        isActive={location.pathname === `/project/${project.id}`}
                        onClick={() => {
                          navigate(`/project/${project.id}`)
                          if (window.innerWidth < 768) setSidebarOpen(false)
                        }}
                        onEdit={() => onEditProject(project)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Unassigned projects section ---

function UnassignedProjectsSection({
  projects,
  onEditProject,
}: {
  projects: Project[]
  onEditProject: (project: Project) => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = projects.findIndex((p) => p.id === active.id)
      const newIndex = projects.findIndex((p) => p.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = [...projects]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)

      await Promise.all(
        reordered.map((p, i) => updateProject(p.id, { position: i })),
      )
    },
    [projects],
  )

  if (projects.length === 0) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5 pl-1">
          {projects.map((project) => (
            <SortableProjectItem
              key={project.id}
              project={project}
              isActive={location.pathname === `/project/${project.id}`}
              onClick={() => {
                navigate(`/project/${project.id}`)
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
              onEdit={() => onEditProject(project)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// --- Projects & Areas section ---

function ProjectsAndAreasSection() {
  const projects = useProjects()
  const areas = useAreas()

  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [areaDialogOpen, setAreaDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [newProjectAreaId, setNewProjectAreaId] = useState<string | null>(null)

  // Group projects by area
  const projectsByArea = useMemo(() => {
    if (!projects) return new Map<string | null, Project[]>()
    const map = new Map<string | null, Project[]>()
    for (const project of projects) {
      const key = project.areaId
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(project)
    }
    return map
  }, [projects])

  const unassignedProjects = projectsByArea.get(null) ?? []
  const hasAnyContent = (projects && projects.length > 0) || (areas && areas.length > 0)

  if (!hasAnyContent) return null

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Projects
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setEditingArea(null)
              setAreaDialogOpen(true)
            }}
            className="rounded p-1 text-sidebar-foreground/30 transition-colors hover:text-sidebar-foreground"
            aria-label="New area"
            title="New area"
          >
            <Layers size={13} />
          </button>
          <button
            onClick={() => {
              setEditingProject(null)
              setNewProjectAreaId(null)
              setProjectDialogOpen(true)
            }}
            className="rounded p-1 text-sidebar-foreground/30 transition-colors hover:text-sidebar-foreground"
            aria-label="New project"
            title="New project"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Areas with their projects */}
      {areas?.map((area) => (
        <AreaSection
          key={area.id}
          area={area}
          projects={projectsByArea.get(area.id) ?? []}
          onEditArea={(a) => {
            setEditingArea(a)
            setAreaDialogOpen(true)
          }}
          onEditProject={(p) => {
            setEditingProject(p)
            setProjectDialogOpen(true)
          }}
          onNewProject={(areaId) => {
            setEditingProject(null)
            setNewProjectAreaId(areaId)
            setProjectDialogOpen(true)
          }}
        />
      ))}

      {/* Unassigned projects */}
      {unassignedProjects.length > 0 && (
        <div className="mt-1">
          <UnassignedProjectsSection
            projects={unassignedProjects}
            onEditProject={(p) => {
              setEditingProject(p)
              setProjectDialogOpen(true)
            }}
          />
        </div>
      )}

      {/* Dialogs */}
      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={(open) => {
          setProjectDialogOpen(open)
          if (!open) {
            setEditingProject(null)
            setNewProjectAreaId(null)
          }
        }}
        project={editingProject}
        defaultAreaId={newProjectAreaId}
      />
      <AreaDialog
        open={areaDialogOpen}
        onOpenChange={(open) => {
          setAreaDialogOpen(open)
          if (!open) setEditingArea(null)
        }}
        area={editingArea}
      />
    </div>
  )
}

// --- Main Sidebar ---

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

                <ProjectsAndAreasSection />
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
