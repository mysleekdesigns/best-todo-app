import { useState, useEffect, useRef } from 'react'
import { db } from '@/db'
import { Download, Upload, Trash2, HardDrive } from 'lucide-react'
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function SettingsDataSection() {
  const [storageUsed, setStorageUsed] = useState<string>('--')
  const [storageQuota, setStorageQuota] = useState<string>('--')
  const [importing, setImporting] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showFinalConfirm, setShowFinalConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        setStorageUsed(formatBytes(estimate.usage ?? 0))
        setStorageQuota(formatBytes(estimate.quota ?? 0))
      })
    }
  }, [])

  async function handleExport() {
    const [tasks, projects, tags, settings, stickyNotes, focusSessions, habits, headings, filters] =
      await Promise.all([
        db.tasks.toArray(),
        db.projects.toArray(),
        db.tags.toArray(),
        db.appSettings.toArray(),
        db.stickyNotes.toArray(),
        db.focusSessions.toArray(),
        db.habits.toArray(),
        db.projectHeadings.toArray(),
        db.savedFilters.toArray(),
      ])

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
      lists: projects,
      tags,
      settings,
      stickyNotes,
      focusSessions,
      habits,
      listHeadings: headings,
      savedFilters: filters,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zenith-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.version || !data.tasks) {
        alert('Invalid backup file format.')
        return
      }

      await db.transaction(
        'rw',
        [db.tasks, db.projects, db.tags, db.appSettings, db.stickyNotes, db.focusSessions, db.habits, db.projectHeadings, db.savedFilters],
        async () => {
          if (data.tasks?.length) await db.tasks.bulkPut(data.tasks)
          if (data.lists?.length) await db.projects.bulkPut(data.lists)
          if (data.tags?.length) await db.tags.bulkPut(data.tags)
          if (data.settings?.length) await db.appSettings.bulkPut(data.settings)
          if (data.stickyNotes?.length) await db.stickyNotes.bulkPut(data.stickyNotes)
          if (data.focusSessions?.length) await db.focusSessions.bulkPut(data.focusSessions)
          if (data.habits?.length) await db.habits.bulkPut(data.habits)
          if (data.listHeadings?.length) await db.projectHeadings.bulkPut(data.listHeadings)
          if (data.savedFilters?.length) await db.savedFilters.bulkPut(data.savedFilters)
        },
      )

      alert('Data imported successfully!')
    } catch (err) {
      alert('Failed to import data. Please check the file format.')
      console.error('Import error:', err)
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleClearAll() {
    setShowFinalConfirm(false)
    setShowClearConfirm(false)
    await db.transaction(
      'rw',
      [db.tasks, db.projects, db.tags, db.appSettings, db.stickyNotes, db.focusSessions, db.habits, db.projectHeadings, db.savedFilters],
      async () => {
        await db.tasks.clear()
        await db.projects.clear()
        await db.tags.clear()
        await db.appSettings.clear()
        await db.stickyNotes.clear()
        await db.focusSessions.clear()
        await db.habits.clear()
        await db.projectHeadings.clear()
        await db.savedFilters.clear()
      },
    )
    window.location.reload()
  }

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-gray-900">Data Management</h2>
      <p className="mb-3 text-xs text-gray-500">Export, import, or clear your data.</p>

      <div className="space-y-3">
        {/* Storage info */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <HardDrive size={16} className="shrink-0 text-gray-500" />
          <div className="text-sm text-gray-700">
            <span className="font-medium">{storageUsed}</span> used of{' '}
            <span className="font-medium">{storageQuota}</span>
          </div>
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Download size={16} className="text-gray-500" />
          Export all data as JSON
        </button>

        {/* Import */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <Upload size={16} className="text-gray-500" />
          {importing ? 'Importing...' : 'Import data from JSON backup'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {/* Clear all */}
        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 size={16} />
          Clear all data
        </button>
      </div>

      {/* First confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your tasks, lists, tags, sticky notes, focus sessions,
              and habits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                setShowClearConfirm(false)
                setShowFinalConfirm(true)
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second confirmation */}
      <AlertDialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This cannot be undone</AlertDialogTitle>
            <AlertDialogDescription>
              All of your data will be permanently erased. This action is irreversible. Are you
              absolutely sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Delete everything</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
