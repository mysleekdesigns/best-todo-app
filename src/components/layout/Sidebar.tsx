import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  CalendarDays,
  Sun,
  StickyNote,
  Timer,
  Target,
  Menu,
  Search,
  Plus,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { db, createTag } from '@/db'
import { useLists, useTags } from '@/db/hooks'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { ListDialog } from './ListDialog'
import type { List } from '@/types'

// --- Nav items ---

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  countQuery?: () => Promise<number>
}

const navItems: NavItem[] = [
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
        .filter((t) => t.dueDate !== null && t.dueDate >= today)
        .count()
    },
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
        .filter((t) => t.dueDate === today || t.scheduledDate === today)
        .count()
    },
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <CalendarDays size={18} />,
    path: '/calendar',
  },
  {
    id: 'sticky-wall',
    label: 'Sticky Wall',
    icon: <StickyNote size={18} />,
    path: '/sticky-wall',
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: <Timer size={18} />,
    path: '/focus',
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: <Target size={18} />,
    path: '/habits',
  },
]

// --- Count Badge ---

function CountBadge({ query }: { query: () => Promise<number> }) {
  const count = useLiveQuery(query)
  if (!count) return null
  return (
    <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
      {count}
    </span>
  )
}

// --- List task count ---

function ListCount({ listId }: { listId: string }) {
  const count = useLiveQuery(
    () => db.tasks.where('listId').equals(listId).filter((t) => t.status === 'active').count(),
    [listId],
  )
  if (!count) return null
  return (
    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
      {count}
    </span>
  )
}

