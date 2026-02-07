import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layers, FolderOpen, Pencil } from 'lucide-react'
import { useArea, useProjects } from '@/db/hooks'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { AreaDialog } from '@/components/layout/AreaDialog'
import type { Project } from '@/types'

function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const taskCount = useLiveQuery(
    () => db.tasks.where('projectId').equals(project.id).count(),
    [project.id],
  )

  return (
    <button
      onClick={() => navigate(`/project/${project.id}`)}
      className="flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
        style={{ backgroundColor: project.color + '20', color: project.color }}
      >
        {project.emoji || <FolderOpen size={16} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
      </div>
      {taskCount !== undefined && taskCount > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">{taskCount}</span>
      )}
    </button>
  )
}

export function AreaPage() {
  const { id } = useParams<{ id: string }>()
  const area = useArea(id ?? null)
  const allProjects = useProjects()
  const [areaDialogOpen, setAreaDialogOpen] = useState(false)

  const areaProjects = useMemo(() => {
    if (!allProjects || !id) return []
    return allProjects.filter((p) => p.areaId === id)
  }, [allProjects, id])

  if (!area) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center gap-3 pb-6">
        <Layers size={22} className="text-muted-foreground" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {area.name}
        </h2>
        <button
          onClick={() => setAreaDialogOpen(true)}
          className="ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Edit area"
        >
          <Pencil size={16} />
        </button>
      </div>

      {areaProjects.length === 0 ? (
        <div className="py-16 text-center">
          <Layers size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">No projects in this area</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Assign projects to this area to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {areaProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <AreaDialog
        open={areaDialogOpen}
        onOpenChange={setAreaDialogOpen}
        area={area}
      />
    </div>
  )
}
