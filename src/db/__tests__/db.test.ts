import { describe, it, expect, beforeEach } from 'vitest'
import { db, createTask, updateTask, deleteTask, completeTask } from '../index'

describe('ZenithDB', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('creates a task with defaults', async () => {
    const id = await createTask({ title: 'Test task' })
    const task = await db.tasks.get(id)

    expect(task).toBeDefined()
    expect(task!.title).toBe('Test task')
    expect(task!.status).toBe('active')
    expect(task!.priority).toBe(0)
    expect(task!.notes).toBe('')
    expect(task!.tags).toEqual([])
    expect(task!.checklist).toEqual([])
    expect(task!.timeBlockColor).toBeNull()
  })

  it('updates a task', async () => {
    const id = await createTask({ title: 'Original' })
    // Small delay so updatedAt differs from createdAt
    await new Promise((r) => setTimeout(r, 10))
    await updateTask(id, { title: 'Updated', priority: 2 })

    const task = await db.tasks.get(id)
    expect(task!.title).toBe('Updated')
    expect(task!.priority).toBe(2)
    expect(task!.updatedAt).not.toBe(task!.createdAt)
  })

  it('completes a task', async () => {
    const id = await createTask({ title: 'To complete', status: 'active' })
    await completeTask(id)

    const task = await db.tasks.get(id)
    expect(task!.status).toBe('completed')
    expect(task!.completedAt).toBeTruthy()
  })

  it('deletes a task', async () => {
    const id = await createTask({ title: 'To delete' })
    await deleteTask(id)

    const task = await db.tasks.get(id)
    expect(task).toBeUndefined()
  })
})
