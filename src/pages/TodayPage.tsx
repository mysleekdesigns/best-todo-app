import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTodayTasks } from '@/db/hooks'
import { format } from 'date-fns'
import { TaskList } from '@/components/tasks/TaskList'
import { QuickAdd } from '@/components/tasks/QuickAdd'

export function TodayPage() {
  const tasks = useTodayTasks()
  const todayLabel = format(new Date(), 'EEEE, MMMM d')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="mx-auto max-w-5xl px-4 py-6 md:px-6 lg:px-8"
    >
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Today</h1>
          {tasks && tasks.length > 0 && (
            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-sm font-medium text-gray-600">
              {tasks.length}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">{todayLabel}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <QuickAdd />
        <TaskList
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          emptyMessage="Nothing due today"
        />
      </div>
    </motion.div>
  )
}
