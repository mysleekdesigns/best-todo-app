import { cn } from '@/lib/utils'
import type { Priority } from '@/types'

const priorityColors: Record<Priority, string> = {
  0: 'bg-muted-foreground/60',
  1: 'bg-blue-400',
  2: 'bg-yellow-400',
  3: 'bg-red-400',
}

interface CalendarTaskDotProps {
  priority: Priority
  className?: string
}

export function CalendarTaskDot({ priority, className }: CalendarTaskDotProps) {
  return (
    <span
      className={cn(
        'inline-block h-1.5 w-1.5 rounded-full',
        priorityColors[priority],
        className,
      )}
    />
  )
}
