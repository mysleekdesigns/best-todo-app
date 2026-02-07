import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  X,
  ChevronDown,
  Check,
  Save,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  isFilterActive,
  countActiveFilters,
  toggleArrayValue,
  EMPTY_FILTER,
} from '@/lib/filters'
import type { TaskFilter, Priority, TaskStatus, Tag, List } from '@/types'

interface FilterPanelProps {
  filters: TaskFilter
  onFiltersChange: (filters: TaskFilter) => void
  onSave?: (name: string, filters: TaskFilter) => void
  tags?: Tag[]
  lists?: List[]
  className?: string
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onSave,
  tags = [],
  lists = [],
  className,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)

  const activeCount = countActiveFilters(filters)
  const hasFilters = isFilterActive(filters)

  function clearAll() {
    onFiltersChange(EMPTY_FILTER)
  }

  function handleSave() {
    if (!saveName.trim()) return
    onSave?.(saveName.trim(), filters)
    setSaveName('')
    setShowSave(false)
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant={hasFilters ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5"
      >
        <Filter className="size-4" />
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="bg-primary text-primary-foreground ml-0.5 flex size-5 items-center justify-center rounded-full text-xs font-medium">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={cn(
            'size-3 transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="bg-popover border-border absolute top-full right-0 z-50 mt-1 w-80 rounded-lg border shadow-lg"
          >
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-medium">Filters</span>
              <div className="flex items-center gap-1">
                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={clearAll}
                    className="text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-sm p-0.5"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 space-y-1 overflow-y-auto p-2">
              {/* Status filter */}
              <FilterSection title="Status">
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = filters.status?.includes(opt.value)
                    return (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        active={!!active}
                        onClick={() =>
                          onFiltersChange({
                            ...filters,
                            status: toggleArrayValue<TaskStatus>(filters.status, opt.value),
                          })
                        }
                      />
                    )
                  })}
                </div>
              </FilterSection>

              {/* Priority filter */}
              <FilterSection title="Priority">
                <div className="flex flex-wrap gap-1">
                  {PRIORITY_OPTIONS.map((opt) => {
                    const active = filters.priority?.includes(opt.value)
                    return (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        active={!!active}
                        onClick={() =>
                          onFiltersChange({
                            ...filters,
                            priority: toggleArrayValue<Priority>(filters.priority, opt.value),
                          })
                        }
                      />
                    )
                  })}
                </div>
              </FilterSection>

              {/* Tags filter */}
              {tags.length > 0 && (
                <FilterSection title="Tags">
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => {
                      const active = filters.tags?.includes(tag.id)
                      return (
                        <FilterChip
                          key={tag.id}
                          label={tag.name}
                          active={!!active}
                          color={tag.color}
                          onClick={() =>
                            onFiltersChange({
                              ...filters,
                              tags: toggleArrayValue(filters.tags, tag.id),
                            })
                          }
                        />
                      )
                    })}
                  </div>
                </FilterSection>
              )}

              {/* List filter */}
              {lists.length > 0 && (
                <FilterSection title="List">
                  <div className="flex flex-wrap gap-1">
                    {lists.map((list) => {
                      const active = filters.listId === list.id
                      return (
                        <FilterChip
                          key={list.id}
                          label={list.name}
                          active={active}
                          color={list.color}
                          onClick={() =>
                            onFiltersChange({
                              ...filters,
                              listId: active ? undefined : list.id,
                            })
                          }
                        />
                      )
                    })}
                  </div>
                </FilterSection>
              )}

              {/* Date filter */}
              <FilterSection title="Date">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-muted-foreground size-4 shrink-0" />
                    <input
                      type="date"
                      value={filters.dueDateFrom ?? ''}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          dueDateFrom: e.target.value || undefined,
                        })
                      }
                      className="bg-muted h-7 flex-1 rounded-md border-none px-2 text-xs"
                      placeholder="From"
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <input
                      type="date"
                      value={filters.dueDateTo ?? ''}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          dueDateTo: e.target.value || undefined,
                        })
                      }
                      className="bg-muted h-7 flex-1 rounded-md border-none px-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-1">
                    <FilterChip
                      label="Has date"
                      active={filters.hasDate === true}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          hasDate: filters.hasDate === true ? undefined : true,
                        })
                      }
                    />
                    <FilterChip
                      label="No date"
                      active={filters.hasDate === false}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          hasDate: filters.hasDate === false ? undefined : false,
                        })
                      }
                    />
                  </div>
                </div>
              </FilterSection>

            </div>

            {/* Save filter */}
            {onSave && hasFilters && (
              <div className="border-t px-3 py-2">
                {showSave ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') setShowSave(false)
                      }}
                      placeholder="Filter name..."
                      autoFocus
                      className="bg-muted h-7 flex-1 rounded-md border-none px-2 text-sm outline-none"
                    />
                    <Button variant="default" size="xs" onClick={handleSave}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSave(true)}
                    className="text-muted-foreground w-full justify-start"
                  >
                    <Save className="size-4" />
                    <span>Save as smart list</span>
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md p-2">
      <div className="text-muted-foreground mb-1.5 text-xs font-medium uppercase tracking-wider">
        {title}
      </div>
      {children}
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
  color,
  icon,
}: {
  label: string
  active: boolean
  onClick: () => void
  color?: string
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
      )}
    >
      {icon}
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
      {active && <Check className="size-3" />}
    </button>
  )
}
