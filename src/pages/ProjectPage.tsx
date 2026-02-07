import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FolderOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import { useProject, useTasksByProject, useProjectHeadings } from '@/db/hooks'
import {
  createProjectHeading,
  updateProjectHeading,
  deleteProjectHeading,
  completeTask,
  updateTask,
} from '@/db'
import { ProjectDialog } from '@/components/layout/ProjectDialog'
import type { Task, ProjectHeading } from '@/types'

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
          className="text-muted/50"
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
      <span className="absolute text-[9px] font-semibold text-muted-foreground">
        {total > 0 ? Math.round(progress * 100) : 0}
      </span>
    </div>
  )
}

interface HeadingItemProps {
  heading: ProjectHeading
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
    <div className="group mt-6 mb-2 flex items-center gap-2 border-b border-border/50 pb-1">
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
          className="flex-1 border-none bg-transparent text-sm font-semibold text-foreground/80 outline-none"
        />
      ) : (
        <span
          className="flex-1 cursor-pointer text-sm font-semibold uppercase tracking-wide text-foreground/50"
          onDoubleClick={() => setEditing(true)}
        >
          {heading.title}
        </span>
      )}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => setEditing(true)}
          className="rounded p-1 text-muted-foreground/50 hover:text-foreground"
          aria-label="Rename heading"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onDelete(heading.id)}
          className="rounded p-1 text-muted-foreground/50 hover:text-destructive"
          aria-label="Delete heading"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  const isCompleted = task.status === 'completed'

  const handleToggle = async () => {
    if (isCompleted) {
      await updateTask(task.id, { status: 'active', completedAt: null })
    } else {
      await completeTask(task.id)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent">
      <button
        onClick={handleToggle}
        className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
          isCompleted
            ? 'border-muted-foreground/30 bg-muted-foreground/20'
            : 'border-muted-foreground/30 hover:border-primary'
        }`}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {isCompleted && (
          <svg viewBox="0 0 16 16" className="p-0.5 text-muted-foreground/50">
            <path
              d="M4 8l3 3 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <span
        className={`text-sm font-medium ${
          isCompleted ? 'text-muted-foreground/50 line-through' : 'text-foreground'
        }`}
      >
        {task.title}
      </span>
    </div>
  )
}

export function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const project = useProject(id ?? null)
  const tasks = useTasksByProject(id ?? null)
  const headings = useProjectHeadings(id ?? null)

  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [addingHeading, setAddingHeading] = useState(false)
  const [newHeadingTitle, setNewHeadingTitle] = useState('')

  // Compute progress
  const { completed, total } = useMemo(() => {
    if (!tasks) return { completed: 0, total: 0 }
    const activeTasks = tasks.filter((t) => t.status !== 'cancelled')
    const completedTasks = activeTasks.filter((t) => t.status === 'completed')
    return { completed: completedTasks.length, total: activeTasks.length }
  }, [tasks])

  // Group tasks by heading: tasks with no heading come first, then grouped by heading position
  const sections = useMemo(() => {
    if (!tasks || !headings) return []

    const sortedHeadings = [...headings].sort((a, b) => a.position - b.position)

    // All tasks sorted by position
    const sortedTasks = [...tasks]
      .filter((t) => t.status !== 'cancelled')
      .sort((a, b) => a.position - b.position)

    // Simple grouping: assign tasks to headings based on task position relative to heading positions
    const result: { heading: ProjectHeading | null; tasks: Task[] }[] = []

    // Ungrouped tasks (position before first heading, or if no headings)
    if (sortedHeadings.length === 0) {
      return [{ heading: null, tasks: sortedTasks }]
    }

    let currentSection: { heading: ProjectHeading | null; tasks: Task[] } = {
      heading: null,
      tasks: [],
    }

    let headingIndex = 0

    for (const task of sortedTasks) {
      // Check if we've passed the next heading's position
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

    // Push remaining headings
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

    await createProjectHeading({
      projectId: id,
      title: trimmed,
      position: maxPosition + 1000,
    })

    setNewHeadingTitle('')
    setAddingHeading(false)
  }, [newHeadingTitle, id, headings])

  const handleRenameHeading = useCallback(
    async (headingId: string, title: string) => {
      await updateProjectHeading(headingId, { title })
    },
    [],
  )

  const handleDeleteHeading = useCallback(async (headingId: string) => {
    await deleteProjectHeading(headingId)
  }, [])

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-base"
          style={{ backgroundColor: project.color + '20', color: project.color }}
        >
          {project.emoji || <FolderOpen size={18} />}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {project.name}
        </h2>

        {total > 0 && (
          <ProgressRing completed={completed} total={total} color={project.color} />
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setAddingHeading(true)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Add heading"
            title="Add section heading"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setProjectDialogOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Edit project"
            title="Edit project"
          >
            <Pencil size={16} />
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
            className="h-8 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleAddHeading}
            disabled={!newHeadingTitle.trim()}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => {
              setAddingHeading(false)
              setNewHeadingTitle('')
            }}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Content */}
      {tasks === undefined ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : tasks.length === 0 && (!headings || headings.length === 0) ? (
        <div className="py-16 text-center">
          <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            No tasks in this project
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Add tasks to get started with this project.
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
              <div className="space-y-1">
                {section.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project edit dialog */}
      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={(open) => {
          setProjectDialogOpen(open)
          // If project was deleted, navigate away
          if (!open && !project) {
            navigate('/inbox')
          }
        }}
        project={project}
      />
    </div>
  )
}