// --- Main Sidebar ---

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const collapsedSections = useUIStore((s) => s.collapsedSections)
  const toggleSectionCollapsed = useUIStore((s) => s.toggleSectionCollapsed)

  const location = useLocation()
  const navigate = useNavigate()

  const lists = useLists()
  const tags = useTags()

  const [listDialogOpen, setListDialogOpen] = useState(false)
  const [editingList, setEditingList] = useState<List | null>(null)
  const [addingTag, setAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const listsCollapsed = collapsedSections['lists'] ?? false
  const tagsCollapsed = collapsedSections['tags'] ?? false

  function handleNavClick(item: NavItem) {
    navigate(item.path)
    if (window.innerWidth < 768) {
      useUIStore.getState().setSidebarOpen(false)
    }
  }

  function handleListClick(listId: string) {
    navigate(`/list/${listId}`)
    if (window.innerWidth < 768) {
      useUIStore.getState().setSidebarOpen(false)
    }
  }

  async function handleAddTag() {
    const trimmed = newTagName.trim()
    if (!trimmed) return
    await createTag({ name: trimmed, color: '#94a3b8' })
    setNewTagName('')
    setAddingTag(false)
  }

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
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-sidebar-border bg-sidebar-background',
              'md:relative md:z-auto',
            )}
          >
            <div className="flex w-[280px] flex-col overflow-hidden">
              {/* Header */}
              <div className="flex h-14 shrink-0 items-center justify-between px-4">
                <h1 className="text-lg font-bold text-sidebar-primary">Menu</h1>
                <button
                  onClick={toggleSidebar}
                  className="rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  aria-label="Close sidebar"
                >
                  <Menu size={18} />
                </button>
              </div>

              {/* Search */}
              <div className="px-3 pb-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="h-9 w-full rounded-lg border border-sidebar-border bg-sidebar-accent pl-9 pr-3 text-sm text-sidebar-accent-foreground outline-none placeholder:text-sidebar-foreground focus:border-sidebar-foreground/30 focus:ring-1 focus:ring-sidebar-foreground/30"
                    onFocus={() => {
                      window.dispatchEvent(
                        new KeyboardEvent('keydown', { key: 'k', metaKey: true }),
                      )
                    }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-2 pb-4">
                {/* TASKS section */}
                <div className="mb-1 px-3 pt-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground">
                    Tasks
                  </span>
                </div>
                <div className="space-y-0.5">
                  {navItems.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path === '/upcoming' && location.pathname === '/')
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'border-l-2 border-sidebar-primary bg-sidebar-accent font-semibold text-sidebar-primary'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent',
                        )}
                      >
                        <span className={cn('shrink-0', isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground')}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {item.countQuery && <CountBadge query={item.countQuery} />}
                      </button>
                    )
                  })}
                </div>

                {/* Divider */}
                <div className="my-3 border-t border-sidebar-border" />

                {/* LISTS section */}
                <div className="mb-1 flex items-center justify-between px-3">
                  <button
                    onClick={() => toggleSectionCollapsed('lists')}
                    className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  >
                    {listsCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    Lists
                  </button>
                  <button
                    onClick={() => {
                      setEditingList(null)
                      setListDialogOpen(true)
                    }}
                    className="rounded p-0.5 text-sidebar-foreground transition-colors hover:text-sidebar-accent-foreground"
                    aria-label="Add new list"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {!listsCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5">
                        {lists?.map((list) => {
                          const isActive = location.pathname === `/list/${list.id}`
                          return (
                            <button
                              key={list.id}
                              onClick={() => handleListClick(list.id)}
                              onContextMenu={(e) => {
                                e.preventDefault()
                                setEditingList(list)
                                setListDialogOpen(true)
                              }}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                isActive
                                  ? 'bg-sidebar-accent font-semibold text-sidebar-primary'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent',
                              )}
                            >
                              <span
                                className="h-3 w-3 shrink-0 rounded-sm"
                                style={{ backgroundColor: list.color }}
                              />
                              <span className="truncate">{list.name}</span>
                              <ListCount listId={list.id} />
                            </button>
                          )
                        })}
                        <button
                          onClick={() => {
                            setEditingList(null)
                            setListDialogOpen(true)
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <Plus size={14} />
                          <span>Add New List</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="my-3 border-t border-sidebar-border" />

                {/* TAGS section */}
                <div className="mb-1 flex items-center justify-between px-3">
                  <button
                    onClick={() => toggleSectionCollapsed('tags')}
                    className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  >
                    {tagsCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    Tags
                  </button>
                  <button
                    onClick={() => setAddingTag(true)}
                    className="rounded p-0.5 text-sidebar-foreground transition-colors hover:text-sidebar-accent-foreground"
                    aria-label="Add tag"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {!tagsCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-1.5 px-3 py-1">
                        {tags?.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: tag.color + '20',
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {addingTag ? (
                          <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddTag()
                              if (e.key === 'Escape') {
                                setAddingTag(false)
                                setNewTagName('')
                              }
                            }}
                            onBlur={() => {
                              if (newTagName.trim()) {
                                handleAddTag()
                              } else {
                                setAddingTag(false)
                              }
                            }}
                            placeholder="Tag name"
                            autoFocus
                            className="h-7 w-24 rounded-full border border-sidebar-border bg-sidebar-accent px-3 text-xs outline-none placeholder:text-sidebar-foreground focus:border-sidebar-foreground/30"
                          />
                        ) : (
                          <button
                            onClick={() => setAddingTag(true)}
                            className="rounded-full border border-dashed border-sidebar-border px-3 py-1 text-xs text-sidebar-foreground transition-colors hover:border-sidebar-foreground hover:text-sidebar-accent-foreground"
                          >
                            + Add Tag
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </nav>

              {/* Bottom section */}
              <div className="mt-auto border-t border-sidebar-border px-2 py-2">
                <button
                  onClick={() => {
                    navigate('/settings')
                    if (window.innerWidth < 768) {
                      useUIStore.getState().setSidebarOpen(false)
                    }
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    location.pathname === '/settings'
                      ? 'bg-sidebar-accent font-semibold text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* List Dialog */}
      <ListDialog
        open={listDialogOpen}
        onOpenChange={(open) => {
          setListDialogOpen(open)
          if (!open) setEditingList(null)
        }}
        list={editingList}
      />
    </>
  )
}
