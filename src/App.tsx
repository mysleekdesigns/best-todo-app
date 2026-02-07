import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { InboxPage } from '@/pages/InboxPage'
import { TodayPage } from '@/pages/TodayPage'
import { EveningPage } from '@/pages/EveningPage'
import { UpcomingPage } from '@/pages/UpcomingPage'
import { AnytimePage } from '@/pages/AnytimePage'
import { SomedayPage } from '@/pages/SomedayPage'
import { LogbookPage } from '@/pages/LogbookPage'
import { ProjectPage } from '@/pages/ProjectPage'
import { AreaPage } from '@/pages/AreaPage'
import { CalendarPage } from '@/pages/CalendarPage'

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
                <InboxPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/inbox"
            element={
              <AnimatedPage>
                <InboxPage />
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
            path="/evening"
            element={
              <AnimatedPage>
                <EveningPage />
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
            path="/anytime"
            element={
              <AnimatedPage>
                <AnytimePage />
              </AnimatedPage>
            }
          />
          <Route
            path="/someday"
            element={
              <AnimatedPage>
                <SomedayPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/logbook"
            element={
              <AnimatedPage>
                <LogbookPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/project/:id"
            element={
              <AnimatedPage>
                <ProjectPage />
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
            path="/area/:id"
            element={
              <AnimatedPage>
                <AreaPage />
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
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
