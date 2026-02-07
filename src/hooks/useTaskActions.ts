import { useCallback, useRef } from 'react'
import {
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  createRecurringInstance,
} from '@/db'
import type { Task, Priority, ChecklistItem } from '@/types'
import { nanoid } from 'nanoid'
import * as chrono from 'chrono-node'

interface ParsedTaskInput {
  title: string
  dueDate: string | null
  dueTime: string | null
  priority: Priority
}

function parseTaskInput(input: string): ParsedTaskInput {
  let title = input.trim()
  let priority: Priority = 0

  // Extract priority markers: !1 !2 !3
  const priorityMatch = title.match(/\s*!([1-3])\s*/)
  if (priorityMatch) {
    priority = parseInt(priorityMatch[1], 10) as Priority
    title = title.replace(priorityMatch[0], ' ').trim()
  }

  // Parse natural language dates via chrono-node
  const parsed = chrono.parse(title)
  let dueDate: string | null = null
  let dueTime: string | null = null

  if (parsed.length > 0) {
    const result = parsed[0]
    const date = result.start.date()
    dueDate = date.toISOString().split('T')[0]

    if (result.start.isCertain('hour')) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      dueTime = `${hours}:${minutes}`
    }

    // Remove the date text from the title
    title = (title.slice(0, result.index) + title.slice(result.index + result.text.length)).trim()
  }

  return { title, dueDate, dueTime, priority }
}

export function useTaskActions() {
  const undoRef = useRef<{ task: Task; timeoutId: ReturnType<typeof setTimeout> } | null>(null)

  const addTask = useCallback(
    async (input: string, extras?: Partial<Task>) => {
      const { title, dueDate, dueTime, priority } = parseTaskInput(input)
      if (!title) return null

      const id = await createTask({
        title,
        dueDate,
        dueTime,
        priority,
        ...extras,
      })
      return id
    },
    [],
  )

  const toggleComplete = useCallback(async (task: Task) => {
    if (task.status === 'completed') {
      await updateTask(task.id, { status: 'active', completedAt: null })
    } else {
      await completeTask(task.id)
      if (task.recurringRule) {
        await createRecurringInstance(task.id)
      }
    }
  }, [])

  const setTaskPriority = useCallback(async (id: string, priority: Priority) => {
    await updateTask(id, { priority })
  }, [])

  const setTaskDueDate = useCallback(async (id: string, dueDate: string | null) => {
    await updateTask(id, { dueDate })
  }, [])

  const updateTaskTitle = useCallback(async (id: string, title: string) => {
    await updateTask(id, { title })
  }, [])

  const updateTaskNotes = useCallback(async (id: string, notes: string) => {
    await updateTask(id, { notes })
  }, [])

  const removeTask = useCallback(
    async (task: Task): Promise<() => void> => {
      // Clear any previous undo
      if (undoRef.current) {
        clearTimeout(undoRef.current.timeoutId)
        undoRef.current = null
      }

      await deleteTask(task.id)

      // Return an undo function
      const undo = () => {
        if (undoRef.current) {
          clearTimeout(undoRef.current.timeoutId)
          undoRef.current = null
        }
        // Re-create the task with all its original data
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = task
        createTask(rest)
      }

      // Auto-expire undo after 5 seconds
      const timeoutId = setTimeout(() => {
        undoRef.current = null
      }, 5000)

      undoRef.current = { task, timeoutId }

      return undo
    },
    [],
  )

  const addChecklistItem = useCallback(async (taskId: string, text: string, currentChecklist: ChecklistItem[]) => {
    const newItem: ChecklistItem = { id: nanoid(), text, done: false }
    await updateTask(taskId, { checklist: [...currentChecklist, newItem] })
    return newItem.id
  }, [])

  const toggleChecklistItem = useCallback(async (taskId: string, itemId: string, currentChecklist: ChecklistItem[]) => {
    const updated = currentChecklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    )
    await updateTask(taskId, { checklist: updated })
  }, [])

  const removeChecklistItem = useCallback(async (taskId: string, itemId: string, currentChecklist: ChecklistItem[]) => {
    const updated = currentChecklist.filter((item) => item.id !== itemId)
    await updateTask(taskId, { checklist: updated })
  }, [])

  const addSubtask = useCallback(async (parentId: string, title: string) => {
    return createTask({ title, parentId, status: 'active' })
  }, [])

  const toggleTaskTag = useCallback(async (taskId: string, tagId: string, currentTags: string[]) => {
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((t) => t !== tagId)
      : [...currentTags, tagId]
    await updateTask(taskId, { tags: newTags })
  }, [])

  const setTaskRecurrence = useCallback(async (taskId: string, rule: string | null) => {
    await updateTask(taskId, { recurringRule: rule })
  }, [])

  return {
    addTask,
    toggleComplete,
    setTaskPriority,
    setTaskDueDate,
    updateTaskTitle,
    updateTaskNotes,
    removeTask,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    addSubtask,
    toggleTaskTag,
    setTaskRecurrence,
  }
}
