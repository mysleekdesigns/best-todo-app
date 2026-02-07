import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, StickyNote } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStickyNotes } from '@/db/hooks'
import { createStickyNote, updateStickyNote, deleteStickyNote } from '@/db'
import { EmptyState } from '@/components/ui/empty-state'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import type { StickyNote as StickyNoteType, StickyNoteColor } from '@/types'

const colorMap: Record<StickyNoteColor, string> = {
  yellow: 'bg-yellow-100',
  cyan: 'bg-cyan-100',
  pink: 'bg-pink-100',
  orange: 'bg-orange-100',
  green: 'bg-green-100',
  purple: 'bg-purple-100',
}

const colorOptions: StickyNoteColor[] = ['yellow', 'cyan', 'pink', 'orange', 'green', 'purple']

const colorDotMap: Record<StickyNoteColor, string> = {
  yellow: 'bg-yellow-400',
  cyan: 'bg-cyan-400',
  pink: 'bg-pink-400',
  orange: 'bg-orange-400',
  green: 'bg-green-400',
  purple: 'bg-purple-400',
}

interface StickyCardProps {
  note: StickyNoteType
  onUpdate: (id: string, changes: Partial<StickyNoteType>) => void
  onRequestDelete: (id: string) => void
}

function SortableStickyCard({ note, onUpdate, onRequestDelete }: StickyCardProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingContent, setEditingContent] = useState(false)
  const [titleValue, setTitleValue] = useState(note.title)
  const [contentValue, setContentValue] = useState(note.content)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    setTitleValue(note.title)
    setContentValue(note.content)
  }, [note.title, note.content])

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [editingTitle])

  useEffect(() => {
    if (editingContent && contentRef.current) {
      contentRef.current.focus()
    }
  }, [editingContent])

  const debouncedUpdate = useCallback(
    (id: string, changes: Partial<StickyNoteType>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onUpdate(id, changes)
      }, 500)
    },
    [onUpdate],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const saveTitle = () => {
    setEditingTitle(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = titleValue.trim()
    if (trimmed !== note.title) {
      onUpdate(note.id, { title: trimmed })
    }
  }

  const saveContent = () => {
    setEditingContent(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (contentValue !== note.content) {
      onUpdate(note.id, { content: contentValue })
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`group relative rounded-xl p-5 min-h-[180px] ${colorMap[note.color]} transition-shadow hover:shadow-md`}
      >
        {/* Drag handle */}
        <div
          {...listeners}
          className="absolute top-2 left-2 cursor-grab rounded p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-60 hover:opacity-100 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </div>

        {/* Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="rounded p-1 text-gray-500 hover:text-gray-700"
            aria-label="Change color"
          >
            <div className={`h-4 w-4 rounded-full ${colorDotMap[note.color]}`} />
          </button>
          <button
            onClick={() => onRequestDelete(note.id)}
            className="rounded p-1 text-gray-500 hover:text-red-500"
            aria-label="Delete note"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Color picker */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-10 right-2 z-10 flex gap-1 rounded-lg bg-white p-2 shadow-lg border border-gray-200"
            >
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onUpdate(note.id, { color: c })
                    setShowColorPicker(false)
                  }}
                  className={`h-6 w-6 rounded-full ${colorDotMap[c]} transition-transform hover:scale-110 ${
                    c === note.color ? 'ring-2 ring-gray-900 ring-offset-1' : ''
                  }`}
                  aria-label={`Set color to ${c}`}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        {editingTitle ? (
          <input
            ref={titleRef}
            type="text"
            value={titleValue}
            onChange={(e) => {
              setTitleValue(e.target.value)
              debouncedUpdate(note.id, { title: e.target.value.trim() })
            }}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle()
              if (e.key === 'Escape') {
                setTitleValue(note.title)
                setEditingTitle(false)
              }
            }}
            className="w-full bg-transparent text-base font-bold text-gray-900 mb-2 outline-none"
          />
        ) : (
          <h3
            className="text-base font-bold text-gray-900 mb-2 cursor-text"
            onClick={() => setEditingTitle(true)}
          >
            {note.title || 'Untitled'}
          </h3>
        )}

        {/* Content */}
        {editingContent ? (
          <textarea
            ref={contentRef}
            value={contentValue}
            onChange={(e) => {
              setContentValue(e.target.value)
              debouncedUpdate(note.id, { content: e.target.value })
            }}
            onBlur={saveContent}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setContentValue(note.content)
                setEditingContent(false)
              }
            }}
            className="w-full bg-transparent text-sm text-gray-700 leading-relaxed outline-none resize-none min-h-[80px]"
          />
        ) : (
          <p
            className="text-sm text-gray-700 leading-relaxed cursor-text whitespace-pre-wrap"
            onClick={() => setEditingContent(true)}
          >
            {note.content || 'Click to add content...'}
          </p>
        )}
      </motion.div>
    </div>
  )
}

export function StickyWallPage() {
  const notes = useStickyNotes()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const handleAdd = async () => {
    const position = notes ? Math.max(0, ...notes.map((n) => n.position)) + 1000 : 0
    await createStickyNote({
      title: '',
      content: '',
      color: 'yellow',
      position,
    })
  }

  const handleUpdate = useCallback(async (id: string, changes: Partial<StickyNoteType>) => {
    await updateStickyNote(id, changes)
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteStickyNote(deleteId)
    setDeleteId(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !notes) return

    const oldIndex = notes.findIndex((n) => n.id === active.id)
    const newIndex = notes.findIndex((n) => n.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(notes, oldIndex, newIndex)
    // Update positions in DB
    await Promise.all(
      reordered.map((note, index) =>
        updateStickyNote(note.id, { position: index * 1000 }),
      ),
    )
  }

  const hasNotes = notes && notes.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="mx-auto max-w-6xl p-8"
    >
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Sticky Wall</h1>
      </div>

      {!hasNotes && notes !== undefined ? (
        <EmptyState
          icon={StickyNote}
          title="No sticky notes yet"
          description="Create colorful notes to capture quick ideas, reminders, or anything on your mind."
          actionLabel="Add a note"
          onAction={handleAdd}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={notes?.map((n) => n.id) ?? []}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence initial={false}>
                {notes?.map((note) => (
                  <SortableStickyCard
                    key={note.id}
                    note={note}
                    onUpdate={handleUpdate}
                    onRequestDelete={setDeleteId}
                  />
                ))}
              </AnimatePresence>

              {/* Add card */}
              <button
                onClick={handleAdd}
                className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center min-h-[180px] text-gray-400 hover:border-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Add sticky note"
              >
                <Plus size={32} />
              </button>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sticky note?</AlertDialogTitle>
            <AlertDialogDescription>
              This note will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
