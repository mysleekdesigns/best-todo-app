import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './index'
import type { Task, Project, Area, Tag, AppSettings, TaskStatus } from '@/types'

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

export function useTasksByProject(projectId: string | null): Task[] | undefined {
  return useLiveQuery(() => {
    if (!projectId) return []
    return db.tasks.where('projectId').equals(projectId).sortBy('position')
  }, [projectId])
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

export function useInboxTasks(): Task[] | undefined {
  return useLiveQuery(() => {
    return db.tasks.where('status').equals('inbox').sortBy('position')
  })
}

// --- Project hooks ---

export function useProjects(): Project[] | undefined {
  return useLiveQuery(() => db.projects.orderBy('position').toArray())
}

export function useProject(id: string | null): Project | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined
    return db.projects.get(id)
  }, [id])
}

// --- Area hooks ---

export function useAreas(): Area[] | undefined {
  return useLiveQuery(() => db.areas.orderBy('position').toArray())
}

export function useArea(id: string | null): Area | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined
    return db.areas.get(id)
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
