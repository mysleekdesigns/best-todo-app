import { useLiveQuery } from 'dexie-react-hooks'
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  format,
  parseISO,
} from 'date-fns'
import {
  db,
  getFilteredTasks,
  searchTasks as searchTasksFn,
  getTasksByDateRange as getTasksByDateRangeFn,
  getTasksForDate as getTasksForDateFn,
  getTasksWithTimeBlocks as getTasksWithTimeBlocksFn,
  getOverdueTasks as getOverdueTasksFn,
  getUnscheduledActiveTasks as getUnscheduledActiveTasksFn,
  getFocusSessionsByDate as getFocusSessionsByDateFn,
  getHabitsDueToday as getHabitsDueTodayFn,
} from './index'
import type {
  Task,
  List,
  Tag,
  AppSettings,
  TaskStatus,
  ListHeading,
  SavedFilter,
  TaskFilter,
  StickyNote,
  FocusSession,
  Habit,
  HabitEntry,
} from '@/types'

// --- Task hooks ---

export function useTasks(status?: TaskStatus): Task[] | undefined {
  return useLiveQuery(() => {
    if (status) {
      return db.tasks.where('status').equals(status).sortBy('position')
    }
    return db.tasks.orderBy('position').toArray()
  }, [status])
}

export function useTask(id: string | null): Task | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined
    return db.tasks.get(id)
  }, [id])
}

export function useTasksByList(listId: string | null): Task[] | undefined {
  return useLiveQuery(() => {
    if (!listId) return []
    return db.tasks.where('listId').equals(listId).sortBy('position')
  }, [listId])
}

export function useSubtasks(parentId: string | null): Task[] | undefined {
  return useLiveQuery(() => {
    if (!parentId) return []
    return db.tasks.where('parentId').equals(parentId).sortBy('position')
  }, [parentId])
}

export function useTodayTasks(): Task[] | undefined {
  return useLiveQuery(() => {
    const today = new Date().toISOString().split('T')[0]
    return db.tasks
      .where('status')
      .equals('active')
      .filter((task) => task.dueDate === today || task.scheduledDate === today)
      .sortBy('position')
  })
}

// --- List hooks ---

export function useLists(): List[] | undefined {
  return useLiveQuery(() => db.projects.orderBy('position').toArray())
}

export function useList(id: string | null): List | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined
    return db.projects.get(id)
  }, [id])
}

// --- Tag hooks ---

export function useTags(): Tag[] | undefined {
  return useLiveQuery(() => db.tags.orderBy('name').toArray())
}

// --- Settings hook ---

export function useSettings(): AppSettings | undefined {
  return useLiveQuery(() => db.appSettings.get('app-settings'))
}

// --- StickyNote hooks ---

export function useStickyNotes(): StickyNote[] | undefined {
  return useLiveQuery(() => db.stickyNotes.orderBy('position').toArray())
}

export function useStickyNote(id: string | null): StickyNote | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined
    return db.stickyNotes.get(id)
  }, [id])
}

// --- Phase 2 hooks ---

export function useTasksByTag(tagId: string | null): Task[] | undefined {
  return useLiveQuery(() => {
    if (!tagId) return []
    return db.tasks
      .filter((task) => task.tags.includes(tagId))
      .sortBy('position')
  }, [tagId])
}

export function useFilteredTasks(filters: TaskFilter): Task[] | undefined {
  return useLiveQuery(() => {
    return getFilteredTasks(filters)
  }, [JSON.stringify(filters)])
}

export function useSavedFilters(): SavedFilter[] | undefined {
  return useLiveQuery(() => db.savedFilters.orderBy('position').toArray())
}

export function useListHeadings(listId: string | null): ListHeading[] | undefined {
  return useLiveQuery(() => {
    if (!listId) return []
    return db.projectHeadings.where('listId').equals(listId).sortBy('position')
  }, [listId])
}

export function useSearchTasks(query: string): Task[] | undefined {
  return useLiveQuery(() => {
    return searchTasksFn(query)
  }, [query])
}

// --- Phase 3: Calendar & Timeline hooks ---

export function useTasksByDateRange(
  startDate: string | null,
  endDate: string | null,
): Task[] | undefined {
  return useLiveQuery(() => {
    if (!startDate || !endDate) return []
    return getTasksByDateRangeFn(startDate, endDate)
  }, [startDate, endDate])
}

export function useTasksForDate(date: string | null): Task[] | undefined {
  return useLiveQuery(() => {
    if (!date) return []
    return getTasksForDateFn(date)
  }, [date])
}

export function useTasksWithTimeBlocks(date: string | null): Task[] | undefined {
  return useLiveQuery(() => {
    if (!date) return []
    return getTasksWithTimeBlocksFn(date)
  }, [date])
}

export function useOverdueTasks(): Task[] | undefined {
  return useLiveQuery(() => {
    return getOverdueTasksFn()
  })
}

export function useUnscheduledTasks(): Task[] | undefined {
  return useLiveQuery(() => {
    return getUnscheduledActiveTasksFn()
  })
}

// --- Phase 5: Focus Session hooks ---

export function useFocusSessions(): FocusSession[] | undefined {
  return useLiveQuery(() =>
    db.focusSessions.orderBy('startTime').reverse().toArray(),
  )
}

