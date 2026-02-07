import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FileText, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearchTasks } from '@/db/hooks'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { buildSearchResults, splitByHighlights } from '@/lib/search'
import type { SearchResult } from '@/lib/search'
import { MOD_LABEL } from '@/lib/keyboard-shortcuts'

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const tasks = useSearchTasks(query) ?? []
  const projects = useLiveQuery(() => db.projects.toArray(), []) ?? []
  const results = buildSearchResults(query, tasks, projects)

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results.length])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Global Cmd+F / Ctrl+F to focus search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const selectResult = useCallback(
    (result: SearchResult) => {
      setIsOpen(false)
      setQuery('')
      if (result.type === 'project') {
        navigate(`/project/${result.id}`)
      } else {
        // Dispatch event for task selection — the task-ui components will handle
        window.dispatchEvent(
          new CustomEvent('zenith:select-task', { detail: { taskId: result.id } }),
        )
      }
    },
    [navigate],
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      selectResult(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            if (query) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Search... (${MOD_LABEL}F)`}
          className={cn(
            'bg-muted/50 text-foreground placeholder:text-muted-foreground h-9 w-full rounded-lg border border-transparent py-2 pr-8 pl-9 text-sm outline-none transition-colors',
            'focus:border-border focus:bg-background focus:ring-ring/20 focus:ring-2',
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="bg-popover border-border absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border shadow-lg"
          >
            <div className="max-h-80 overflow-y-auto py-1">
              {results.map((result, idx) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectResult(result)
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                    idx === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent/50',
                  )}
                >
                  {result.type === 'project' ? (
                    <FolderOpen className="text-muted-foreground size-4 shrink-0" />
                  ) : (
                    <FileText className="text-muted-foreground size-4 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">
                      <HighlightedText text={result.title} highlights={result.highlights} />
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      {result.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {isOpen && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="bg-popover border-border absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border p-4 text-center shadow-lg"
          >
            <p className="text-muted-foreground text-sm">No results found</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HighlightedText({
  text,
  highlights,
}: {
  text: string
  highlights: Array<{ start: number; end: number }>
}) {
  const segments = splitByHighlights(text, highlights)
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <mark key={i} className="bg-yellow-200 text-inherit dark:bg-yellow-800 rounded-sm">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  )
}
