import Dexie, { type EntityTable } from 'dexie'
import { nanoid } from 'nanoid'
import { addDays, addWeeks, addMonths, addYears } from 'date-fns'
import type {
  Task,
  Project,
  Area,
  Tag,
  FocusSession,
  Habit,
  AppSettings,
  TaskStatus,
  Priority,
  ChecklistItem,
  ProjectHeading,
  SavedFilter,
  TaskFilter,
  RecurringRule,
} from '@/types'

export class ZenithDB extends Dexie {
  tasks!: EntityTable<Task, 'id'>
  projects!: EntityTable<Project, 'id'>
  areas!: EntityTable<Area, 'id'>
  tags!: EntityTable<Tag, 'id'>
  focusSessions!: EntityTable<FocusSession, 'id'>
  habits!: EntityTable<Habit, 'id'>
  appSettings!: EntityTable<AppSettings, 'id'>
  projectHeadings!: EntityTable<ProjectHeading, 'id'>
  savedFilters!: EntityTable<SavedFilter, 'id'>

  constructor() {
    super('zenith')

    this.version(1).stores({
      tasks:
        'id, title, status, priority, dueDate, scheduledDate, projectId, areaId, parentId, position, kanbanColumn, createdAt, updatedAt',
      projects: 'id, name, areaId, position',
      areas: 'id, name, position',
      tags: 'id, name',
      focusSessions: 'id, taskId, startTime, type, completed',
      habits: 'id, name, frequency',
      appSettings: 'id',
    })

    this.version(2).stores({
      tasks:
        'id, title, status, priority, dueDate, scheduledDate, projectId, areaId, parentId, position, kanbanColumn, createdAt, updatedAt, *tags',
      projects: 'id, name, areaId, position',
      areas: 'id, name, position',
      tags: 'id, name',
      focusSessions: 'id, taskId, startTime, type, completed',
      habits: 'id, name, frequency',
      appSettings: 'id',
      projectHeadings: 'id, projectId, position',
      savedFilters: 'id, name, position',
    })

    this.version(3).stores({
      tasks:
        'id, title, status, priority, dueDate, dueTime, scheduledDate, projectId, areaId, parentId, position, kanbanColumn, createdAt, updatedAt, *tags',
      projects: 'id, name, areaId, position',
      areas: 'id, name, position',
      tags: 'id, name',
      focusSessions: 'id, taskId, startTime, type, completed',
      habits: 'id, name, frequency',
      appSettings: 'id',
      projectHeadings: 'id, projectId, position',
      savedFilters: 'id, name, position',
    }).upgrade(tx => {
      return tx.table('tasks').toCollection().modify(task => {
        if (task.duration === undefined) {
          task.duration = null
        }
      })
    })
  }
}

export const db = new ZenithDB()

// --- Task CRUD ---

export async function createTask(
  data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<string> {
  const now = new Date().toISOString()
  const id = nanoid()
  await db.tasks.add({
    id,
    title: data.title ?? '',
    notes: data.notes ?? '',
    status: data.status ?? 'inbox',
    priority: data.priority ?? 0,
    dueDate: data.dueDate ?? null,
    dueTime: data.dueTime ?? null,
    scheduledDate: data.scheduledDate ?? null,
    completedAt: data.completedAt ?? null,
    createdAt: now,
    updatedAt: now,
    projectId: data.projectId ?? null,
    areaId: data.areaId ?? null,
    parentId: data.parentId ?? null,
    position: data.position ?? 0,
    tags: data.tags ?? [],
    checklist: data.checklist ?? [],
    isEvening: data.isEvening ?? false,
    recurringRule: data.recurringRule ?? null,
    kanbanColumn: data.kanbanColumn ?? null,
    duration: data.duration ?? null,
  })
  return id
}

export async function updateTask(id: string, changes: Partial<Task>): Promise<void> {
  await db.tasks.update(id, {
    ...changes,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id)
}

export async function completeTask(id: string): Promise<void> {
  await updateTask(id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  })
}

export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  return db.tasks.where('status').equals(status).sortBy('position')
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  return db.tasks.where('projectId').equals(projectId).sortBy('position')
}

