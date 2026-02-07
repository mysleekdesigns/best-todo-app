import { useState, useEffect, useRef, useCallback } from 'react'
import { useSettings } from '@/db/hooks'
import { createFocusSession } from '@/db'
import type { FocusSessionType } from '@/types'

interface PomodoroTimerState {
  timeRemaining: number
  totalTime: number
  isRunning: boolean
  isPaused: boolean
  sessionType: FocusSessionType
  workSessionCount: number
  taskId: string | null
  notes: string
}

interface PomodoroTimerActions {
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
  setTaskId: (id: string | null) => void
  setNotes: (notes: string) => void
}

function playChime() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 830
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.8)
  } catch {
    // Audio not available
  }
}

function sendNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

export function usePomodoroTimer(): PomodoroTimerState & PomodoroTimerActions {
  const settings = useSettings()
  const workDuration = (settings?.pomodoroWork ?? 25) * 60
  const shortBreakDuration = (settings?.pomodoroShortBreak ?? 5) * 60
  const longBreakDuration = (settings?.pomodoroLongBreak ?? 15) * 60
  const autoStart = settings?.pomodoroAutoStart ?? false

  const [state, setState] = useState<PomodoroTimerState>({
    timeRemaining: workDuration,
    totalTime: workDuration,
    isRunning: false,
    isPaused: false,
    sessionType: 'work',
    workSessionCount: 0,
    taskId: null,
    notes: '',
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionStartRef = useRef<string | null>(null)

  // Sync work duration when settings change (only if idle)
  useEffect(() => {
    if (!state.isRunning && !state.isPaused) {
      const duration = getDurationForType(state.sessionType)
      setState((s) => ({ ...s, timeRemaining: duration, totalTime: duration }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workDuration, shortBreakDuration, longBreakDuration])

  function getDurationForType(type: FocusSessionType): number {
    switch (type) {
      case 'work':
        return workDuration
      case 'short_break':
        return shortBreakDuration
      case 'long_break':
        return longBreakDuration
    }
  }

  const completeSession = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const now = new Date().toISOString()
    const currentType = state.sessionType

    // Log session to DB
    await createFocusSession({
      taskId: state.taskId,
      startTime: sessionStartRef.current ?? now,
      endTime: now,
      duration: getDurationForType(currentType),
      type: currentType,
      completed: true,
      notes: currentType === 'work' ? state.notes : '',
    })

    playChime()

    // Determine next session
    let nextType: FocusSessionType
    let nextWorkCount = state.workSessionCount

    if (currentType === 'work') {
      nextWorkCount = state.workSessionCount + 1
      if (nextWorkCount >= 4) {
        nextType = 'long_break'
        sendNotification('Pomodoro', 'Great work! Time for a long break.')
      } else {
        nextType = 'short_break'
        sendNotification('Pomodoro', 'Good job! Take a short break.')
      }
    } else {
      nextType = 'work'
      if (currentType === 'long_break') {
        nextWorkCount = 0
      }
      sendNotification('Pomodoro', 'Break is over. Ready to focus!')
    }

    const nextDuration = getDurationForType(nextType)

    setState((s) => ({
      ...s,
      timeRemaining: nextDuration,
      totalTime: nextDuration,
      isRunning: false,
      isPaused: false,
      sessionType: nextType,
      workSessionCount: nextWorkCount,
      notes: nextType === 'work' ? '' : s.notes,
    }))

    if (autoStart) {
      // Small delay before auto-starting
      setTimeout(() => {
        sessionStartRef.current = new Date().toISOString()
        setState((s) => ({ ...s, isRunning: true, isPaused: false }))
      }, 1000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sessionType, state.workSessionCount, state.taskId, state.notes, autoStart, workDuration, shortBreakDuration, longBreakDuration])

  // Timer tick
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState((s) => {
          if (s.timeRemaining <= 1) {
            return { ...s, timeRemaining: 0 }
          }
          return { ...s, timeRemaining: s.timeRemaining - 1 }
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.isRunning, state.isPaused])

  // Check for completion
  useEffect(() => {
    if (state.isRunning && state.timeRemaining === 0) {
      completeSession()
    }
  }, [state.timeRemaining, state.isRunning, completeSession])

  function start() {
    requestNotificationPermission()
    sessionStartRef.current = new Date().toISOString()
    setState((s) => ({ ...s, isRunning: true, isPaused: false }))
  }

  function pause() {
    setState((s) => ({ ...s, isPaused: true }))
  }

  function resume() {
    setState((s) => ({ ...s, isPaused: false }))
  }

  function reset() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const duration = getDurationForType(state.sessionType)
    setState((s) => ({
      ...s,
      timeRemaining: duration,
      totalTime: duration,
      isRunning: false,
      isPaused: false,
    }))
    sessionStartRef.current = null
  }

  function skip() {
    // Complete current and move to next without logging
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    let nextType: FocusSessionType
    let nextWorkCount = state.workSessionCount

    if (state.sessionType === 'work') {
      nextWorkCount = state.workSessionCount + 1
      nextType = nextWorkCount >= 4 ? 'long_break' : 'short_break'
    } else {
      nextType = 'work'
      if (state.sessionType === 'long_break') {
        nextWorkCount = 0
      }
    }

    const nextDuration = getDurationForType(nextType)
    setState((s) => ({
      ...s,
      timeRemaining: nextDuration,
      totalTime: nextDuration,
      isRunning: false,
      isPaused: false,
      sessionType: nextType,
      workSessionCount: nextWorkCount,
    }))
    sessionStartRef.current = null
  }

  function setTaskId(id: string | null) {
    setState((s) => ({ ...s, taskId: id }))
  }

  function setNotes(notes: string) {
    setState((s) => ({ ...s, notes }))
  }

  return {
    ...state,
    start,
    pause,
    resume,
    reset,
    skip,
    setTaskId,
    setNotes,
  }
}
