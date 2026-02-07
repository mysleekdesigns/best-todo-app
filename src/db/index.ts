import Dexie, { type EntityTable } from 'dexie'
import { nanoid } from 'nanoid'
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
} from '@/types'

export class ZenithDB extends Dexie {
  tasks!: EntityTable<Task, 'id'>
  projects!: EntityTable<Project, 'id'>
  areas!: EntityTable<Area, 'id'>
  tags!: EntityTable<Tag, 'id'>
  focusSessions!: EntityTable<FocusSession, 'id'>
  habits!: EntityTable<Habit, 'id'>
  appSettings!: EntityTable<AppSettings, 'id'>

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

// Re-export types for convenience
export type { Task, Project, Area, Tag, FocusSession, Habit, AppSettings }
export type { TaskStatus, Priority, ChecklistItem }
