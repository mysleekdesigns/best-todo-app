import { useMemo } from 'react'
import { Flame, Trophy, CalendarCheck } from 'lucide-react'
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from 'date-fns'
import type { Habit } from '@/types'

interface HabitStatsProps {
  habit: Habit
}

function computeStats(habit: Habit) {
  const completedEntries = habit.entries
    .filter((e) => e.completed)
    .map((e) => e.date)
    .sort()

  // Current streak
  let currentStreak = 0
  const completedSet = new Set(completedEntries)

  // Check today first, then go backwards
  for (let i = 0; i < 365; i++) {
    const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd')
    if (completedSet.has(dateStr)) {
      currentStreak++
    } else if (i > 0) {
      // Allow today to be incomplete
      break
    }
  }

  // Best streak
  let bestStreak = 0
  let tempStreak = 0
  const sortedDates = [...completedSet].sort()
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prev = parseISO(sortedDates[i - 1])
      const curr = parseISO(sortedDates[i])
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (diffDays === 1) {
        tempStreak++
      } else {
        tempStreak = 1
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak)
  }

  // Weekly completion
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const thisWeekCompletions = completedEntries.filter((dateStr) => {
    const d = parseISO(dateStr)
    return isWithinInterval(d, { start: weekStart, end: weekEnd })
  }).length

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, habit.streakBest),
    weekCompletions: thisWeekCompletions,
    totalCompletions: completedEntries.length,
  }
}

export function HabitStats({ habit }: HabitStatsProps) {
  const stats = useMemo(() => computeStats(habit), [habit])

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-950/30">
        <Flame size={18} className="text-orange-500" />
        <div>
          <p className="text-lg font-bold text-foreground">{stats.currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current streak</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/30">
        <Trophy size={18} className="text-yellow-500" />
        <div>
          <p className="text-lg font-bold text-foreground">{stats.bestStreak}</p>
          <p className="text-xs text-muted-foreground">Best streak</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
        <CalendarCheck size={18} className="text-blue-500" />
        <div>
          <p className="text-lg font-bold text-foreground">{stats.weekCompletions}/7</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
        <CalendarCheck size={18} className="text-green-500" />
        <div>
          <p className="text-lg font-bold text-foreground">{stats.totalCompletions}</p>
          <p className="text-xs text-muted-foreground">Total completions</p>
        </div>
      </div>
    </div>
  )
}
