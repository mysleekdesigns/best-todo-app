import { useRef, useEffect } from 'react'

interface FocusSessionNotesProps {
  notes: string
  onNotesChange: (notes: string) => void
}

export function FocusSessionNotes({ notes, onNotesChange }: FocusSessionNotesProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [notes])

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Session Notes
      </label>
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Capture thoughts during your session..."
        rows={3}
        className="w-full resize-none border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
