import { Moon } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'

export function EveningPage() {
  const tasks = useLiveQuery(() => {
    return db.tasks
      .where('status')
      .anyOf(['inbox', 'active'])
      .filter((t) => t.isEvening)
      .sortBy('position')
  })

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center gap-3 pb-6">
        <Moon size={22} className="text-indigo-400" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">This Evening</h2>
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
          <Moon size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">No evening tasks</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Mark tasks for this evening and they'll show up here.
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
