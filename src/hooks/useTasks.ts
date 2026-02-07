import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
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
