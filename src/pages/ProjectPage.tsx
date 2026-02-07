import { useParams } from 'react-router-dom'
import { FolderOpen } from 'lucide-react'
import { useProject, useTasksByProject } from '@/db/hooks'

export function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const project = useProject(id ?? null)
  const tasks = useTasksByProject(id ?? null)

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
      <div className="flex items-center gap-3 pb-6">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-base"
          style={{ backgroundColor: project.color + '20', color: project.color }}
        >
          {project.emoji || <FolderOpen size={18} />}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h2>
        {tasks && tasks.length > 0 && (
          <span className="text-sm text-muted-foreground">{tasks.length}</span>
        )}
      </div>

      {tasks === undefined ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">No tasks in this project</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Add tasks to get started with this project.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent"
            >
              <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
              <span className="text-sm font-medium text-foreground">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