export async function getSubtasks(parentId: string): Promise<Task[]> {
  return db.tasks.where('parentId').equals(parentId).sortBy('position')
}

// --- Project CRUD ---

export async function createProject(
  data: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<string> {
  const id = nanoid()
  await db.projects.add({
    id,
    name: data.name ?? '',
    color: data.color ?? '#6366f1',
    emoji: data.emoji ?? '',
    areaId: data.areaId ?? null,
    position: data.position ?? 0,
    createdAt: new Date().toISOString(),
  })
  return id
}

export async function updateProject(id: string, changes: Partial<Project>): Promise<void> {
  await db.projects.update(id, changes)
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id)
}

// --- Area CRUD ---

export async function createArea(
  data: Partial<Omit<Area, 'id' | 'createdAt'>>,
): Promise<string> {
  const id = nanoid()
  await db.areas.add({
    id,
    name: data.name ?? '',
    position: data.position ?? 0,
    createdAt: new Date().toISOString(),
  })
  return id
}

export async function updateArea(id: string, changes: Partial<Area>): Promise<void> {
  await db.areas.update(id, changes)
}

export async function deleteArea(id: string): Promise<void> {
  await db.areas.delete(id)
}

// --- Tag CRUD ---

export async function createTag(data: Partial<Omit<Tag, 'id'>>): Promise<string> {
  const id = nanoid()
  await db.tags.add({
    id,
    name: data.name ?? '',
    color: data.color ?? '#6366f1',
  })
  return id
}

export async function updateTag(id: string, changes: Partial<Tag>): Promise<void> {
  await db.tags.update(id, changes)
}

export async function deleteTag(id: string): Promise<void> {
  await db.tags.delete(id)
}

// --- FocusSession CRUD ---

export async function createFocusSession(
  data: Partial<Omit<FocusSession, 'id'>>,
): Promise<string> {
  const id = nanoid()
  await db.focusSessions.add({
    id,
    taskId: data.taskId ?? null,
    startTime: data.startTime ?? new Date().toISOString(),
    endTime: data.endTime ?? '',
    duration: data.duration ?? 0,
    type: data.type ?? 'work',
    completed: data.completed ?? false,
    notes: data.notes ?? '',
  })
  return id
}

export async function updateFocusSession(
  id: string,
  changes: Partial<FocusSession>,
): Promise<void> {
  await db.focusSessions.update(id, changes)
}

// --- Habit CRUD ---

export async function createHabit(data: Partial<Omit<Habit, 'id' | 'createdAt'>>): Promise<string> {
  const id = nanoid()
  await db.habits.add({
    id,
    name: data.name ?? '',
    description: data.description ?? '',
    frequency: data.frequency ?? 'daily',
    frequencyDays: data.frequencyDays ?? [],
    color: data.color ?? '#6366f1',
    icon: data.icon ?? '',
    streakCurrent: data.streakCurrent ?? 0,
    streakBest: data.streakBest ?? 0,
    createdAt: new Date().toISOString(),
    entries: data.entries ?? [],
  })
  return id
}

export async function updateHabit(id: string, changes: Partial<Habit>): Promise<void> {
  await db.habits.update(id, changes)
}

export async function deleteHabit(id: string): Promise<void> {
  await db.habits.delete(id)
}

// --- AppSettings ---

const SETTINGS_ID = 'app-settings'

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.appSettings.get(SETTINGS_ID)
  if (settings) return settings

  const defaults: AppSettings = {
    id: SETTINGS_ID,
    theme: 'system',
    pomodoroWork: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    pomodoroAutoStart: false,
    defaultView: 'inbox',
    weekStartsOn: 1,
  }
  await db.appSettings.add(defaults)
  return defaults
}

export async function updateSettings(changes: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
  await db.appSettings.update(SETTINGS_ID, changes)
}

// --- ProjectHeading CRUD ---

