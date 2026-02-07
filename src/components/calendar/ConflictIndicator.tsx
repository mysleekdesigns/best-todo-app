import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

interface ConflictIndicatorProps {
  tasks: Task[]
  className?: string
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function hasOverlap(a: Task, b: Task): boolean {
  if (!a.dueTime || !a.duration || !b.dueTime || !b.duration) return false
  const aStart = parseTime(a.dueTime)
  const aEnd = aStart + a.duration
  const bStart = parseTime(b.dueTime)
  const bEnd = bStart + b.duration
  return aStart < bEnd && bStart < aEnd
}

export function useConflicts(tasks: Task[]): Task[][] {
  return useMemo(() => {
    const timed = tasks.filter((t) => t.dueTime && t.duration)
    const conflicts: Task[][] = []
    const seen = new Set<string>()

    for (let i = 0; i < timed.length; i++) {
      for (let j = i + 1; j < timed.length; j++) {
        if (hasOverlap(timed[i], timed[j])) {
          const key = [timed[i].id, timed[j].id].sort().join('-')
          if (!seen.has(key)) {
            seen.add(key)
            conflicts.push([timed[i], timed[j]])
          }
        }
      }
    }
    return conflicts
  }, [tasks])
}

export function ConflictIndicator({ tasks, className }: ConflictIndicatorProps) {
  const conflicts = useConflicts(tasks)

  if (conflicts.length === 0) return null

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-md border border-orange-300 bg-orange-50 px-2 py-1 text-xs text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300',
        className,
      )}
    >
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>
        {conflicts.length} overlapping time block{conflicts.length > 1 ? 's' : ''}
      </span>
    </div>
  )
}
