import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Inbox,
  Sun,
  Calendar,
  Circle,
  Cloud,
  BookOpen,
  Plus,
  Palette,
  FileText,
  FolderOpen,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useTheme } from '@/components/ui/theme-provider'
import { MOD_LABEL } from '@/lib/keyboard-shortcuts'
import { useSearchTasks } from '@/db/hooks'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { cycleTheme, mode } = useTheme()

  const debouncedSearch = useDebounce(search, 150)
  const searchResults = useSearchTasks(debouncedSearch) ?? []
  const projects = useLiveQuery(() => db.projects.toArray(), []) ?? []

  const hasSearch = debouncedSearch.trim().length > 0

  // Filter projects by search query
  const matchingProjects = hasSearch
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : []

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Clear search when closing
  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const runAction = useCallback(
    (action: () => void) => {
      setOpen(false)
      action()
    },
    [],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Search results — tasks */}
        {hasSearch && searchResults.length > 0 && (
          <>
            <CommandGroup heading="Tasks">
              {searchResults.slice(0, 8).map((task) => (
                <CommandItem
                  key={task.id}
                  value={`task-${task.id}-${task.title}`}
                  onSelect={() =>
                    runAction(() => {
                      window.dispatchEvent(
                        new CustomEvent('zenith:select-task', {
                          detail: { taskId: task.id },
                        }),
                      )
                    })
                  }
                >
                  <FileText className="size-4" />
                  <span className="flex-1 truncate">{task.title}</span>
                  <span className="text-muted-foreground text-xs capitalize">
                    {task.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Search results — projects */}
        {hasSearch && matchingProjects.length > 0 && (
          <>
            <CommandGroup heading="Projects">
              {matchingProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`project-${project.id}-${project.name}`}
                  onSelect={() =>
                    runAction(() => navigate(`/project/${project.id}`))
                  }
                >
                  <FolderOpen className="size-4" />
                  <span>
                    {project.emoji} {project.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runAction(() => navigate('/inbox'))}>
            <Inbox className="size-4" />
            <span>Inbox</span>
            <CommandShortcut>{MOD_LABEL}1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate('/today'))}>
            <Sun className="size-4" />
            <span>Today</span>
            <CommandShortcut>{MOD_LABEL}2</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate('/upcoming'))}>
            <Calendar className="size-4" />
            <span>Upcoming</span>
            <CommandShortcut>{MOD_LABEL}3</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate('/anytime'))}>
            <Circle className="size-4" />
            <span>Anytime</span>
            <CommandShortcut>{MOD_LABEL}4</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate('/someday'))}>
            <Cloud className="size-4" />
            <span>Someday</span>
            <CommandShortcut>{MOD_LABEL}5</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate('/logbook'))}>
            <BookOpen className="size-4" />
            <span>Logbook</span>
            <CommandShortcut>{MOD_LABEL}6</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runAction(() => {
            window.dispatchEvent(new CustomEvent('zenith:quick-add'))
          })}>
            <Plus className="size-4" />
            <span>New task</span>
            <CommandShortcut>{MOD_LABEL}N</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Appearance">
          <CommandItem onSelect={() => runAction(cycleTheme)}>
            <Palette className="size-4" />
            <span>Toggle theme ({mode})</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

/**
 * Simple debounce hook for search input.
 */
function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
