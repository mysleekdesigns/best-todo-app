import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Undo2 } from 'lucide-react'

interface UndoToastProps {
  message: string
  onUndo: () => void
  duration?: number
  isVisible: boolean
  onDismiss: () => void
}

export function UndoToast({ message, onUndo, duration = 5000, isVisible, onDismiss }: UndoToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!isVisible) return

    setProgress(100)
    const start = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        onDismiss()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isVisible, duration, onDismiss])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <span className="text-sm text-gray-700 dark:text-gray-300">{message}</span>
            <button
              type="button"
              onClick={() => {
                onUndo()
                onDismiss()
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </button>
            {/* Progress indicator */}
            <div className="absolute bottom-0 left-0 h-0.5 w-full overflow-hidden rounded-b-lg">
              <div
                className="h-full bg-blue-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
