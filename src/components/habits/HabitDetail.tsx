import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { deleteHabit } from '@/db'
import { HabitCalendarHeatmap } from './HabitCalendarHeatmap'
import { HabitStats } from './HabitStats'
import { HabitForm } from './HabitForm'
import type { Habit } from '@/types'

interface HabitDetailProps {
  habit: Habit
  onBack: () => void
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Every day',
  weekly: 'Weekly',
  custom: 'Custom days',
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function HabitDetail({ habit, onBack }: HabitDetailProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleDelete() {
    await deleteHabit(habit.id)
    setDeleteOpen(false)
    onBack()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Back to habits"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <h2 className="truncate text-xl font-bold text-gray-900">
            {habit.name}
          </h2>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditOpen(true)}
            aria-label="Edit habit"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteOpen(true)}
            className="text-gray-500 hover:text-red-500"
            aria-label="Delete habit"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Info */}
      {habit.description && (
        <p className="mb-4 text-sm text-gray-600">{habit.description}</p>
      )}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <span>{FREQUENCY_LABELS[habit.frequency] ?? habit.frequency}</span>
        {habit.frequencyDays.length > 0 && (
          <>
            <span className="text-gray-300">-</span>
            <span>
              {habit.frequencyDays
                .sort((a, b) => a - b)
                .map((d) => DAY_NAMES[d])
                .join(', ')}
            </span>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-500">Statistics</h3>
        <HabitStats habit={habit} />
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-gray-500">
          Last 12 weeks
        </h3>
        <HabitCalendarHeatmap entries={habit.entries} color={habit.color} />
      </div>

      {/* Edit dialog */}
      <HabitForm open={editOpen} onOpenChange={setEditOpen} habit={habit} />

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete "{habit.name}"? This will remove all
            history and cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
