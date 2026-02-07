import type { Task } from '@/types'

/**
 * Recompute position values after reordering items.
 * Returns an array of { id, position } updates to apply.
 */
export function reorderPositions(
  items: Array<{ id: string; position: number }>,
  fromIndex: number,
  toIndex: number,
): Array<{ id: string; position: number }> {
  const reordered = [...items]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)

  return reordered.map((item, idx) => ({
    id: item.id,
    position: idx,
  }))
}

/**
 * Given the active and over IDs from dnd-kit, find the from/to indices.
 */
export function findReorderIndices(
  items: Array<{ id: string }>,
  activeId: string,
  overId: string,
): { fromIndex: number; toIndex: number } | null {
  const fromIndex = items.findIndex((i) => i.id === activeId)
  const toIndex = items.findIndex((i) => i.id === overId)
  if (fromIndex === -1 || toIndex === -1) return null
  return { fromIndex, toIndex }
}

/**
 * Toggle selection of a task in a multi-select list.
 * Supports Shift+click range selection and Cmd/Ctrl+click toggle.
 */
export function computeSelection(
  allIds: string[],
  currentSelection: Set<string>,
  clickedId: string,
  lastSelectedId: string | null,
  isShift: boolean,
  isMeta: boolean,
): Set<string> {
  if (isShift && lastSelectedId) {
    const startIdx = allIds.indexOf(lastSelectedId)
    const endIdx = allIds.indexOf(clickedId)
    if (startIdx === -1 || endIdx === -1) return currentSelection
    const from = Math.min(startIdx, endIdx)
    const to = Math.max(startIdx, endIdx)
    const rangeIds = allIds.slice(from, to + 1)
    const next = new Set(currentSelection)
    for (const id of rangeIds) next.add(id)
    return next
  }

  if (isMeta) {
    const next = new Set(currentSelection)
    if (next.has(clickedId)) {
      next.delete(clickedId)
    } else {
      next.add(clickedId)
    }
    return next
  }

  // Plain click: select only this item (unless it's the only selected one, then deselect)
  if (currentSelection.size === 1 && currentSelection.has(clickedId)) {
    return new Set()
  }
  return new Set([clickedId])
}

/**
 * Get a visual preview label for dragging multiple tasks.
 */
export function getDragPreviewLabel(tasks: Task[], selectedCount: number): string {
  if (selectedCount <= 1 && tasks.length > 0) {
    return tasks[0].title
  }
  return `${selectedCount} tasks`
}
