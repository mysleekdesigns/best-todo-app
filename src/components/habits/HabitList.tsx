import { AnimatePresence } from 'framer-motion'
import { Target } from 'lucide-react'
import { HabitCard } from './HabitCard'
import type { Habit } from '@/types'

interface HabitListProps {
  habits: Habit[] | undefined
  selectedId: string | null
  onSelect: (id: string) => void
}

export function HabitList({ habits, selectedId, onSelect }: HabitListProps) {
  if (!habits || habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <Target size={28} className="text-gray-400" />
        </div>
        <h3 className="mb-1 text-base font-medium text-gray-900">
          No habits yet
        </h3>
        <p className="text-sm text-gray-500">
          Create your first habit to start tracking
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onSelect={onSelect}
            selected={selectedId === habit.id}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
