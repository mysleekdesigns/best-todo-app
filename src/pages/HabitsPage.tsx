import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useHabits, useTodayHabits } from '@/db/hooks'
import { Button } from '@/components/ui/button'
import { HabitList } from '@/components/habits/HabitList'
import { HabitDetail } from '@/components/habits/HabitDetail'
import { HabitForm } from '@/components/habits/HabitForm'

export function HabitsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)

  const habits = useHabits()
  const todayHabits = useTodayHabits()

  const selectedHabit = habits?.find((h) => h.id === selectedHabitId) ?? null

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayNotDone = todayHabits?.filter(
    (h) => !h.entries.some((e) => e.date === today && e.completed),
  )

  const otherHabits = useMemo(() => {
    if (!habits) return undefined
    const todayIds = new Set(todayHabits?.map((h) => h.id) ?? [])
    return habits.filter((h) => !todayIds.has(h.id))
  }, [habits, todayHabits])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="mx-auto max-w-3xl p-8"
    >
      <AnimatePresence mode="wait">
        {selectedHabit ? (
          <HabitDetail
            key="detail"
            habit={selectedHabit}
            onBack={() => setSelectedHabitId(null)}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                  Habits
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {format(new Date(), 'EEEE, MMMM d')}
                </p>
              </div>
              <Button
                onClick={() => setFormOpen(true)}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <Plus size={16} />
                Add Habit
              </Button>
            </div>

            {/* Today's habits */}
            {todayHabits && todayHabits.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Today's Habits
                  {todayNotDone && todayNotDone.length > 0 && (
                    <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium tabular-nums text-gray-600">
                      {todayNotDone.length} remaining
                    </span>
                  )}
                </h2>
                <HabitList
                  habits={todayHabits}
                  selectedId={selectedHabitId}
                  onSelect={setSelectedHabitId}
                />
              </div>
            )}

            {/* Other habits (not due today) */}
            {otherHabits && otherHabits.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Other Habits
                </h2>
                <HabitList
                  habits={otherHabits}
                  selectedId={selectedHabitId}
                  onSelect={setSelectedHabitId}
                />
              </div>
            )}

            {/* Empty state when no habits at all */}
            {(!habits || habits.length === 0) && (
              <HabitList
                habits={habits}
                selectedId={null}
                onSelect={() => {}}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <HabitForm open={formOpen} onOpenChange={setFormOpen} />
    </motion.div>
  )
}