export async function createProjectHeading(
  data: Partial<Omit<ProjectHeading, 'id' | 'createdAt'>>,
): Promise<string> {
  const id = nanoid()
  await db.projectHeadings.add({
    id,
    projectId: data.projectId ?? '',
    title: data.title ?? '',
    position: data.position ?? 0,
    createdAt: new Date().toISOString(),
  })
  return id
}

export async function updateProjectHeading(
  id: string,
  changes: Partial<ProjectHeading>,
): Promise<void> {
  await db.projectHeadings.update(id, changes)
}

export async function deleteProjectHeading(id: string): Promise<void> {
  await db.projectHeadings.delete(id)
}

export async function getProjectHeadings(projectId: string): Promise<ProjectHeading[]> {
  return db.projectHeadings.where('projectId').equals(projectId).sortBy('position')
}

// --- SavedFilter CRUD ---

export async function createSavedFilter(
  data: Partial<Omit<SavedFilter, 'id' | 'createdAt'>>,
): Promise<string> {
  const id = nanoid()
  await db.savedFilters.add({
    id,
    name: data.name ?? '',
    filters: data.filters ?? {},
    position: data.position ?? 0,
    createdAt: new Date().toISOString(),
  })
  return id
}

export async function updateSavedFilter(
  id: string,
  changes: Partial<SavedFilter>,
): Promise<void> {
  await db.savedFilters.update(id, changes)
}

export async function deleteSavedFilter(id: string): Promise<void> {
  await db.savedFilters.delete(id)
}

// --- Recurring Task Support ---

export function computeNextOccurrence(
  rule: RecurringRule,
  fromDate: Date,
): Date {
  const { frequency, interval } = rule

  switch (frequency) {
    case 'daily':
      return addDays(fromDate, interval)
    case 'weekly': {
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const currentDay = fromDate.getDay()
        const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b)
        const nextDay = sortedDays.find((d) => d > currentDay)
        if (nextDay !== undefined) {
          return addDays(fromDate, nextDay - currentDay)
        }
        // Wrap to first day of next week cycle
        const daysUntilNextCycle = 7 * interval - currentDay + sortedDays[0]
        return addDays(fromDate, daysUntilNextCycle)
      }
      return addWeeks(fromDate, interval)
    }
    case 'monthly':
      return addMonths(fromDate, interval)
    case 'yearly':
      return addYears(fromDate, interval)
  }
}

export async function createRecurringInstance(taskId: string): Promise<string | null> {
  const task = await db.tasks.get(taskId)
  if (!task || !task.recurringRule) return null

  let rule: RecurringRule
  try {
    rule = JSON.parse(task.recurringRule) as RecurringRule
  } catch {
    return null
  }

  const baseDate = task.dueDate ? new Date(task.dueDate) : new Date()
  const nextDate = computeNextOccurrence(rule, baseDate)
  const nextDateStr = nextDate.toISOString().split('T')[0]

  return createTask({
    title: task.title,
    notes: task.notes,
    status: 'active',
    priority: task.priority,
    dueDate: nextDateStr,
    dueTime: task.dueTime,
    projectId: task.projectId,
    areaId: task.areaId,
    tags: [...task.tags],
    checklist: task.checklist.map((item) => ({
      id: nanoid(),
      text: item.text,
      done: false,
    })),
    isEvening: task.isEvening,
    recurringRule: task.recurringRule,
    kanbanColumn: task.kanbanColumn,
    duration: task.duration,
  })
}

// --- Full-text Search ---

export async function searchTasks(query: string): Promise<Task[]> {
  if (!query.trim()) return []
  const lowerQuery = query.toLowerCase()
  return db.tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.notes.toLowerCase().includes(lowerQuery),
    )
    .toArray()
}

// --- Filtered Tasks ---

