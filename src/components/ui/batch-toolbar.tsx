import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  FolderInput,
  Tag,
  CalendarClock,
  Trash2,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { List, Tag as TagType } from '@/types'

type BatchAction = 'move' | 'tag' | 'schedule' | 'delete'

interface BatchToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  onMove: (listId: string | null) => void
  onTag: (tagIds: string[]) => void
  onSchedule: (date: string | null) => void
  onDelete: () => void
  lists?: List[]
  tags?: TagType[]
  className?: string
}

export function BatchToolbar({
  selectedCount,
  onClearSelection,
  onMove,
  onTag,
  onSchedule,
  onDelete,
  lists = [],
  tags = [],
  className,
}: BatchToolbarProps) {
  const [activeAction, setActiveAction] = useState<BatchAction | null>(null)

  if (selectedCount === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={cn(
          'bg-popover border-border fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit max-w-lg items-center gap-2 rounded-xl border px-4 py-2.5 shadow-xl',
          className,
        )}
      >
        <span className="text-foreground mr-1 text-sm font-medium">
          {selectedCount} selected
        </span>

        <div className="bg-border h-5 w-px" />

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveAction(activeAction === 'move' ? null : 'move')}
            className="gap-1"
          >
            <FolderInput className="size-4" />
            <span>Move</span>
            <ChevronDown className="size-3" />
          </Button>
          {activeAction === 'move' && (
            <ActionDropdown onClose={() => setActiveAction(null)}>
              <DropdownItem
                onClick={() => {
                  onMove(null)
                  setActiveAction(null)
                }}
              >
                No list
              </DropdownItem>
              {lists.map((l) => (
                <DropdownItem
                  key={l.id}
                  onClick={() => {
                    onMove(l.id)
                    setActiveAction(null)
                  }}
                >
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                  {l.name}
                </DropdownItem>
              ))}
            </ActionDropdown>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveAction(activeAction === 'tag' ? null : 'tag')}
            className="gap-1"
          >
            <Tag className="size-4" />
            <span>Tag</span>
            <ChevronDown className="size-3" />
          </Button>
          {activeAction === 'tag' && (
            <ActionDropdown onClose={() => setActiveAction(null)}>
              {tags.length === 0 && (
                <div className="text-muted-foreground px-3 py-2 text-xs">
                  No tags available
                </div>
              )}
              {tags.map((tag) => (
                <DropdownItem
                  key={tag.id}
                  onClick={() => {
                    onTag([tag.id])
                    setActiveAction(null)
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </DropdownItem>
              ))}
            </ActionDropdown>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setActiveAction(activeAction === 'schedule' ? null : 'schedule')
            }
            className="gap-1"
          >
            <CalendarClock className="size-4" />
            <span>Schedule</span>
            <ChevronDown className="size-3" />
          </Button>
          {activeAction === 'schedule' && (
            <ActionDropdown onClose={() => setActiveAction(null)}>
              <DropdownItem
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  onSchedule(today)
                  setActiveAction(null)
                }}
              >
                Today
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  onSchedule(tomorrow.toISOString().split('T')[0])
                  setActiveAction(null)
                }}
              >
                Tomorrow
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  onSchedule(null)
                  setActiveAction(null)
                }}
              >
                Remove date
              </DropdownItem>
              <div className="px-2 py-1">
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      onSchedule(e.target.value)
                      setActiveAction(null)
                    }
                  }}
                  className="bg-muted h-7 w-full rounded-md border-none px-2 text-xs"
                />
              </div>
            </ActionDropdown>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive gap-1"
        >
          <Trash2 className="size-4" />
          <span>Delete</span>
        </Button>

        <div className="bg-border h-5 w-px" />

        <button
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground rounded-sm p-1"
        >
          <X className="size-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

function ActionDropdown({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <>
      {/* Click outside overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.1 }}
        className="bg-popover border-border absolute bottom-full left-0 z-50 mb-1 min-w-44 rounded-lg border py-1 shadow-lg"
      >
        {children}
      </motion.div>
    </>
  )
}

function DropdownItem({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="hover:bg-accent flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors"
    >
      {children}
    </button>
  )
}
