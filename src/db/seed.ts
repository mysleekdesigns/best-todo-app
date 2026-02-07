import { db } from './index'
import { nanoid } from 'nanoid'

export async function seedDatabase(): Promise<void> {
  const count = await db.tasks.count()
  if (count > 0) return // Already seeded

  const now = new Date().toISOString()

  // Areas
  const workAreaId = nanoid()
  const personalAreaId = nanoid()

  await db.areas.bulkAdd([
    { id: workAreaId, name: 'Work', position: 0, createdAt: now },
    { id: personalAreaId, name: 'Personal', position: 1, createdAt: now },
  ])

  // Projects
  const websiteProjectId = nanoid()
  const fitnessProjectId = nanoid()

  await db.projects.bulkAdd([
    {
      id: websiteProjectId,
      name: 'Website Redesign',
      color: '#6366f1',
      emoji: '🌐',
      areaId: workAreaId,
      position: 0,
      createdAt: now,
    },
    {
      id: fitnessProjectId,
      name: 'Fitness Goals',
      color: '#10b981',
      emoji: '💪',
      areaId: personalAreaId,
      position: 1,
      createdAt: now,
    },
  ])

  // Tags
  const urgentTagId = nanoid()
  const designTagId = nanoid()

  await db.tags.bulkAdd([
    { id: urgentTagId, name: 'Urgent', color: '#ef4444' },
    { id: designTagId, name: 'Design', color: '#8b5cf6' },
    { id: nanoid(), name: 'Research', color: '#3b82f6' },
  ])

  // Tasks
  await db.tasks.bulkAdd([
    {
      id: nanoid(),
      title: 'Review homepage mockups',
      notes: 'Check Figma for the latest designs and leave feedback.',
      status: 'active',
      priority: 2,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      dueTime: null,
      scheduledDate: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      projectId: websiteProjectId,
      areaId: workAreaId,
      parentId: null,
      position: 0,
      tags: [designTagId],
      checklist: [
        { id: nanoid(), text: 'Desktop layout', done: false },
        { id: nanoid(), text: 'Mobile layout', done: false },
        { id: nanoid(), text: 'Tablet layout', done: false },
      ],
      isEvening: false,
      recurringRule: null,
      kanbanColumn: 'in-progress',
      duration: null,
    },
    {
      id: nanoid(),
      title: 'Set up CI/CD pipeline',
      notes: '',
      status: 'active',
      priority: 3,
      dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      dueTime: null,
      scheduledDate: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      projectId: websiteProjectId,
      areaId: workAreaId,
      parentId: null,
      position: 1,
      tags: [urgentTagId],
      checklist: [],
      isEvening: false,
      recurringRule: null,
      kanbanColumn: 'todo',
      duration: null,
    },
    {
      id: nanoid(),
      title: 'Go for a 5k run',
      notes: 'Route: park loop trail',
      status: 'active',
      priority: 1,
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '07:00',
      scheduledDate: new Date().toISOString().split('T')[0],
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      projectId: fitnessProjectId,
      areaId: personalAreaId,
      parentId: null,
      position: 0,
      tags: [],
      checklist: [],
      isEvening: false,
      recurringRule: null,
      kanbanColumn: null,
      duration: null,
    },
    {
      id: nanoid(),
      title: 'Buy groceries',
      notes: 'Milk, eggs, bread, avocados, chicken',
      status: 'inbox',
      priority: 0,
      dueDate: null,
      dueTime: null,
      scheduledDate: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      projectId: null,
      areaId: null,
      parentId: null,
      position: 0,
      tags: [],
      checklist: [],
      isEvening: true,
      recurringRule: null,
      kanbanColumn: null,
      duration: null,
    },
    {
      id: nanoid(),
      title: 'Read chapter 5 of Clean Code',
      notes: '',
      status: 'active',
      priority: 1,
      dueDate: null,
      dueTime: null,
      scheduledDate: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      projectId: null,
      areaId: personalAreaId,
      parentId: null,
      position: 1,
      tags: [],
      checklist: [],
      isEvening: true,
      recurringRule: null,
      kanbanColumn: null,
      duration: null,
    },
    {
      id: nanoid(),
      title: 'Weekly team standup',
      notes: 'Prepare status update for the team.',
      status: 'active',
      priority: 2,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      dueTime: '09:00',
      scheduledDate: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      projectId: websiteProjectId,
      areaId: workAreaId,
      parentId: null,
      position: 2,
      tags: [urgentTagId],
      checklist: [],
      isEvening: false,
      recurringRule: JSON.stringify({
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1],
      }),
      kanbanColumn: null,
      duration: null,
    },
    {
      id: nanoid(),
      title: 'Morning run',
      notes: 'Run at least 3k every day.',
      status: 'active',
      priority: 1,
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '06:30',
      scheduledDate: new Date().toISOString().split('T')[0],
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      projectId: fitnessProjectId,
      areaId: personalAreaId,
      parentId: null,
      position: 1,
      tags: [],
      checklist: [],
      isEvening: false,
      recurringRule: JSON.stringify({
        frequency: 'daily',
        interval: 1,
      }),
      kanbanColumn: null,
      duration: null,
    },
  ])

  // Project Headings
  await db.projectHeadings.bulkAdd([
    {
      id: nanoid(),
      projectId: websiteProjectId,
      title: 'Design',
      position: 0,
      createdAt: now,
    },
    {
      id: nanoid(),
      projectId: websiteProjectId,
      title: 'Development',
      position: 1,
      createdAt: now,
    },
    {
      id: nanoid(),
      projectId: fitnessProjectId,
      title: 'Cardio',
      position: 0,
      createdAt: now,
    },
  ])

  // Saved Filters
  await db.savedFilters.bulkAdd([
    {
      id: nanoid(),
      name: 'High Priority',
      filters: { priority: [3], status: ['active', 'inbox'] },
      position: 0,
      createdAt: now,
    },
    {
      id: nanoid(),
      name: 'Due This Week',
      filters: {
        dueDateFrom: new Date().toISOString().split('T')[0],
        dueDateTo: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: ['active', 'inbox'],
      },
      position: 1,
      createdAt: now,
    },
  ])

  // Habits
  await db.habits.bulkAdd([
    {
      id: nanoid(),
      name: 'Meditate',
      description: '10 minutes of morning meditation',
      frequency: 'daily',
      frequencyDays: [],
      color: '#8b5cf6',
      icon: 'brain',
      streakCurrent: 3,
      streakBest: 12,
      createdAt: now,
      entries: [],
    },
    {
      id: nanoid(),
      name: 'Exercise',
      description: 'At least 30 minutes of physical activity',
      frequency: 'daily',
      frequencyDays: [],
      color: '#10b981',
      icon: 'dumbbell',
      streakCurrent: 1,
      streakBest: 7,
      createdAt: now,
      entries: [],
    },
  ])

  // Default settings
  await db.appSettings.put({
    id: 'app-settings',
    theme: 'system',
    pomodoroWork: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    pomodoroAutoStart: false,
    defaultView: 'inbox',
    weekStartsOn: 1,
  })
}
