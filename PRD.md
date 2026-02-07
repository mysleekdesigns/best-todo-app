# Zenith — Product Requirements Document

> The last todo app you'll ever need.

## Vision

Zenith combines the design elegance of Things 3 with the power of Todoist and TickTick — plus a built-in Pomodoro timer, calendar, Kanban board, and habit tracker. It runs entirely locally as a Progressive Web App. No account needed. No server. Your data stays on your device.

## Design Principles

1. **Speed is a feature** — Every interaction feels instant. Optimistic UI, local-first data.
2. **Calm over chaos** — Things 3-inspired minimal design. Whitespace is sacred. No visual clutter.
3. **Keyboard-first** — Every action reachable via keyboard. Command palette (Cmd+K) for power users.
4. **Progressive disclosure** — Show only what's needed. Advanced features appear when you need them.
5. **Offline by default** — Works without internet. PWA installable. Data in IndexedDB via Dexie.js.

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI primitives)
- **Dexie.js** — IndexedDB wrapper with reactive queries (`useLiveQuery`)
- **dnd-kit** — Drag and drop
- **Framer Motion** — Animations and layout transitions
- **chrono-node** — Natural language date parsing
- **date-fns** — Date utilities
- **Zustand** — Lightweight global state
- **React Router v7** — Client-side routing
- **Lucide React** — Icon set
- **vite-plugin-pwa** — PWA/service worker support
- **Vitest** + **Testing Library** — Unit and component tests

## Data Model

```
Tasks
├── id: string (nanoid)
├── title: string
├── notes: string (markdown)
├── status: 'inbox' | 'active' | 'completed' | 'cancelled'
├── priority: 0 | 1 | 2 | 3  (none, low, medium, high)
├── dueDate: string | null (ISO date)
├── dueTime: string | null (HH:mm)
├── scheduledDate: string | null
├── completedAt: string | null
├── createdAt: string
├── updatedAt: string
├── projectId: string | null
├── areaId: string | null
├── parentId: string | null (subtasks)
├── position: number (sort order)
├── tags: string[]
├── checklist: { id, text, done }[]
├── isEvening: boolean
├── recurringRule: string | null (rrule format)
└── kanbanColumn: string | null

Projects
├── id, name, color, emoji
├── areaId: string | null
├── position: number
└── createdAt: string

Areas
├── id, name, position
└── createdAt: string

Tags
├── id, name, color

FocusSessions
├── id, taskId: string | null
├── startTime, endTime, duration
├── type: 'work' | 'short_break' | 'long_break'
├── completed: boolean
└── notes: string

Habits
├── id, name, description
├── frequency: 'daily' | 'weekly' | 'custom'
├── frequencyDays: number[] (for custom: 0=Sun..6=Sat)
├── color, icon
├── streakCurrent, streakBest
├── createdAt
└── entries: { date, completed, value? }[]

AppSettings
├── theme: 'light' | 'dark' | 'system'
├── pomodoroWork: number (default 25)
├── pomodoroShortBreak: number (default 5)
├── pomodoroLongBreak: number (default 15)
├── pomodoroAutoStart: boolean
├── defaultView: string
└── weekStartsOn: 0 | 1
```

---

## Phase 1: Foundation & Core Task Management

> Goal: A beautiful, functional task manager with the basics done perfectly.

### 1.1 Project Scaffolding
- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS v4
- [x] Install and configure shadcn/ui
- [x] Set up project structure (`src/components`, `src/hooks`, `src/db`, `src/stores`, `src/lib`, `src/pages`)
- [x] Configure path aliases (`@/`)
- [x] Set up Vitest + Testing Library
- [x] Add ESLint + Prettier config

### 1.2 Database Layer
- [x] Install Dexie.js and define schema (Tasks, Projects, Areas, Tags tables)
- [x] Create database service (`src/db/index.ts`) with typed tables
- [x] Build CRUD hooks: `useTasks()`, `useTask(id)`, `useProjects()`, `useAreas()`, `useTags()`
- [x] Implement `useLiveQuery` wrappers for reactive data
- [x] Add seed data function for development

### 1.3 App Shell & Navigation
- [x] Build sidebar layout (Things 3-style: clean, collapsible)
- [x] Implement navigation: Inbox, Today, This Evening, Upcoming, Anytime, Someday, Logbook
- [x] Add task count badges on sidebar items
- [x] Build responsive layout (sidebar collapses on mobile)
- [x] Add smooth page transitions with Framer Motion

