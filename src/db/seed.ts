import { db } from './index'
import { nanoid } from 'nanoid'

export async function seedDatabase(): Promise<void> {
  const count = await db.tasks.count()
  if (count > 0) return // Already seeded

  const now = new Date().toISOString()

  // Lists (formerly Projects)
  const websiteListId = nanoid()
  const fitnessListId = nanoid()

  await db.projects.bulkAdd([
    {
      id: websiteListId,
      name: 'Website Redesign',
      color: '#ec4899',
      position: 0,
      createdAt: now,
    },
    {
      id: fitnessListId,
      name: 'Fitness Goals',
      color: '#06b6d4',
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
      listId: websiteListId,
      parentId: null,
      position: 0,
      tags: [designTagId],
      checklist: [
        { id: nanoid(), text: 'Desktop layout', done: false },
        { id: nanoid(), text: 'Mobile layout', done: false },
        { id: nanoid(), text: 'Tablet layout', done: false },
      ],
      recurringRule: null,
      duration: null,
      timeBlockColor: null,
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
      listId: websiteListId,
      parentId: null,
      position: 1,
      tags: [urgentTagId],
      checklist: [],
      recurringRule: null,
      duration: null,
      timeBlockColor: null,
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
      listId: fitnessListId,
      parentId: null,
      position: 0,
      tags: [],
      checklist: [],
      recurringRule: null,
      duration: 60,
      timeBlockColor: '#06b6d4',
    },
    {
      id: nanoid(),
      title: 'Buy groceries',
      notes: 'Milk, eggs, bread, avocados, chicken',
      status: 'active',
      priority: 0,
      dueDate: null,
      dueTime: null,
      scheduledDate: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      listId: null,
      parentId: null,
      position: 2,
      tags: [],
      checklist: [],
      recurringRule: null,
      duration: null,
      timeBlockColor: null,
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
      listId: null,
      parentId: null,
      position: 3,
      tags: [],
      checklist: [],
      recurringRule: null,
      duration: null,
      timeBlockColor: null,
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
      listId: websiteListId,
      parentId: null,
      position: 4,
      tags: [urgentTagId],
      checklist: [],
      recurringRule: JSON.stringify({
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1],
      }),
      duration: 30,
      timeBlockColor: '#ec4899',
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
      listId: fitnessListId,
      parentId: null,
      position: 5,
      tags: [],
      checklist: [],
      recurringRule: JSON.stringify({
        frequency: 'daily',
        interval: 1,
      }),
      duration: 30,
      timeBlockColor: '#06b6d4',
    },
  ])

  // List Headings (formerly Project Headings)
  await db.projectHeadings.bulkAdd([
    {
      id: nanoid(),
      listId: websiteListId,
      title: 'Design',
      position: 0,
      createdAt: now,
    },
    {
      id: nanoid(),
      listId: websiteListId,
      title: 'Development',
      position: 1,
      createdAt: now,
    },
    {
      id: nanoid(),
      listId: fitnessListId,
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
      filters: { priority: [3], status: ['active'] },
      position: 0,
      createdAt: now,
    },
    {
      id: nanoid(),
      name: 'Due This Week',
      filters: {
        dueDateFrom: new Date().toISOString().split('T')[0],
        dueDateTo: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: ['active'],
      },
      position: 1,
      createdAt: now,
    },
  ])

  // Sticky Notes
  await db.stickyNotes.bulkAdd([
    {
      id: nanoid(),
      title: 'Design inspiration',
      content: 'Check Dribbble for minimal todo app designs. Focus on whitespace and typography.',
      color: 'yellow',
      position: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      title: 'Grocery ideas',
      content: 'Try that new pasta recipe from YouTube. Need fresh basil and mozzarella.',
      color: 'cyan',
      position: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      title: 'Book recommendations',
      content: 'Atomic Habits, Deep Work, The Pragmatic Programmer',
      color: 'pink',
      position: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      title: 'Meeting notes',
      content: 'Q1 review: focus on performance improvements and user onboarding flow.',
      color: 'orange',
      position: 3,
      createdAt: now,
      updatedAt: now,
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
    defaultView: 'upcoming',
    weekStartsOn: 1,
  })
}
