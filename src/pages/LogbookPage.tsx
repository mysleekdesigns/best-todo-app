import { BookOpen } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { format, parseISO } from 'date-fns'
import { db } from '@/db'
import type { Task } from '@/types'

export function LogbookPage() {
  const tasks = useLiveQuery(() => {
    return db.tasks.where('status').equals('completed').reverse().sortBy('completedAt')
  })

  // Group by completion date
  const grouped: Map<string, Task[]> = new Map()
  if (tasks) {
    for (const task of tasks) {
      const date = task.completedAt ? task.completedAt.split('T')[0] : 'Unknown'
      if (!grouped.has(date)) grouped.set(date, [])
      grouped.get(date)!.push(task)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center gap-3 pb-6">
        <BookOpen size={22} className="text-emerald-500" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Logbook</h2>
      </div>

      {tasks === undefined ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : grouped.size === 0 ? (
        <div className="py-16 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">No completed tasks yet</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Completed tasks are logged here so you can look back on your progress.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([date, dateTasks]) => {
            const dateLabel =
              date === 'Unknown' ? 'Unknown' : format(parseISO(date), 'EEEE, MMMM d')
            return (
              <div key={date}>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dateLabel}
                </h3>
                <div className="space-y-1">
                  {dateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M2 5L4.5 7.5L8 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-muted-foreground line-through">
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
