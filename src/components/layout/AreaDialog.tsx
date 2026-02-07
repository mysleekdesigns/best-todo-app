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
import { createArea, updateArea, deleteArea } from '@/db'
import type { Area } from '@/types'

interface AreaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  area?: Area | null
}

export function AreaDialog({ open, onOpenChange, area }: AreaDialogProps) {
  const isEditing = !!area
  const [name, setName] = useState('')

  useEffect(() => {
    if (area) {
      setName(area.name)
    } else {
      setName('')
    }
  }, [area, open])

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) return

    if (isEditing && area) {
      await updateArea(area.id, { name: trimmed })
    } else {
      await createArea({ name: trimmed })
    }
    onOpenChange(false)
  }, [name, isEditing, area, onOpenChange])

  const handleDelete = useCallback(async () => {
    if (!area) return
    await deleteArea(area.id)
    onOpenChange(false)
  }, [area, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Area' : 'New Area'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this area\'s name.' : 'Create a new area to group related projects.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
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
            placeholder="Area name"
            autoFocus
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
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
