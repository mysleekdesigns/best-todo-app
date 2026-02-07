import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { addDays, format } from 'date-fns'
import type { Task } from '@/types'

// Re-export the hooks defined by the DB layer
export {
  useTasks,
  useTask,
  useSubtasks,
  useTasksByProject,
  useTodayTasks,
  useInboxTasks,
} from '@/db/hooks'

// Additional task-specific hooks not in db/hooks

export function useEveningTasks() {
  return useLiveQuery(async () => {
    const today = new Date().toISOString().split('T')[0]
    return db.tasks
      .where('status')
      .anyOf(['inbox', 'active'])
      .and(
        (t: Task) =>
          t.isEvening &&
          (t.dueDate === today ||
            t.scheduledDate === today ||
            (!t.dueDate && !t.scheduledDate)),
      )
      .sortBy('position')
  })
}

// --- Smart View Hooks ---

export function useUpcomingTasks(days = 14) {
  return useLiveQuery(() => {
    const today = new Date().toISOString().split('T')[0]
    const endDate = format(addDays(new Date(), days), 'yyyy-MM-dd')
    return db.tasks
      .where('status')
      .equals('active')
      .filter(
        (t) =>
          t.dueDate !== null &&
          t.dueDate >= today &&
          t.dueDate <= endDate,
      )
      .sortBy('dueDate')
  }, [days])
}

export function useAnytimeTasks() {
  return useLiveQuery(() => {
    return db.tasks
      .where('status')
      .equals('active')
      .filter((t) => !t.parentId)
      .sortBy('position')
  })
}

export function useSomedayTasks() {
  return useLiveQuery(() => {
    return db.tasks
      .where('status')
      .equals('active')
      .filter(
        (t) =>
          !t.dueDate &&
          !t.scheduledDate &&
          !t.parentId,
      )
      .sortBy('position')
  })
}

export function useLogbookTasks() {
  return useLiveQuery(() => {
    return db.tasks
      .where('status')
      .equals('completed')
      .reverse()
      .sortBy('completedAt')
  })
}
