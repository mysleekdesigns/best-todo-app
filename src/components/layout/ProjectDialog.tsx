import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createProject, updateProject, deleteProject } from '@/db'
import { useAreas } from '@/db/hooks'
import type { Project } from '@/types'

const PROJECT_COLORS = [
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#0ea5e9', // sky
  '#14b8a6', // teal
  '#22c55e', // green
  '#84cc16', // lime
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#a855f7', // purple
  '#78716c', // stone
]

const PROJECT_EMOJIS = [
  '', '📁', '📋', '🎯', '🚀', '💼', '📚', '🎨', '🔧', '💡',
  '🏠', '🎵', '🏋️', '🌱', '✈️', '📝', '🛒', '❤️', '⭐', '🔬',
]

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
  defaultAreaId?: string | null
}

export function ProjectDialog({ open, onOpenChange, project, defaultAreaId }: ProjectDialogProps) {
  const areas = useAreas()
  const isEditing = !!project

  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [emoji, setEmoji] = useState('')
  const [areaId, setAreaId] = useState<string | null>(null)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setColor(project.color)
      setEmoji(project.emoji)
      setAreaId(project.areaId)
    } else {
      setName('')
      setColor(PROJECT_COLORS[0])
      setEmoji('')
      setAreaId(defaultAreaId ?? null)
    }
  }, [project, open, defaultAreaId])

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) return

    if (isEditing && project) {
      await updateProject(project.id, { name: trimmed, color, emoji, areaId })
    } else {
      await createProject({ name: trimmed, color, emoji, areaId })
    }
    onOpenChange(false)
  }, [name, color, emoji, areaId, isEditing, project, onOpenChange])

  const handleDelete = useCallback(async () => {
    if (!project) return
    await deleteProject(project.id)
    onOpenChange(false)
  }, [project, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Project' : 'New Project'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this project\'s details.' : 'Create a new project to organize your tasks.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
              placeholder="Project name"
              autoFocus
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Emoji
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_EMOJIS.map((e) => (
                <button
                  key={e || 'none'}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                    emoji === e
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {e || '—'}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Area */}
          {areas && areas.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Area
              </label>
              <select
                value={areaId ?? ''}
                onChange={(e) => setAreaId(e.target.value || null)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="">No area</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter>
          {isEditing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="mr-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim()}>
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
