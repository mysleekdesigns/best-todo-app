import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChecklistItem } from '@/types'

interface ChecklistEditorProps {
  items: ChecklistItem[]
  onToggle: (itemId: string) => void
  onAdd: (text: string) => void
  onRemove: (itemId: string) => void
  className?: string
}

export function ChecklistEditor({ items, onToggle, onAdd, onRemove, className }: ChecklistEditorProps) {
  const [newText, setNewText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    const text = newText.trim()
    if (!text) return
    onAdd(text)
    setNewText('')
    inputRef.current?.focus()
  }

  const doneCount = items.filter((i) => i.done).length

  return (
    <div className={cn('space-y-1', className)}>
      {items.length > 0 && (
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          <div className="h-1 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-1 rounded-full bg-blue-400 transition-all duration-300"
              style={{ width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%` }}
            />
          </div>
          <span>{doneCount}/{items.length}</span>
        </div>
      )}

      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="group flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                item.done
                  ? 'border-blue-400 bg-blue-400 text-white'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600',
              )}
              aria-label={item.done ? 'Uncheck item' : 'Check item'}
            >
              {item.done && (
                <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M2 6l3 3 5-5" />
                </svg>
              )}
            </button>
            <span
              className={cn(
                'flex-1 text-sm',
                item.done && 'text-gray-400 line-through',
              )}
            >
              {item.text}
            </span>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded p-0.5 text-gray-300 opacity-0 transition-opacity hover:text-gray-500 group-hover:opacity-100"
              aria-label="Remove checklist item"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex items-center gap-2 pt-1">
        <Plus className="h-4 w-4 text-gray-300" />
        <input
          ref={inputRef}
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Add item..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-300 outline-none dark:text-gray-300 dark:placeholder-gray-600"
        />
      </div>
    </div>
  )
}