export function useFocusSession(id: string | null): FocusSession | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined
    return db.focusSessions.get(id)
  }, [id])
}

export function useTodayFocusSessions(): FocusSession[] | undefined {
  return useLiveQuery(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return getFocusSessionsByDateFn(today)
  })
}

export interface FocusStats {
  totalMinutes: number
  sessionCount: number
  streak: number
}

export function useFocusStats(range: 'today' | 'week' | 'month'): FocusStats | undefined {
  return useLiveQuery(() => {
    const now = new Date()
    let rangeStart: Date

    switch (range) {
      case 'today':
        rangeStart = startOfDay(now)
        break
      case 'week':
        rangeStart = startOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
        rangeStart = startOfMonth(now)
        break
    }

    const rangeStartStr = format(rangeStart, 'yyyy-MM-dd')

    return db.focusSessions
      .filter((session) => {
        const sessionDate = session.startTime.slice(0, 10)
        return sessionDate >= rangeStartStr && session.completed && session.type === 'work'
      })
      .toArray()
      .then((sessions) => {
        const totalMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0)
        const sessionCount = sessions.length

        // Calculate streak: consecutive days with at least one completed work session going backwards from today
        const todayStr = format(now, 'yyyy-MM-dd')
        // Get all completed work sessions for streak calculation (not limited to range)
        return db.focusSessions
          .filter((s) => s.completed && s.type === 'work')
          .toArray()
          .then((allSessions) => {
            const daysWithSessions = new Set(
              allSessions.map((s) => s.startTime.slice(0, 10)),
            )

            let streak = 0
            let checkDate = now

            // Check today first
            if (daysWithSessions.has(todayStr)) {
              streak = 1
              checkDate = subDays(now, 1)
            } else {
              // If no session today, start checking from yesterday
              checkDate = subDays(now, 1)
            }

            // Go backwards checking consecutive days
            while (true) {
              const dateStr = format(checkDate, 'yyyy-MM-dd')
              if (daysWithSessions.has(dateStr)) {
                streak++
                checkDate = subDays(checkDate, 1)
              } else {
                break
              }
            }

            return { totalMinutes, sessionCount, streak }
          })
      })
  }, [range])
}

// --- Phase 6: Habit hooks ---

export function useHabits(): Habit[] | undefined {
  return useLiveQuery(() => db.habits.orderBy('name').toArray())
}

export function useHabit(id: string | null): Habit | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined
    return db.habits.get(id)
  }, [id])
}

export function useTodayHabits(): Habit[] | undefined {
  return useLiveQuery(() => getHabitsDueTodayFn())
}

export interface HabitStats {
  completionRate: number
  currentStreak: number
  bestStreak: number
  totalCompleted: number
}

export function useHabitStats(habitId: string | null): HabitStats | undefined {
  return useLiveQuery(() => {
    if (!habitId) return undefined
    return db.habits.get(habitId).then((habit) => {
      if (!habit) return undefined

      const entries = habit.entries
      const completedEntries = entries.filter((e) => e.completed)
      const totalCompleted = completedEntries.length
      const completionRate = entries.length > 0 ? totalCompleted / entries.length : 0

      // Sort completed entry dates descending for streak calculation
      const completedDates = completedEntries
        .map((e) => e.date)
        .sort((a, b) => b.localeCompare(a))

      const completedSet = new Set(completedDates)

      // Current streak: consecutive days going backwards from today
      let currentStreak = 0
      let checkDate = new Date()
      const todayStr = format(checkDate, 'yyyy-MM-dd')

      if (completedSet.has(todayStr)) {
        currentStreak = 1
        checkDate = subDays(checkDate, 1)
      } else {
        checkDate = subDays(checkDate, 1)
      }

      while (completedSet.has(format(checkDate, 'yyyy-MM-dd'))) {
        currentStreak++
        checkDate = subDays(checkDate, 1)
      }

      // Best streak: find longest run of consecutive days in all completed dates
      let bestStreak = 0
      if (completedDates.length > 0) {
        const sortedAsc = [...completedDates].sort()
        let runLength = 1

        for (let i = 1; i < sortedAsc.length; i++) {
          const prev = parseISO(sortedAsc[i - 1])
          const curr = parseISO(sortedAsc[i])
          const diffMs = curr.getTime() - prev.getTime()
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            runLength++
          } else {
            bestStreak = Math.max(bestStreak, runLength)
            runLength = 1
          }
        }
        bestStreak = Math.max(bestStreak, runLength)
      }

      return { completionRate, currentStreak, bestStreak, totalCompleted }
    })
  }, [habitId])
}

export function useHabitEntries(
  habitId: string | null,
  startDate?: string,
  endDate?: string,
): HabitEntry[] | undefined {
  return useLiveQuery(() => {
    if (!habitId) return undefined
    return db.habits.get(habitId).then((habit) => {
      if (!habit) return undefined

      let entries = habit.entries

      if (startDate) {
        entries = entries.filter((e) => e.date >= startDate)
      }
      if (endDate) {
        entries = entries.filter((e) => e.date <= endDate)
      }

      return entries.sort((a, b) => a.date.localeCompare(b.date))
    })
  }, [habitId, startDate, endDate])
}
