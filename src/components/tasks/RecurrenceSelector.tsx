import { useState, useRef, useEffect } from 'react'
import { Repeat, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecurringRule, RecurringFrequency } from '@/types'

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Day',
  weekly: 'Week',
  monthly: 'Month',
  yearly: 'Year',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const PRESETS: { label: string; rule: RecurringRule }[] = [
  { label: 'Every day', rule: { frequency: 'daily', interval: 1 } },
  { label: 'Every weekday', rule: { frequency: 'weekly', interval: 1, daysOfWeek: [1, 2, 3, 4, 5] } },
  { label: 'Every week', rule: { frequency: 'weekly', interval: 1 } },
  { label: 'Every 2 weeks', rule: { frequency: 'weekly', interval: 2 } },
  { label: 'Every month', rule: { frequency: 'monthly', interval: 1 } },
  { label: 'Every year', rule: { frequency: 'yearly', interval: 1 } },
]

function describeRule(rule: RecurringRule): string {
  const { frequency, interval, daysOfWeek } = rule
  let desc = 'Every'

  if (interval > 1) {
    desc += ` ${interval}`
  }

  desc += ` ${FREQUENCY_LABELS[frequency].toLowerCase()}`
  if (interval > 1) desc += 's'

  if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
    const dayNames = daysOfWeek.map((d) => DAY_LABELS[d])
    desc += ` on ${dayNames.join(', ')}`
  }

  return desc
}

interface RecurrenceSelectorProps {
  value: string | null // JSON string of RecurringRule or null
  onChange: (value: string | null) => void
  className?: string
}

export function RecurrenceSelector({ value, onChange, className }: RecurrenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCustom, setIsCustom] = useState(false)
  const [frequency, setFrequency] = useState<RecurringFrequency>('weekly')
  const [interval, setInterval] = useState(1)
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const currentRule: RecurringRule | null = value ? (() => {
    try { return JSON.parse(value) as RecurringRule } catch { return null }
  })() : null

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsCustom(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handlePreset = (rule: RecurringRule) => {
    onChange(JSON.stringify(rule))
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setIsOpen(false)
  }

  const handleCustomSave = () => {
    const rule: RecurringRule = { frequency, interval }
    if (frequency === 'weekly' && daysOfWeek.length > 0) {
      rule.daysOfWeek = [...daysOfWeek].sort((a, b) => a - b)
    }
    onChange(JSON.stringify(rule))
    setIsOpen(false)
    setIsCustom(false)
  }

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors',
          currentRule
            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800',
        )}
      >
        <Repeat className="h-3.5 w-3.5" />
        {currentRule ? describeRule(currentRule) : 'Repeat'}
        {currentRule && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => { if (e.key === 'Enter') handleClear(e as unknown as React.MouseEvent) }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-60 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {!isCustom ? (
            <>
              <div className="p-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePreset(preset.rule)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Repeat className="h-3.5 w-3.5 text-gray-400" />
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 p-1 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Custom...
                </button>
                {currentRule && (
                  <button
                    type="button"
                    onClick={(e) => handleClear(e)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Remove recurrence
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Custom Recurrence</span>
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className="rounded p-0.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Interval + frequency */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-gray-500">Every</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={interval}
                  onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-14 rounded-md border border-gray-200 bg-transparent px-2 py-1 text-center text-sm text-gray-700 outline-none focus:border-blue-400 dark:border-gray-700 dark:text-gray-300"
                />
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                    className="appearance-none rounded-md border border-gray-200 bg-transparent py-1 pr-7 pl-2 text-sm text-gray-700 outline-none focus:border-blue-400 dark:border-gray-700 dark:text-gray-300"
                  >
                    {(Object.entries(FREQUENCY_LABELS) as [RecurringFrequency, string][]).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}{interval > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Day of week picker for weekly */}
              {frequency === 'weekly' && (
                <div className="mb-3">
                  <span className="mb-1.5 block text-xs text-gray-400">On days</span>
                  <div className="flex gap-1">
                    {DAY_LABELS.map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                          daysOfWeek.includes(idx)
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800',
                        )}
                      >
                        {label.charAt(0)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCustomSave}
                className="w-full rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                Set Recurrence
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
