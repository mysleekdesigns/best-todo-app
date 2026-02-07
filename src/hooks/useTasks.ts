import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { addDays, format } from 'date-fns'

// Re-export the hooks defined by the DB layer
export {
  useTasks,
  useTask,
  useSubtasks,
  useTasksByList,
  useTodayTasks,
} from '@/db/hooks'

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
