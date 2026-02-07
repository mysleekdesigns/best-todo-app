import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Coffee } from 'lucide-react'
import type { FocusSessionType } from '@/types'

const BREAK_MESSAGES = [
  'Stretch your legs, rest your eyes.',
  'A rested mind is a creative mind.',
  'Step away. The best ideas come when you least expect them.',
  'Take a breath. You earned this.',
  'Your brain needs rest to consolidate what you learned.',
  'Look out the window. Let your thoughts wander.',
  'Grab some water. Hydration helps focus.',
  'Close your eyes for a moment. Reset.',
]

interface FocusBreakScreenProps {
  sessionType: FocusSessionType
}

export function FocusBreakScreen({ sessionType }: FocusBreakScreenProps) {
  const message = useMemo(
    () => BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)],
    [],
  )

  const isLongBreak = sessionType === 'long_break'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-lg border border-border bg-card p-6 text-center"
    >
      <Coffee size={24} className="mx-auto mb-3 text-muted-foreground" />
      <h3 className="text-lg font-semibold text-foreground">
        {isLongBreak ? 'Time for a long break!' : 'Time for a break!'}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </motion.div>
  )
}