### 1.4 Task CRUD
- [x] Task list view with completion checkbox (animated circle, Things 3-style)
- [x] Quick Add bar (always accessible, `Q` shortcut or `Cmd+N`)
- [x] Natural language date parsing via chrono-node ("tomorrow", "next friday 3pm")
- [x] Task detail panel (slide-in from right, smooth animation)
- [x] Inline editing of task title
- [x] Notes field with markdown support
- [x] Priority selector (color-coded dots: none, low/blue, medium/yellow, high/red)
- [x] Due date picker with calendar popup
- [x] Task completion animation (satisfying checkmark + fade)
- [x] Delete task with undo toast
- [x] Subtasks (indent under parent, collapsible)
- [x] Checklists within a task (multi-step items)

### 1.5 Keyboard Shortcuts
- [x] `Cmd+K` / `Ctrl+K` — Command palette (search tasks, projects, navigate, run actions)
- [x] `Q` — Quick Add task
- [x] `Cmd+N` — New task
- [x] `Enter` — Open selected task
- [x] `Cmd+Backspace` — Delete task
- [x] `↑` / `↓` — Navigate task list
- [x] `Cmd+1-7` — Switch views
- [x] `Cmd+.` — Toggle sidebar
- [x] `E` — Toggle evening mode on selected task
- [x] `T` — Schedule to Today
- [x] `S` — Set Someday

### 1.6 Basic Theming
- [x] Light theme (default, Things 3-inspired: warm whites, subtle grays)
- [x] Dark theme (deep dark, not pure black)
- [x] System theme detection with manual override
- [x] CSS custom properties for theme tokens
- [x] Smooth theme transition animation

---

## Phase 2: Organization & Views

> Goal: Powerful organization without complexity.

### 2.1 Projects
- [x] Create / edit / delete projects
- [x] Project color and emoji picker
- [x] Project detail view showing all tasks
- [x] Headings within projects (section dividers, Things 3-style)
- [x] Progress indicator (pie chart or progress bar)
- [x] Drag to reorder projects in sidebar

### 2.2 Areas
- [x] Create / edit / delete areas (group projects under areas)
- [x] Area sidebar sections (collapsible)
- [x] Drag projects between areas

### 2.3 Tags
- [x] Create / edit / delete tags with colors
- [x] Tag tasks from task detail or inline
- [x] Filter by tag (sidebar or command palette)
- [x] Multi-tag filtering (AND/OR)

### 2.4 Smart Views
- [x] **Inbox** — Unprocessed tasks (no project, no date)
- [x] **Today** — Tasks due today + manually scheduled for today
- [x] **This Evening** — Today's evening subset (Things 3 concept)
- [x] **Upcoming** — Next 14 days, grouped by date
- [x] **Anytime** — All active tasks (not scheduled to Someday)
- [x] **Someday** — Parked tasks for later
- [x] **Logbook** — Completed tasks, searchable, grouped by date

### 2.5 Search & Filters
- [x] Full-text search across tasks, notes, projects
- [x] Filter panel: by status, priority, date range, tags, project
- [x] Save custom filters as smart lists
- [x] Search accessible from command palette

### 2.6 Drag & Drop
- [x] Reorder tasks within a list (dnd-kit + Framer Motion)
- [x] Drag tasks to sidebar items (move to project/area)
- [x] Multi-select tasks and batch actions (move, tag, schedule, delete)

### 2.7 Recurring Tasks
- [x] Recurring rules: daily, weekly, monthly, yearly, custom
- [x] Natural language: "every monday", "every 2 weeks"
- [x] Generate next occurrence on completion
- [x] Visual indicator for recurring tasks

---

## Phase 3: Calendar & Timeline

> Goal: See your tasks in time — plan your day and week visually.

### 3.1 Calendar View
- [x] Month view with task dots on dates
- [x] Week view with tasks as time blocks
- [x] Day view with hour-by-hour layout
- [x] Click date to see/create tasks
- [x] Drag tasks to reschedule to different dates
- [x] Today indicator and current time line

### 3.2 Timeline / Upcoming Enhanced
- [x] Scrollable timeline view (vertical, grouped by day)
- [x] Overdue section at top (highlighted)
- [x] Unscheduled section at bottom
- [x] Drag tasks from unscheduled onto dates
- [x] Week number indicators

### 3.3 Time Blocking
- [x] Assign time slots to tasks (start time + duration)
- [x] Visual time blocks in day/week view
- [x] Drag to resize time blocks
- [x] Conflict indicators when tasks overlap

---

## Phase 4: Kanban Board

> Goal: Visual workflow management with smooth drag-and-drop.

### 4.1 Board View
- [ ] Default columns: To Do, In Progress, Done
- [ ] Create / rename / delete / reorder custom columns
- [ ] Column task count and color
- [ ] Drag tasks between columns (dnd-kit, horizontal)
- [ ] Drag to reorder within columns (vertical)
- [ ] Column WIP (work-in-progress) limits with visual warning

### 4.2 Board Scoping
- [ ] Board per project (each project can have its own Kanban)
- [ ] Global board across all tasks
- [ ] Filter board by tags, priority, due date

