import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, ChevronRight } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { completeHabitEntry } from '@/db'
import { cn } from '@/lib/utils'
import type { Habit } from '@/types'

interface HabitCardProps {
  habit: Habit
  onSelect: (id: string) => void
  selected?: boolean
}

export function HabitCard({ habit, onSelect, selected }: HabitCardProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const isDoneToday = habit.entries.some(
    (e) => e.date === today && e.completed,
  )

  const currentStreak = useMemo(() => {
    const completedSet = new Set(
      habit.entries.filter((e) => e.completed).map((e) => e.date),
    )
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd')
      if (completedSet.has(dateStr)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  }, [habit.entries])

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    await completeHabitEntry(habit.id, today)
  }

  return (
    <motion.button
      layout
      onClick={() => onSelect(habit.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50',
        selected && 'ring-2 ring-gray-300',
      )}
    >
      {/* Checkbox */}
      <motion.div
        className="relative flex shrink-0 items-center justify-center"
        whileTap={{ scale: 0.9 }}
      >
        <button
          onClick={handleToggle}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
            isDoneToday
              ? 'border-transparent'
              : 'border-gray-300 hover:border-gray-400',
          )}
          style={{
            backgroundColor: isDoneToday ? habit.color : 'transparent',
          }}
          aria-label={isDoneToday ? 'Mark as not done' : 'Mark as done'}
        >
          {isDoneToday && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              width="14"
              height="14"
              viewBox="0 0 14 14"
              className="text-white"
            >
              <path
                d="M3 7l3 3 5-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </button>
      </motion.div>

      {/* Color indicator + name */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: habit.color }}
        />
        <span
          className={cn(
            'truncate text-sm font-medium text-gray-900',
            isDoneToday && 'text-gray-400 line-through',
          )}
        >
          {habit.name}
        </span>
      </div>

      {/* Streak badge */}
      {currentStreak > 0 && (
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5">
          <Flame size={12} className="text-orange-500" />
          <span className="text-xs font-medium text-orange-600">
            {currentStreak}
          </span>
        </div>
      )}

      <ChevronRight size={16} className="shrink-0 text-gray-300" />
    </motion.button>
  )
}
