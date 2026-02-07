import { Calendar } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { format, parseISO, addDays } from 'date-fns'
import { db } from '@/db'
import type { Task } from '@/types'

export function UpcomingPage() {
  const today = new Date().toISOString().split('T')[0]

  const tasks = useLiveQuery(() => {
    return db.tasks
      .where('status')
      .equals('active')
      .filter((t) => t.dueDate !== null && t.dueDate >= today)
      .sortBy('dueDate')
  })

  // Group tasks by date
  const grouped: Map<string, Task[]> = new Map()
  if (tasks) {
    for (const task of tasks) {
      const date = task.dueDate!
      if (!grouped.has(date)) grouped.set(date, [])
      grouped.get(date)!.push(task)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center gap-3 pb-6">
        <Calendar size={22} className="text-rose-500" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Upcoming</h2>
      </div>

      {tasks === undefined ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : grouped.size === 0 ? (
        <div className="py-16 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">Nothing upcoming</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Tasks with due dates will be grouped here by day.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([date, dateTasks]) => {
            const parsedDate = parseISO(date)
            const isToday = date === today
            const isTomorrow = date === addDays(new Date(), 1).toISOString().split('T')[0]
            const dateLabel = isToday
              ? 'Today'
              : isTomorrow
                ? 'Tomorrow'
                : format(parsedDate, 'EEEE, MMMM d')

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
                      <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                      <span className="text-sm font-medium text-foreground">{task.title}</span>
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