### 4.3 Board Features
- [ ] Quick add task to column
- [ ] Expand task card to see details
- [ ] Compact vs expanded card view toggle
- [ ] Swimlanes by priority or tag (optional)

---

## Phase 5: Pomodoro & Focus Mode

> Goal: Deep work sessions tied to your tasks.

### 5.1 Pomodoro Timer
- [ ] Configurable work/break durations (default: 25/5/15)
- [ ] Visual circular countdown timer
- [ ] Start, pause, reset, skip controls
- [ ] Audio notification on timer end (subtle chime)
- [ ] Browser notification on timer end
- [ ] Auto-start next session option

### 5.2 Focus Mode
- [ ] Pick a task to focus on (or go taskless)
- [ ] Full-screen focus view (task + timer + notes)
- [ ] Distraction-free: hide sidebar and navigation
- [ ] Session notes (capture thoughts during focus)
- [ ] Break screen with suggested stretches / quotes

### 5.3 Session Tracking
- [ ] Log all focus sessions to FocusSessions table
- [ ] Link sessions to tasks
- [ ] Daily/weekly/monthly focus time stats
- [ ] Streak tracking (consecutive days with focus sessions)
- [ ] Charts: focus time by day, by project, by tag

### 5.4 Focus Dashboard
- [ ] Today's focus summary (sessions completed, total time)
- [ ] Weekly focus heatmap
- [ ] Most focused projects/areas
- [ ] Goal setting: daily focus time target

---

## Phase 6: Habit Tracking & Polish

> Goal: Build habits, track streaks, and polish every detail.

### 6.1 Habit Tracker
- [ ] Create habits with name, frequency, color, icon
- [ ] Daily check-in view (today's habits as a checklist)
- [ ] Streak counter (current and best)
- [ ] Habit calendar heatmap (GitHub contribution-style)
- [ ] Weekly/monthly completion rate charts
- [ ] Habit reminders (browser notifications)

### 6.2 Habit Views
- [ ] Habit list with streak badges
- [ ] Individual habit detail page with history
- [ ] Habit statistics: completion rate, trends, best days

### 6.3 PWA & Offline
- [ ] Configure vite-plugin-pwa for service worker
- [ ] Cache app shell and assets for offline use
- [ ] Add web app manifest (icon, name, theme color)
- [ ] Install prompt and "Add to Home Screen"
- [ ] Offline indicator in status bar

### 6.4 Data Management
- [ ] Export all data as JSON
- [ ] Import data from JSON backup
- [ ] Clear all data option (with confirmation)
- [ ] Storage usage indicator

### 6.5 Polish & Micro-interactions
- [ ] Task completion confetti (subtle, optional)
- [ ] Empty state illustrations for each view
- [ ] Onboarding walkthrough (first-run)
- [ ] Loading skeletons for all views
- [ ] Tooltip system for keyboard shortcuts
- [ ] Accessibility audit: screen reader labels, focus management, ARIA
- [ ] Performance: lazy-load views, virtualize long lists (react-window)
- [ ] Error boundaries with friendly recovery UI

### 6.6 Settings Page
- [ ] Theme selection (light/dark/system)
- [ ] Pomodoro duration config
- [ ] Default view config
- [ ] Week starts on (Sunday/Monday)
- [ ] Notification preferences
- [ ] Data export/import
- [ ] About + keyboard shortcut reference

---

## Research Sources

- [Best todo list apps — TechRadar](https://www.techradar.com/best/best-todo-list-apps)
- [7 best to do list apps — Zapier](https://zapier.com/blog/best-todo-list-apps/)
- [Things 3 Features — Cultured Code](https://culturedcode.com/things/features/)
- [Todoist Keyboard Shortcuts](https://www.todoist.com/help/articles/use-keyboard-shortcuts-in-todoist-Wyovn2)
- [Todoist Command Menu](https://www.todoist.com/inspiration/todoist-command-menu-keyboard-shortcuts)
- [TickTick vs Todoist — ClickUp](https://clickup.com/blog/ticktick-vs-todoist/)
- [Offline-first frontend apps 2025 — LogRocket](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Local-first architecture 2026 — DEV Community](https://dev.to/the_nortern_dev/the-architecture-shift-why-im-betting-on-local-first-in-2026-1nh6)
- [Dexie.js — IndexedDB Made Simple](https://dexie.org/)
- [dnd-kit — React Drag & Drop](https://dndkit.com/)
- [chrono-node — Natural Language Date Parser](https://github.com/wanasit/chrono)
- [shadcn/ui + Vite Setup](https://ui.shadcn.com/docs/installation/vite)
- [React + Vite Stack 2026 — devot.team](https://devot.team/blog/react-vite)
