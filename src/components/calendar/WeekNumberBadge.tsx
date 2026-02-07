import { getISOWeek } from 'date-fns'

interface WeekNumberBadgeProps {
  date: Date
}

export function WeekNumberBadge({ date }: WeekNumberBadgeProps) {
  const weekNum = getISOWeek(date)

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      W{weekNum}
    </span>
  )
}
