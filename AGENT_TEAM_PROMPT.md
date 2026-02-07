# Agent Team Launch Prompt for Zenith — Phases 4-6

Copy and paste the prompt below into a new Claude Code session (from this project directory) to launch your agent team.

> **Prerequisites**: Phases 1-3 and the Design Overhaul v2 are complete. The app has task CRUD, lists, tags, search, filters, drag-and-drop, recurring tasks, calendar views (month/week/day/timeline), time blocking, and a basic Sticky Wall page. The database is on version 4 with tables for tasks, projects (Lists), tags, stickyNotes, focusSessions, habits, appSettings, projectHeadings, and savedFilters.

---

## The Prompt

```
Create an agent team called "zenith-phase456" to build Phases 4-6 of Zenith — a local-first todo PWA. Read the PRD.md for full requirements and CLAUDE.md for project context.

The app already has: task CRUD, lists, tags, search/filters, drag-and-drop, recurring tasks, calendar (month/week/day/timeline), time blocking, and a basic Sticky Wall page. Database is on version 4 with all tables defined. Focus and habit component directories exist as stubs.

Spawn 4 teammates that work in parallel. Use Sonnet for each teammate to keep costs reasonable. Use bypassPermissions mode for teammates.

## Team Structure

### Teammate 1: "db-hooks" — Database Hooks & Services
Owns: src/db/hooks.ts, src/hooks/ (new hook files only)
Tasks:
- Add useFocusSessions() hook — query focus sessions with useLiveQuery
- Add useFocusSession(id) hook
- Add useTodayFocusSessions() hook — sessions for current day
- Add useFocusStats(range) hook — aggregate stats (total time, session count, streak)
- Add useHabits() hook — all habits with useLiveQuery
- Add useHabit(id) hook
- Add useTodayHabits() hook — habits due today based on frequency
- Add useHabitStats(habitId) hook — completion rate, streak, trends
- Add useHabitEntries(habitId, dateRange) hook
- Verify existing CRUD functions work: createFocusSession, updateFocusSession, createHabit, updateHabit, deleteHabit
- Add any missing CRUD: deleteFocusSession, getFocusSessionsByTask, getHabitEntriesForDate, completeHabitEntry
- Add focus streak calculation logic (consecutive days with completed sessions)
- Export all new hooks from src/hooks/index.ts
- DO NOT touch src/db/index.ts schema — it's already correct at version 4

### Teammate 2: "focus-mode" — Pomodoro Timer & Focus Mode
Owns: src/components/focus/, src/pages/FocusPage.tsx (new file)
Depends on: db-hooks completing focus session hooks
Tasks:
- Pomodoro timer with circular countdown visualization (SVG circle + animated stroke-dashoffset)
- Configurable work/break durations (read from AppSettings: 25/5/15 defaults)
- Timer controls: start, pause, reset, skip to next session
- Auto-cycle: work → short break → work → ... → long break (after 4 work sessions)
- Auto-start next session option (from AppSettings.pomodoroAutoStart)
- Audio notification on timer end (subtle chime, use Web Audio API)
- Browser Notification API on timer end (request permission on first use)
- Focus mode: pick a task to focus on (or go taskless)
- Full-screen focus view: selected task title + timer + session notes textarea
- Distraction-free: hide sidebar and navigation (communicate with ui-store)
- Session notes field (capture thoughts during focus, saved to FocusSession.notes)
- Break screen with motivational message
- Log completed sessions to FocusSessions table via createFocusSession
- Link sessions to tasks (FocusSession.taskId)
- Focus dashboard section: today's sessions completed, total focus time today
- Weekly focus time bar chart (last 7 days)
- Add /focus route — wire into App.tsx routing
- Add Focus entry to sidebar navigation (use Timer icon from Lucide)
- Style: match existing app aesthetic — white cards, neutral grays, Tailwind v4

### Teammate 3: "habits" — Habit Tracker
Owns: src/components/habits/, src/pages/HabitsPage.tsx (new file)
Depends on: db-hooks completing habit hooks
Tasks:
- Create habit form: name, description, frequency (daily/weekly/custom), color picker, icon picker
- Edit and delete habits with confirmation dialog
- Daily check-in view: today's habits as a checklist (checkboxes, one per habit)
- Mark habit as done for today (creates entry in habit.entries[])
- Streak counter display: current streak + best streak badges
- Habit calendar heatmap (GitHub contribution-style grid showing last 12 weeks)
- Color intensity based on completion (empty → light → medium → dark)
- Weekly completion rate display (e.g., "5/7 days this week")
- Individual habit detail page with full history and stats
- Habit list view with streak badges and today's status
- Add /habits route — wire into App.tsx routing
- Add Habits entry to sidebar navigation (use Target or Flame icon from Lucide)
- Style: match existing app aesthetic — white cards, neutral grays, Tailwind v4
- Use Framer Motion for check animations and layout transitions

### Teammate 4: "polish" — Sticky Wall, PWA, Settings & Polish
Owns: src/pages/StickyWallPage.tsx, src/pages/SettingsPage.tsx (new file), src/components/settings/ (new dir)
Tasks:
**Sticky Wall polish (Phase 4):**
- Verify sticky note CRUD works (create, edit, delete with confirmation)
- Add drag-and-drop reorder for sticky notes (dnd-kit grid reorder)
- Ensure color picker works (yellow, cyan, pink, orange, green, purple)
- Auto-save on edit (debounced 500ms)
- Responsive grid: 3 cols desktop, 2 tablet, 1 mobile
- "+" add card as last grid item (dashed border)

**Settings page (Phase 6.6):**
- Create /settings route and SettingsPage
- Theme selection (light/dark/system) — wire to existing theme-provider
- Pomodoro duration config (work, short break, long break minutes)
- Auto-start next session toggle
- Default view selector (upcoming/today/calendar/sticky-wall)
- Week starts on (Sunday/Monday)
- Keyboard shortcut reference card
- Add Settings entry to sidebar (already has slot at bottom)

**Data management (Phase 6.4):**
- Export all data as JSON (download file)
- Import data from JSON backup (file upload + validation)
- Clear all data option (with double confirmation)
- Storage usage indicator (estimate IndexedDB size)

**PWA setup (Phase 6.3):**
- Configure vite-plugin-pwa in vite.config.ts
- Add web app manifest (name, icons, theme color, display: standalone)
- Cache app shell and assets for offline use
- Offline indicator banner when network unavailable

**Polish (Phase 6.5):**
- Empty state illustrations/messages for each view (Today, Upcoming, Calendar, Sticky Wall, Focus, Habits)
- Loading skeletons for task lists and calendar
- Error boundaries with friendly recovery UI
- Accessibility: add aria-labels to interactive elements, focus management on modals

## Coordination Rules
- db-hooks MUST complete before focus-mode and habits start building components that use the hooks
- polish teammate can start immediately (Sticky Wall and Settings don't depend on new hooks)
- Each teammate owns their directories — do NOT edit files in another teammate's directories
- Shared files that need updates (App.tsx for routes, Sidebar.tsx for nav entries):
  - focus-mode adds /focus route and sidebar entry
  - habits adds /habits route and sidebar entry
  - polish adds /settings route
  - If conflicts arise, the LAST teammate to finish should reconcile App.tsx routes
- The existing ViewId type in src/stores/ui-store.ts may need extending — only the teammate adding sidebar entries should update it
- Use the shared task list to track progress
- Wait for all teammates to finish before the lead verifies the build
- Run `npm run build` after all work is complete to verify no TypeScript errors
- Only approve plans that follow the tech stack in CLAUDE.md (React 19, Tailwind v4, shadcn/ui, Dexie.js, Framer Motion, etc.)
```

