export type TaskStatus = 'active' | 'completed' | 'cancelled'
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
  listId: string | null
  parentId: string | null
  position: number
  tags: string[]
  checklist: ChecklistItem[]
  recurringRule: string | null
  duration: number | null
  timeBlockColor: string | null
}

export interface List {
  id: string
  name: string
  color: string
  position: number
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export type StickyNoteColor = 'yellow' | 'cyan' | 'pink' | 'orange' | 'green' | 'purple'

export interface StickyNote {
  id: string
  title: string
  content: string
  color: StickyNoteColor
  position: number
  createdAt: string
  updatedAt: string
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

// --- List Headings (section dividers within lists) ---

export interface ListHeading {
  id: string
  listId: string
  title: string
  position: number
  createdAt: string
}

// --- Saved Filters (custom smart lists) ---

export interface TaskFilter {
  status?: TaskStatus[]
  priority?: Priority[]
  tags?: string[]
  listId?: string | null
  dueDateFrom?: string | null
  dueDateTo?: string | null
  hasDate?: boolean
  searchQuery?: string
}

export interface SavedFilter {
  id: string
  name: string
  filters: TaskFilter
  position: number
  createdAt: string
}

// --- Recurring Rule (structured recurring config) ---

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringRule {
  frequency: RecurringFrequency
  interval: number // every N days/weeks/months/years
  daysOfWeek?: number[] // 0=Sun..6=Sat (for weekly)
  dayOfMonth?: number // 1-31 (for monthly)
  monthOfYear?: number // 1-12 (for yearly)
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
