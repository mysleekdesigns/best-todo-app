import { useState } from 'react'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { updateTask } from '@/db'
import type { Task } from '@/types'

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const

interface TimeBlockEditorProps {
  task?: Task
  defaultDate?: Date
  defaultHour?: number
  onClose: () => void
}

export function TimeBlockEditor({
  task,
  defaultDate,
  defaultHour,
  onClose,
}: TimeBlockEditorProps) {
  const initialTime = task?.dueTime
    ?? (defaultHour !== undefined ? `${String(defaultHour).padStart(2, '0')}:00` : '09:00')
  const initialDuration = task?.duration ?? 30

  const [startTime, setStartTime] = useState(initialTime)
  const [duration, setDuration] = useState(initialDuration)
  const [customDuration, setCustomDuration] = useState('')

  const isPreset = (DURATION_OPTIONS as readonly number[]).includes(duration)

  async function handleSave() {
    if (!task) {
      onClose()
      return
    }

    const changes: Partial<Task> = {
      dueTime: startTime,
      duration,
    }

    if (defaultDate && !task.dueDate) {
      changes.dueDate = format(defaultDate, 'yyyy-MM-dd')
    }

    await updateTask(task.id, changes)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {task ? 'Edit Time Block' : 'Time Block'}
          </DialogTitle>
        </DialogHeader>

        {task && (
          <p className="truncate text-sm text-muted-foreground">{task.title}</p>
        )}

        {/* Start time */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Duration
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DURATION_OPTIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  setDuration(mins)
                  setCustomDuration('')
                }}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                  duration === mins
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent',
                )}
              >
                {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="number"
              min={5}
              max={480}
              placeholder="Custom (min)"
              value={customDuration}
              onChange={(e) => {
                const val = e.target.value
                setCustomDuration(val)
                const num = parseInt(val, 10)
                if (num > 0) setDuration(num)
              }}
              className={cn(
                'w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring',
                !isPreset && duration > 0 && 'ring-2 ring-primary',
              )}
            />
            <span className="shrink-0 text-xs text-muted-foreground">min</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!task}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
