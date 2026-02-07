import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { FolderOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useList, useTasksByList, useListHeadings } from '@/db/hooks'
import {
  createListHeading,
  updateListHeading,
  deleteListHeading,
} from '@/db'
import { TaskList } from '@/components/tasks/TaskList'
import { QuickAdd } from '@/components/tasks/QuickAdd'
import type { Task, ListHeading } from '@/types'

function ProgressRing({
  completed,
  total,
  color,
}: {
  completed: number
  total: number
  color: string
}) {
  const size = 28
  const stroke = 3
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? completed / total : 0
  const offset = circumference - progress * circumference

  return (
    <div className="relative flex items-center justify-center" title={`${completed}/${total} completed`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-[9px] font-semibold text-gray-500">
        {total > 0 ? Math.round(progress * 100) : 0}
      </span>
    </div>
  )
}

interface HeadingItemProps {
  heading: ListHeading
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}

function HeadingItem({ heading, onRename, onDelete }: HeadingItemProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(heading.title)

  const handleSave = () => {
    const trimmed = title.trim()
    if (trimmed && trimmed !== heading.title) {
      onRename(heading.id, trimmed)
    } else {
      setTitle(heading.title)
    }
    setEditing(false)
  }

  return (
    <div className="group mt-6 mb-2 flex items-center gap-2 border-b border-gray-200 pb-1">
      {editing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setTitle(heading.title)
              setEditing(false)
            }
          }}
          autoFocus
          className="flex-1 border-none bg-transparent text-sm font-semibold text-gray-800 outline-none"
        />
      ) : (
        <span
          className="flex-1 cursor-pointer text-sm font-semibold uppercase tracking-wide text-gray-400"
          onDoubleClick={() => setEditing(true)}
        >
          {heading.title}
        </span>
      )}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => setEditing(true)}
          className="rounded p-1 text-gray-400 hover:text-gray-700"
          aria-label="Rename heading"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onDelete(heading.id)}
          className="rounded p-1 text-gray-400 hover:text-red-500"
          aria-label="Delete heading"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

export function ListPage() {
  const { id } = useParams<{ id: string }>()
  const list = useList(id ?? null)
  const tasks = useTasksByList(id ?? null)
  const headings = useListHeadings(id ?? null)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [addingHeading, setAddingHeading] = useState(false)
  const [newHeadingTitle, setNewHeadingTitle] = useState('')

  const { completed, total } = useMemo(() => {
    if (!tasks) return { completed: 0, total: 0 }
    const activeTasks = tasks.filter((t) => t.status !== 'cancelled')
    const completedTasks = activeTasks.filter((t) => t.status === 'completed')
    return { completed: completedTasks.length, total: activeTasks.length }
  }, [tasks])

  const sections = useMemo(() => {
    if (!tasks || !headings) return []

    const sortedHeadings = [...headings].sort((a, b) => a.position - b.position)
    const sortedTasks = [...tasks]
      .filter((t) => t.status !== 'cancelled')
      .sort((a, b) => a.position - b.position)

    const result: { heading: ListHeading | null; tasks: Task[] }[] = []

    if (sortedHeadings.length === 0) {
      return [{ heading: null, tasks: sortedTasks }]
    }

    let currentSection: { heading: ListHeading | null; tasks: Task[] } = {
      heading: null,
      tasks: [],
    }

    let headingIndex = 0

    for (const task of sortedTasks) {
      while (
        headingIndex < sortedHeadings.length &&
        task.position >= sortedHeadings[headingIndex].position
      ) {
        result.push(currentSection)
        currentSection = {
          heading: sortedHeadings[headingIndex],
          tasks: [],
        }
        headingIndex++
      }
      currentSection.tasks.push(task)
    }

    result.push(currentSection)
    while (headingIndex < sortedHeadings.length) {
      result.push({ heading: sortedHeadings[headingIndex], tasks: [] })
      headingIndex++
    }

    return result
  }, [tasks, headings])

  const handleAddHeading = useCallback(async () => {
    const trimmed = newHeadingTitle.trim()
    if (!trimmed || !id) return

    const maxPosition = headings
      ? Math.max(0, ...headings.map((h) => h.position))
      : 0

    await createListHeading({
      listId: id,
      title: trimmed,
      position: maxPosition + 1000,
    })

    setNewHeadingTitle('')
    setAddingHeading(false)
  }, [newHeadingTitle, id, headings])

  const handleRenameHeading = useCallback(
    async (headingId: string, title: string) => {
      await updateListHeading(headingId, { title })
    },
    [],
  )

  const handleDeleteHeading = useCallback(async (headingId: string) => {
    await deleteListHeading(headingId)
  }, [])

  if (!list) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="mx-auto max-w-4xl p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="flex h-3 w-3 rounded-full"
          style={{ backgroundColor: list.color }}
        />
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          {list.name}
        </h1>

        {total > 0 && (
          <ProgressRing completed={completed} total={total} color={list.color} />
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setAddingHeading(true)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Add heading"
            title="Add section heading"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Add heading input */}
      {addingHeading && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newHeadingTitle}
            onChange={(e) => setNewHeadingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddHeading()
              if (e.key === 'Escape') {
                setAddingHeading(false)
                setNewHeadingTitle('')
              }
            }}
            placeholder="Heading name"
            autoFocus
            className="h-8 flex-1 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
          <button
            onClick={handleAddHeading}
            disabled={!newHeadingTitle.trim()}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => {
              setAddingHeading(false)
              setNewHeadingTitle('')
            }}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200">
        <QuickAdd listId={id} />
        {tasks === undefined ? (
          <div className="space-y-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : tasks.length === 0 && (!headings || headings.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-2xl bg-gray-100 p-4 mb-4">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-1">
              No tasks in this list
            </h3>
            <p className="text-sm text-gray-400">
              Add tasks to get started.
            </p>
          </div>
        ) : (
          <div>
            {sections.map((section, idx) => (
              <div key={section.heading?.id ?? `ungrouped-${idx}`}>
                {section.heading && (
                  <HeadingItem
                    heading={section.heading}
                    onRename={handleRenameHeading}
                    onDelete={handleDeleteHeading}
                  />
                )}
                <TaskList
                  tasks={section.tasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={setSelectedTaskId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
