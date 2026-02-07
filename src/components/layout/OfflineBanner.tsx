import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-foreground px-4 py-3 text-sm text-background"
        >
          <WifiOff size={16} />
          <span>You're offline. Changes will sync when reconnected.</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
