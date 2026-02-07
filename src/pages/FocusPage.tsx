import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/stores/ui-store'
import { PomodoroTimer } from '@/components/focus/PomodoroTimer'
import { FocusTaskSelector } from '@/components/focus/FocusTaskSelector'
import { FocusSessionNotes } from '@/components/focus/FocusSessionNotes'
import { FocusBreakScreen } from '@/components/focus/FocusBreakScreen'
import { FocusDashboard } from '@/components/focus/FocusDashboard'
import { usePomodoroTimer } from '@/components/focus/usePomodoroTimer'

export function FocusPage() {
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const timer = usePomodoroTimer()

  // Collapse sidebar when focus is active
  useEffect(() => {
    if (timer.isRunning) {
      setSidebarOpen(false)
    }
  }, [timer.isRunning, setSidebarOpen])

  const isBreak = timer.sessionType === 'short_break' || timer.sessionType === 'long_break'
  const showNotes = timer.sessionType === 'work' && timer.isRunning
  const showBreakScreen = isBreak && (timer.isRunning || timer.isPaused)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="mx-auto max-w-2xl p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Focus</h1>
        <p className="mt-1 text-sm text-gray-500">Deep work, one session at a time.</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Task Selector */}
        <div className="w-full">
          <FocusTaskSelector
            selectedTaskId={timer.taskId}
            onSelectTask={timer.setTaskId}
          />
        </div>

        {/* Timer */}
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-10">
          <PomodoroTimer
            timeRemaining={timer.timeRemaining}
            totalTime={timer.totalTime}
            isRunning={timer.isRunning}
            isPaused={timer.isPaused}
            sessionType={timer.sessionType}
            workSessionCount={timer.workSessionCount}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onReset={timer.reset}
            onSkip={timer.skip}
          />
        </div>

        {/* Session Notes (during work) */}
        {showNotes && (
          <FocusSessionNotes
            notes={timer.notes}
            onNotesChange={timer.setNotes}
          />
        )}

        {/* Break Screen */}
        {showBreakScreen && (
          <FocusBreakScreen sessionType={timer.sessionType} />
        )}

        {/* Dashboard */}
        <FocusDashboard />
      </div>
    </motion.div>
  )
}