---

## How to Use

1. Open a terminal in this project directory
2. Run `claude` to start a new Claude Code session
3. Paste the prompt above
4. Claude will create the team, spawn 4 teammates, and coordinate work
5. Use **Shift+Up/Down** to select teammates and message them directly
6. Use **Ctrl+T** to toggle the shared task list
7. Use **Shift+Tab** to enable delegate mode (prevents lead from coding)
8. When done, tell the lead: "Clean up the team"

## Tips
- If the lead starts coding instead of delegating, tell it: "Wait for your teammates to complete their tasks before proceeding"
- If a teammate gets stuck, message them directly with additional context
- The db-hooks teammate should finish first — focus-mode and habits depend on the new hooks
- The polish teammate can work in parallel with db-hooks since it doesn't need the new hooks
- After all teammates finish, verify the build with `npm run build` — UI utility files often need manual fixups
- If App.tsx has route conflicts from multiple teammates, resolve them manually after the team finishes
- For split panes (each teammate in own terminal), install tmux: `brew install tmux`

## Existing Codebase Reference

For teammate context, here's what already exists:

**Database (src/db/index.ts):** Version 4 schema with tables: tasks, projects (Lists), tags, focusSessions, habits, appSettings, projectHeadings, savedFilters, stickyNotes. CRUD functions exist for all tables. Calendar query functions exist.

**Hooks (src/db/hooks.ts):** useTasks, useTask, useTasksByList, useSubtasks, useTodayTasks, useLists, useList, useTags, useSettings, useStickyNotes, useStickyNote, useListHeadings, useSavedFilters, useFilteredTasks, useSearchTasks, useTasksByDateRange, useTasksForDate, useTasksWithTimeBlocks, useOverdueTasks, useUnscheduledActiveTasks.

**Pages:** TodayPage, UpcomingPage, CalendarPage, StickyWallPage, ListPage.

**Routing (App.tsx):** /, /upcoming, /today, /calendar, /sticky-wall, /list/:id — all wrapped in AppShell with Framer Motion page transitions.

**Stores (ui-store.ts):** sidebarOpen, activeView (upcoming|today|calendar|sticky-wall), collapsedSections.

**Components:** 13 task components, 14 calendar components, 4 layout components, 11 UI utility components. Empty stubs in focus/, habits/, kanban/.
