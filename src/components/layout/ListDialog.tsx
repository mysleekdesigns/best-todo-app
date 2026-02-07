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
import { createList, updateList, deleteList } from '@/db'
import type { List } from '@/types'

const LIST_COLORS = [
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#f97316', // orange
  '#22c55e', // green
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#a855f7', // purple
  '#ef4444', // red
  '#84cc16', // lime
  '#78716c', // stone
]

interface ListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list?: List | null
}

export function ListDialog({ open, onOpenChange, list }: ListDialogProps) {
  const isEditing = !!list

  const [name, setName] = useState('')
  const [color, setColor] = useState(LIST_COLORS[0])

  useEffect(() => {
    if (list) {
      setName(list.name)
      setColor(list.color)
    } else {
      setName('')
      setColor(LIST_COLORS[0])
    }
  }, [list, open])

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) return

    if (isEditing && list) {
      await updateList(list.id, { name: trimmed, color })
    } else {
      await createList({ name: trimmed, color })
    }
    onOpenChange(false)
  }, [name, color, isEditing, list, onOpenChange])

  const handleDelete = useCallback(async () => {
    if (!list) return
    await deleteList(list.id)
    onOpenChange(false)
  }, [list, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit List' : 'New List'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this list\'s details.' : 'Create a new list to organize your tasks.'}
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
              placeholder="List name"
              autoFocus
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Color */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {LIST_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-gray-400 ring-offset-2 ring-offset-background' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
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
