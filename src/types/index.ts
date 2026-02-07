export type TaskStatus = 'inbox' | 'active' | 'completed' | 'cancelled'
export type Priority = 0 | 1 | 2 | 3 // none, low, medium, high

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  notes: string
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  dueTime: string | null
  scheduledDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  projectId: string | null
  areaId: string | null
  parentId: string | null
  position: number
  tags: string[]
  checklist: ChecklistItem[]
  isEvening: boolean
  recurringRule: string | null
  kanbanColumn: string | null
}

export interface Project {
  id: string
  name: string
  color: string
  emoji: string
  areaId: string | null
  position: number
  createdAt: string
}

export interface Area {
  id: string
  name: string
  position: number
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export type FocusSessionType = 'work' | 'short_break' | 'long_break'

export interface FocusSession {
  id: string
  taskId: string | null
  startTime: string
  endTime: string
  duration: number
  type: FocusSessionType
  completed: boolean
  notes: string
}

export type HabitFrequency = 'daily' | 'weekly' | 'custom'

export interface HabitEntry {
  date: string
  completed: boolean
  value?: number
}

export interface Habit {
  id: string
  name: string
  description: string
  frequency: HabitFrequency
  frequencyDays: number[]
  color: string
  icon: string
  streakCurrent: number
  streakBest: number
  createdAt: string
  entries: HabitEntry[]
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppSettings {
  id: string
  theme: ThemeMode
  pomodoroWork: number
  pomodoroShortBreak: number
  pomodoroLongBreak: number
  pomodoroAutoStart: boolean
  defaultView: string
  weekStartsOn: 0 | 1
}
