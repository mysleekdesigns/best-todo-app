import type { Task, List } from '@/types'

export interface SearchResult {
  type: 'task' | 'list'
  id: string
  title: string
  subtitle: string
  highlights: HighlightRange[]
}

export interface HighlightRange {
  start: number
  end: number
}

/**
 * Find all non-overlapping occurrences of `query` in `text` (case-insensitive).
 */
export function findHighlights(text: string, query: string): HighlightRange[] {
  if (!query) return []
  const ranges: HighlightRange[] = []
  const lower = text.toLowerCase()
  const lowerQ = query.toLowerCase()
  let idx = 0
  while (idx < lower.length) {
    const found = lower.indexOf(lowerQ, idx)
    if (found === -1) break
    ranges.push({ start: found, end: found + lowerQ.length })
    idx = found + lowerQ.length
  }
  return ranges
}

/**
 * Split text into segments based on highlight ranges for rendering.
 */
export function splitByHighlights(
  text: string,
  highlights: HighlightRange[],
): Array<{ text: string; highlighted: boolean }> {
  if (highlights.length === 0) return [{ text, highlighted: false }]

  const segments: Array<{ text: string; highlighted: boolean }> = []
  let cursor = 0

  for (const { start, end } of highlights) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), highlighted: false })
    }
    segments.push({ text: text.slice(start, end), highlighted: true })
    cursor = end
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false })
  }

  return segments
}

/**
 * Build search results from tasks and lists matching a query.
 */
export function buildSearchResults(
  query: string,
  tasks: Task[],
  lists: List[],
): SearchResult[] {
  if (!query.trim()) return []
  const lowerQ = query.toLowerCase()
  const results: SearchResult[] = []

  for (const list of lists) {
    if (list.name.toLowerCase().includes(lowerQ)) {
      results.push({
        type: 'list',
        id: list.id,
        title: list.name,
        subtitle: 'List',
        highlights: findHighlights(list.name, query),
      })
    }
  }

  for (const task of tasks) {
    const titleMatch = task.title.toLowerCase().includes(lowerQ)
    const notesMatch = task.notes.toLowerCase().includes(lowerQ)
    if (titleMatch || notesMatch) {
      results.push({
        type: 'task',
        id: task.id,
        title: task.title,
        subtitle: notesMatch && !titleMatch
          ? truncateAround(task.notes, lowerQ, 60)
          : statusLabel(task.status),
        highlights: findHighlights(task.title, query),
      })
    }
  }

  return results
}

function statusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Active'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

function truncateAround(text: string, query: string, maxLen: number): string {
  const idx = text.toLowerCase().indexOf(query)
  if (idx === -1) return text.slice(0, maxLen)

  const start = Math.max(0, idx - 20)
  const end = Math.min(text.length, idx + query.length + 40)
  let result = text.slice(start, end)
  if (start > 0) result = '...' + result
  if (end < text.length) result = result + '...'
  return result
}