export async function getFilteredTasks(filters: TaskFilter): Promise<Task[]> {
  return db.tasks.toCollection().filter((task) => {
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false
    }
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) return false
    }
    if (filters.projectId !== undefined) {
      if (task.projectId !== filters.projectId) return false
    }
    if (filters.areaId !== undefined) {
      if (task.areaId !== filters.areaId) return false
    }
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((t) => task.tags.includes(t))) return false
    }
    if (filters.dueDateFrom) {
      if (!task.dueDate || task.dueDate < filters.dueDateFrom) return false
    }
    if (filters.dueDateTo) {
      if (!task.dueDate || task.dueDate > filters.dueDateTo) return false
    }
    if (filters.hasDate === true) {
      if (!task.dueDate && !task.scheduledDate) return false
    }
    if (filters.hasDate === false) {
      if (task.dueDate || task.scheduledDate) return false
    }
    if (filters.isEvening !== undefined) {
      if (task.isEvening !== filters.isEvening) return false
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      if (
        !task.title.toLowerCase().includes(q) &&
        !task.notes.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    return true
  }).toArray()
}

// --- Batch Operations ---

export async function batchMoveTasks(
  ids: string[],
  targetProjectId: string | null,
): Promise<void> {
  const now = new Date().toISOString()
  await db.transaction('rw', db.tasks, async () => {
    for (const id of ids) {
      await db.tasks.update(id, { projectId: targetProjectId, updatedAt: now })
    }
  })
}

export async function batchTagTasks(ids: string[], tagIds: string[]): Promise<void> {
  const now = new Date().toISOString()
  await db.transaction('rw', db.tasks, async () => {
    for (const id of ids) {
      const task = await db.tasks.get(id)
      if (task) {
        const mergedTags = [...new Set([...task.tags, ...tagIds])]
        await db.tasks.update(id, { tags: mergedTags, updatedAt: now })
      }
    }
  })
}

export async function batchDeleteTasks(ids: string[]): Promise<void> {
  await db.transaction('rw', db.tasks, async () => {
    await db.tasks.bulkDelete(ids)
  })
}

export async function batchScheduleTasks(
  ids: string[],
  date: string | null,
): Promise<void> {
  const now = new Date().toISOString()
  await db.transaction('rw', db.tasks, async () => {
    for (const id of ids) {
      await db.tasks.update(id, { scheduledDate: date, updatedAt: now })
    }
  })
}

// --- Calendar & Timeline Queries ---

export async function getTasksByDateRange(
  startDate: string,
  endDate: string,
): Promise<Task[]> {
  return db.tasks
    .where('dueDate')
    .between(startDate, endDate, true, true)
    .or('scheduledDate')
    .between(startDate, endDate, true, true)
    .filter((task) => task.status !== 'completed' && task.status !== 'cancelled')
    .sortBy('dueDate')
}

export async function getTasksForDate(date: string): Promise<Task[]> {
  return db.tasks
    .filter(
      (task) =>
        (task.dueDate === date || task.scheduledDate === date) &&
        task.status !== 'completed' &&
        task.status !== 'cancelled',
    )
    .sortBy('position')
}

export async function getTasksWithTimeBlocks(date: string): Promise<Task[]> {
  return db.tasks
    .filter(
      (task) =>
        task.dueDate === date &&
        task.dueTime !== null &&
        task.duration !== null &&
        task.status !== 'completed' &&
        task.status !== 'cancelled',
    )
    .sortBy('dueTime')
}

export async function getOverdueTasks(): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0]
  return db.tasks
    .where('status')
    .anyOf('inbox', 'active')
    .filter((task) => task.dueDate !== null && task.dueDate < today)
    .sortBy('dueDate')
}

export async function getUnscheduledActiveTasks(): Promise<Task[]> {
  return db.tasks
    .where('status')
    .anyOf('inbox', 'active')
    .filter((task) => task.dueDate === null && task.scheduledDate === null)
    .sortBy('position')
}

// Re-export types for convenience
export type { Task, Project, Area, Tag, FocusSession, Habit, AppSettings }
export type { TaskStatus, Priority, ChecklistItem }
export type { ProjectHeading, SavedFilter, TaskFilter, RecurringRule }
