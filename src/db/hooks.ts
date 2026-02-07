import { useLiveQuery } from 'dexie-react-hooks'
import {
  db,
  getFilteredTasks,
  searchTasks as searchTasksFn,
  getTasksByDateRange as getTasksByDateRangeFn,
  getTasksForDate as getTasksForDateFn,
  getTasksWithTimeBlocks as getTasksWithTimeBlocksFn,
  getOverdueTasks as getOverdueTasksFn,
  getUnscheduledActiveTasks as getUnscheduledActiveTasksFn,
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
