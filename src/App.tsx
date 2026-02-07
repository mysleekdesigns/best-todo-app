import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { TodayPage } from '@/pages/TodayPage'
import { UpcomingPage } from '@/pages/UpcomingPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { StickyWallPage } from '@/pages/StickyWallPage'
import { ListPage } from '@/pages/ListPage'
import { FocusPage } from '@/pages/FocusPage'
import { HabitsPage } from '@/pages/HabitsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ErrorBoundary } from '@/components/ui/error-boundary'

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.15, ease: 'easeInOut' as const },
}

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return <motion.div {...pageTransition}>{children}</motion.div>
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <AnimatedPage key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<UpcomingPage />} />
            <Route path="/upcoming" element={<UpcomingPage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/sticky-wall" element={<StickyWallPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/list/:id" element={<ListPage />} />
          </Routes>
        </AnimatedPage>
      </AnimatePresence>
    </AppShell>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AnimatedRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
