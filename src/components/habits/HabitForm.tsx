import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createHabit, updateHabit } from '@/db'
import { cn } from '@/lib/utils'
import type { Habit, HabitFrequency } from '@/types'

const PRESET_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

const DAYS_OF_WEEK = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
]

interface HabitFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: Habit | null
}

export function HabitForm({ open, onOpenChange, habit }: HabitFormProps) {
  const isEditing = !!habit

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [frequencyDays, setFrequencyDays] = useState<number[]>([])
  const [color, setColor] = useState(PRESET_COLORS[0])

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description)
      setFrequency(habit.frequency)
      setFrequencyDays(habit.frequencyDays)
      setColor(habit.color)
    } else {
      setName('')
      setDescription('')
      setFrequency('daily')
      setFrequencyDays([])
      setColor(PRESET_COLORS[0])
    }
  }, [habit, open])

  function toggleDay(day: number) {
    setFrequencyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  async function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) return

    if (isEditing && habit) {
      await updateHabit(habit.id, {
        name: trimmedName,
        description: description.trim(),
        frequency,
        frequencyDays,
        color,
      })
    } else {
      await createHabit({
        name: trimmedName,
        description: description.trim(),
        frequency,
        frequencyDays,
        color,
        icon: '',
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Habit' : 'New Habit'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              autoFocus
              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 resize-none"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            >
              <option value="daily">Every day</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom days</option>
            </select>
          </div>

          {/* Day selector for weekly/custom */}
          {(frequency === 'weekly' || frequency === 'custom') && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                On these days
              </label>
              <div className="flex gap-1.5">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                      frequencyDays.includes(day.value)
                        ? 'bg-gray-900 text-white'
                        : 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100',
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color picker */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Color
            </label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-7 w-7 rounded-full transition-transform hover:scale-110',
                    c === color && 'ring-2 ring-gray-900 ring-offset-2',
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
