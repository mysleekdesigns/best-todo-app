import { Archive } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'

export function SomedayPage() {
  const tasks = useLiveQuery(() => {
    // "Someday" tasks: active tasks with no due date and no scheduled date
    // In a full implementation this would be a dedicated status, but for now
    // we use a convention: tasks explicitly placed in someday (could track via a
    // separate field). For the initial shell, we'll show tasks without dates.
    return db.tasks
      .where('status')
      .equals('active')
      .filter((t) => t.dueDate === null && t.scheduledDate === null)
      .sortBy('position')
  })

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center gap-3 pb-6">
        <Archive size={22} className="text-slate-400" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Someday</h2>
        {tasks && tasks.length > 0 && (
          <span className="text-sm text-muted-foreground">{tasks.length}</span>
        )}
      </div>

      {tasks === undefined ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center">
          <Archive size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Park tasks for later and revisit them when the time is right.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent"
            >
              <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
              <span className="text-sm font-medium text-foreground">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
