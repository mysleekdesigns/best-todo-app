import { getISOWeek } from 'date-fns'

interface WeekNumberBadgeProps {
  date: Date
}

export function WeekNumberBadge({ date }: WeekNumberBadgeProps) {
  const weekNum = getISOWeek(date)

  return (
    <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      W{weekNum}
    </span>
  )
}
