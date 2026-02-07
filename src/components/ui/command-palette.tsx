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
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { useTheme } from '@/components/ui/theme-provider'
import { MOD_LABEL } from '@/lib/keyboard-shortcuts'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { cycleTheme, mode } = useTheme()

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

  const runAction = useCallback(
    (action: () => void) => {
      setOpen(false)
      action()
    },
    [],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

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
            // Dispatch custom event for quick-add — task-ui teammate will handle the UI
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
