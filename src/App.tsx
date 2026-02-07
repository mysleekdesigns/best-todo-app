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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <AnimatedPage>
                <UpcomingPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/upcoming"
            element={
              <AnimatedPage>
                <UpcomingPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/today"
            element={
              <AnimatedPage>
                <TodayPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/calendar"
            element={
              <AnimatedPage>
                <CalendarPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/sticky-wall"
            element={
              <AnimatedPage>
                <StickyWallPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/focus"
            element={
              <AnimatedPage>
                <FocusPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/habits"
            element={
              <AnimatedPage>
                <HabitsPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/settings"
            element={
              <AnimatedPage>
                <SettingsPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/list/:id"
            element={
              <AnimatedPage>
                <ListPage />
              </AnimatedPage>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
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
