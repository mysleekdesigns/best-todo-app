import { motion } from 'framer-motion'
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FocusSessionType } from '@/types'

interface PomodoroTimerProps {
  timeRemaining: number
  totalTime: number
  isRunning: boolean
  isPaused: boolean
  sessionType: FocusSessionType
  workSessionCount: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSkip: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function getSessionLabel(type: FocusSessionType): string {
  switch (type) {
    case 'work':
      return 'Work'
    case 'short_break':
      return 'Short Break'
    case 'long_break':
      return 'Long Break'
  }
}

const CIRCLE_SIZE = 240
const STROKE_WIDTH = 6
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function PomodoroTimer({
  timeRemaining,
  totalTime,
  isRunning,
  isPaused,
  sessionType,
  workSessionCount,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
}: PomodoroTimerProps) {
  const progress = totalTime > 0 ? timeRemaining / totalTime : 1
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const sessionNumber = sessionType === 'work' ? workSessionCount + 1 : workSessionCount
  const maxSessions = 4

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Session type label */}
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
          {getSessionLabel(sessionType)}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          Session {Math.min(sessionNumber, maxSessions)} of {maxSessions}
        </p>
      </div>

      {/* Timer circle */}
      <div className="relative" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
        <svg
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            className="text-gray-100"
          />
          {/* Progress circle */}
          <motion.circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className={
              sessionType === 'work'
                ? 'text-gray-900'
                : 'text-gray-400'
            }
            initial={false}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-light tabular-nums tracking-tight text-gray-900">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          disabled={!isRunning && !isPaused}
          className="text-gray-500 hover:text-gray-700"
        >
          <RotateCcw size={18} />
        </Button>

        {!isRunning ? (
          <Button
            onClick={onStart}
            className="h-12 w-12 rounded-full bg-gray-900 text-white hover:bg-gray-800"
            size="icon"
          >
            <Play size={20} className="ml-0.5" />
          </Button>
        ) : isPaused ? (
          <Button
            onClick={onResume}
            className="h-12 w-12 rounded-full bg-gray-900 text-white hover:bg-gray-800"
            size="icon"
          >
            <Play size={20} className="ml-0.5" />
          </Button>
        ) : (
          <Button
            onClick={onPause}
            className="h-12 w-12 rounded-full bg-gray-900 text-white hover:bg-gray-800"
            size="icon"
          >
            <Pause size={20} />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700"
        >
          <SkipForward size={18} />
        </Button>
      </div>
    </div>
  )
}
