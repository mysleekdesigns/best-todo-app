import { useState, useRef, useEffect } from 'react'
import { Tag as TagIcon, Plus, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTags } from '@/db/hooks'
import { createTag } from '@/db'
import { TagBadge } from './TagBadge'

const TAG_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
]

interface TagSelectorProps {
  selectedTagIds: string[]
  onToggleTag: (tagId: string) => void
  className?: string
}

export function TagSelector({ selectedTagIds, onToggleTag, className }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const allTags = useTags()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
        setSearch('')
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isOpen])

  const selectedTags = (allTags ?? []).filter((t) => selectedTagIds.includes(t.id))
  const filteredTags = (allTags ?? []).filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCreateTag = async () => {
    const name = newTagName.trim()
    if (!name) return
    const id = await createTag({ name, color: newTagColor })
    onToggleTag(id)
    setIsCreating(false)
    setNewTagName('')
    setNewTagColor(TAG_COLORS[0])
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id}
            name={tag.name}
            color={tag.color}
            size="md"
            onRemove={() => onToggleTag(tag.id)}
          />
        ))}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <TagIcon className="h-3.5 w-3.5" />
          {selectedTags.length === 0 && 'Add tag'}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {!isCreating ? (
            <>
              {/* Search */}
              <div className="border-b border-gray-100 p-2 dark:border-gray-800">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none dark:text-gray-300"
                />
              </div>

              {/* Tag list */}
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => onToggleTag(tag.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 text-left">{tag.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-500" />}
                    </button>
                  )
                })}
                {filteredTags.length === 0 && (
                  <p className="px-2 py-3 text-center text-xs text-gray-400">No tags found</p>
                )}
              </div>

              {/* Create new */}
              <div className="border-t border-gray-100 p-1 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create new tag
                </button>
              </div>
            </>
          ) : (
            /* Create tag form */
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">New Tag</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false)
                    setNewTagName('')
                  }}
                  className="rounded p-0.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTag()
                  if (e.key === 'Escape') {
                    setIsCreating(false)
                    setNewTagName('')
                  }
                }}
                placeholder="Tag name"
                autoFocus
                className="mb-2 w-full rounded-md border border-gray-200 bg-transparent px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 dark:border-gray-700 dark:text-gray-300"
              />
              <div className="mb-3 flex flex-wrap gap-1.5">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={cn(
                      'h-5 w-5 rounded-full transition-all',
                      newTagColor === color && 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900',
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="w-full rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Tag
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
