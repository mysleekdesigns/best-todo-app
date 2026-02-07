import { cn } from '@/lib/utils'
import type { Priority } from '@/types'

const priorities: { value: Priority; label: string; color: string; activeColor: string }[] = [
  { value: 0, label: 'None', color: 'bg-muted-foreground/40', activeColor: 'ring-muted-foreground' },
  { value: 1, label: 'Low', color: 'bg-blue-400', activeColor: 'ring-blue-400' },
  { value: 2, label: 'Medium', color: 'bg-yellow-400', activeColor: 'ring-yellow-400' },
  { value: 3, label: 'High', color: 'bg-red-400', activeColor: 'ring-red-400' },
]

interface PrioritySelectorProps {
  value: Priority
  onChange: (priority: Priority) => void
  className?: string
}

export function PrioritySelector({ value, onChange, className }: PrioritySelectorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} role="radiogroup" aria-label="Task priority">
      {priorities.map((p) => (
        <button
          key={p.value}
          type="button"
          role="radio"
          aria-checked={value === p.value}
          aria-label={`Priority: ${p.label}`}
          onClick={() => onChange(p.value)}
          className={cn(
            'h-3 w-3 rounded-full transition-all duration-150',
            p.color,
            value === p.value && `ring-2 ring-offset-2 ${p.activeColor}`,
          )}
        />
      ))}
    </div>
  )
}
