import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { format, addDays, endOfWeek } from 'date-fns'
import { db } from '@/db'
import { TaskList } from '@/components/tasks/TaskList'
import { QuickAdd } from '@/components/tasks/QuickAdd'

export function UpcomingPage() {
  const today = new Date().toISOString().split('T')[0]
  const tomorrowDate = addDays(new Date(), 1).toISOString().split('T')[0]
  const endOfThisWeek = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const tasks = useLiveQuery(() => {
    return db.tasks
      .where('status')
      .equals('active')
      .filter((t) => t.dueDate !== null && t.dueDate >= today)
      .sortBy('dueDate')
  })

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const todayTasks = tasks?.filter((t) => t.dueDate === today) ?? []
  const tomorrowTasks = tasks?.filter((t) => t.dueDate === tomorrowDate) ?? []
  const thisWeekTasks = tasks?.filter(
    (t) => t.dueDate! > tomorrowDate && t.dueDate! <= endOfThisWeek,
  ) ?? []

  const totalCount = (todayTasks.length + tomorrowTasks.length + thisWeekTasks.length)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="mx-auto max-w-5xl px-4 py-6 md:px-6 lg:px-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Upcoming</h1>
        {totalCount > 0 && (
          <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-sm font-medium text-gray-600">
            {totalCount}
          </span>
        )}
      </div>

      {tasks === undefined ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Today — full width */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Today</h2>
            <QuickAdd />
            <TaskList
              tasks={todayTasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
              emptyMessage="No tasks today"
            />
          </div>

          {/* Tomorrow + This Week — 2 col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Tomorrow</h2>
              <QuickAdd />
              <TaskList
                tasks={tomorrowTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTaskId}
                emptyMessage="No tasks tomorrow"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">This Week</h2>
              <QuickAdd />
              <TaskList
                tasks={thisWeekTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTaskId}
                emptyMessage="No tasks this week"
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
