import type { TaskFilter, Priority, TaskStatus } from '@/types'

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 3, label: 'High' },
  { value: 2, label: 'Medium' },
  { value: 1, label: 'Low' },
  { value: 0, label: 'None' },
]

export const EMPTY_FILTER: TaskFilter = {}

export function isFilterActive(filters: TaskFilter): boolean {
  return (
    (filters.status !== undefined && filters.status.length > 0) ||
    (filters.priority !== undefined && filters.priority.length > 0) ||
    (filters.tags !== undefined && filters.tags.length > 0) ||
    filters.projectId !== undefined ||
    filters.areaId !== undefined ||
    filters.dueDateFrom !== undefined ||
    filters.dueDateTo !== undefined ||
    filters.hasDate !== undefined ||
    filters.isEvening !== undefined ||
    (filters.searchQuery !== undefined && filters.searchQuery.length > 0)
  )
}

export function countActiveFilters(filters: TaskFilter): number {
  let count = 0
  if (filters.status && filters.status.length > 0) count++
  if (filters.priority && filters.priority.length > 0) count++
  if (filters.tags && filters.tags.length > 0) count++
  if (filters.projectId !== undefined) count++
  if (filters.areaId !== undefined) count++
  if (filters.dueDateFrom || filters.dueDateTo) count++
  if (filters.hasDate !== undefined) count++
  if (filters.isEvening !== undefined) count++
  return count
}

export function toggleArrayValue<T>(arr: T[] | undefined, value: T): T[] {
  const current = arr ?? []
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value]
}
