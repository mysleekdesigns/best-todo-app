import { cn } from '@/lib/utils'
import type { Task } from '@/types'

const priorityBg: Record<number, string> = {
  0: 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200',
  1: 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200',
  2: 'bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-200',
  3: 'bg-red-50 border-red-300 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-200',
}

const START_HOUR = 6
const TOTAL_MINUTES = (22 - START_HOUR) * 60

interface TimeBlockProps {
  task: Task
  onClick?: (task: Task) => void
}

export function TimeBlock({ task, onClick }: TimeBlockProps) {
  if (!task.dueTime || !task.duration) return null

  const [hourStr, minStr] = task.dueTime.split(':')
  const startMinutes = (parseInt(hourStr, 10) - START_HOUR) * 60 + parseInt(minStr, 10)
  const topPercent = (startMinutes / TOTAL_MINUTES) * 100
  const heightPercent = (task.duration / TOTAL_MINUTES) * 100

  return (
    <button
      type="button"
      onClick={() => onClick?.(task)}
      className={cn(
        'absolute right-1 left-1 overflow-hidden rounded-md border px-2 py-1 text-left text-xs shadow-sm transition-shadow hover:shadow-md',
        priorityBg[task.priority],
      )}
      style={{
        top: `${topPercent}%`,
        height: `${heightPercent}%`,
        minHeight: '1.25rem',
      }}
    >
      <span className="line-clamp-2 font-medium">{task.title}</span>
    </button>
  )
}
