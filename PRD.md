# Zenith — Product Requirements Document

> The last todo app you'll ever need.

## Vision

Zenith is a clean, minimal productivity app combining task management, calendar scheduling, and visual note-taking — all in one local-first Progressive Web App. No account needed. No server. Your data stays on your device.

## Design Principles

1. **Speed is a feature** — Every interaction feels instant. Optimistic UI, local-first data.
2. **Paper-like clarity** — Clean, neutral aesthetic. Light backgrounds, white cards, generous whitespace. No visual noise.
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

---

## Design & Layout Specification

> Reference: Screenshots define the target look and feel. All UI built with Tailwind CSS + shadcn/ui components.

### Color Palette

- **Background**: Light warm gray (`bg-gray-100` / `#f3f4f6`) — the page behind everything
- **Cards/Panels**: Pure white (`bg-white`) with subtle border (`border-gray-200`) or light shadow (`shadow-sm`)
- **Sidebar**: White background, no blur/glassmorphism — clean and flat
- **Text**: Near-black for headings (`text-gray-900`), medium gray for secondary (`text-gray-500`)
- **Accents**: Minimal — used only for list color dots, tag chips, and calendar time blocks
- **List Colors**: Saturated dots — pink/coral (`bg-pink-400`), cyan (`bg-cyan-400`), yellow (`bg-yellow-400`), etc.
- **Tag Chips**: Pastel backgrounds — light blue (`bg-blue-100`), light pink (`bg-pink-100`), etc.
- **Time Block Colors**: Soft pastels — light blue (`bg-blue-100`), light pink (`bg-pink-100`), light gray (`bg-gray-200`)
- **Sticky Note Colors**: Pastel — yellow (`bg-yellow-100`), cyan (`bg-cyan-100`), pink (`bg-pink-100`), orange (`bg-orange-100`)
- **Dark mode**: Deep neutral dark background, white text, muted accents (same palette inverted)

### Typography

- **Font**: Inter (Google Fonts) or system sans-serif stack
- **Page titles**: Bold, large (`text-4xl font-bold tracking-tight text-gray-900`)
- **Section labels**: Uppercase, small, medium weight (`text-xs font-medium uppercase tracking-wider text-gray-400`)
- **Task titles**: Regular weight, medium size (`text-sm text-gray-900`)
- **Metadata**: Small, gray (`text-xs text-gray-500`)
- **Count badges**: Rounded rectangle, gray background (`bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-md`)

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ ┌──────────────┐  ┌──────────────────────────────────┐  │
│ │   Sidebar     │  │       Main Content Area          │  │
│ │  (fixed left) │  │                                  │  │
│ │   ~280px      │  │       (flex-1, scrollable)       │  │
│ │               │  │                                  │  │
│ │               │  │                                  │  │
│ │               │  │                                  │  │
│ └──────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

- **Overall**: `flex h-screen bg-gray-100`
- **Sidebar**: `w-[280px] bg-white border-r border-gray-200 flex flex-col` — collapsible on mobile
- **Main content**: `flex-1 overflow-y-auto p-8`

### Sidebar Design

```
┌─────────────────────────┐
│ Menu                  ≡ │  ← Header: "Menu" bold + hamburger toggle
│ ┌─────────────────────┐ │
│ │ 🔍 Search           │ │  ← Search input with icon
│ └─────────────────────┘ │
│                         │
│ TASKS                   │  ← Uppercase section label
│  » Upcoming         12  │  ← Icon + name + count badge
│  ≡ Today             5  │  ← Active item: font-semibold
│  📅 Calendar            │
│  📋 Sticky Wall         │
│                         │
│ LISTS                   │  ← Uppercase section label
│  ● Personal          3  │  ← Colored dot + name + count
│  ● Work              6  │
│  ● List 1            3  │
│  + Add New List         │  ← Add action
│                         │
│ TAGS                    │  ← Uppercase section label
│  [Tag 1] [Tag 2]       │  ← Pastel colored chip pills
│  [+ Add Tag]            │
│                         │
│ ─────────────────────── │
│ ⚙ Settings              │  ← Bottom-anchored
│ → Sign out              │
└─────────────────────────┘
```

**Sidebar details:**
- Header: `"Menu"` in `text-lg font-bold` + hamburger icon button (toggles sidebar on mobile)
- Search: shadcn `Input` with search icon, `rounded-lg bg-gray-50 border-gray-200`
- Section labels: `text-xs font-medium uppercase tracking-wider text-gray-400 px-3 mb-2`
- Nav items: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100`
- Active item: `font-semibold text-gray-900 bg-gray-100` with left accent border (`border-l-2 border-gray-900`)
- Count badges: `bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-md ml-auto`
- List color dots: `w-3 h-3 rounded-sm` with list-specific color
- Tag chips: `px-3 py-1 rounded-full text-xs font-medium` with pastel bg + darker text
- Bottom links: `mt-auto` section with Settings (sliders icon) and Sign out (arrow icon)

### Today View

```
┌────────────────────────────────────────┐
│  Today  [5]                            │  ← Large title + count badge
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ + Add New Task                     │ │  ← Add task row
│ ├────────────────────────────────────┤ │
│ │ ○  Research content ideas        › │ │  ← Checkbox + title + chevron
│ ├────────────────────────────────────┤ │
│ │ ○  Create a database of authors  › │ │
│ ├────────────────────────────────────┤ │
│ │ ○  Renew driver's license        › │ │
│ │    📅 22-03-22  [1] Subtasks       │ │  ← Metadata row: date, subtask count,
│ │    [● Personal]                    │ │     list badge with colored dot
│ ├────────────────────────────────────┤ │
│ │ ○  Consult accountant            › │ │
│ │    [● List 1]  [3] Subtasks        │ │
│ ├────────────────────────────────────┤ │
│ │ ○  Print business card           › │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Task row details:**
- Container: `bg-white rounded-xl border border-gray-200` (or card-style with subtle shadow)
- Task row: `flex items-center px-4 py-3.5 border-b border-gray-100 last:border-b-0`
- Checkbox: Circle outline, `w-5 h-5 rounded-full border-2 border-gray-300` — fills on completion
- Title: `text-sm text-gray-900 flex-1`
- Chevron: `text-gray-400` right arrow (navigate to detail)
- Metadata row: Below title, `flex items-center gap-2 mt-1.5`
  - Date badge: `flex items-center gap-1 text-xs text-gray-500` with calendar icon
  - Subtask count: `text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded` with count
  - List badge: `flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full` with colored dot + list name

### Upcoming View

```
┌────────────────────────────────────────────────────┐
│  Upcoming  [12]                                    │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │  Today                                         │ │  ← Full-width section card
│ │  + Add New Task                                │ │
│ │  ○  Research content ideas                   › │ │
│ │  ○  Create a database of guest authors       › │ │
│ │  ○  Renew driver's license                   › │ │
│ │  ○  Consult accountant                       › │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ ┌──────────────────────┐ ┌───────────────────────┐ │
│ │  Tomorrow             │ │  This Week            │ │  ← 2-column grid
│ │  + Add New Task       │ │  + Add New Task       │ │
│ │  ○  Create job post › │ │  ○  Research ideas  › │ │
│ │  ○  Request design  › │ │  ○  Create database › │ │
│ │                       │ │  ○  Renew license   › │ │
│ │                       │ │  ○  Consult acct    › │ │
│ │                       │ │  ○  Print cards     › │ │
│ └──────────────────────┘ └───────────────────────┘ │
└────────────────────────────────────────────────────┘
```

**Upcoming details:**
- Section cards: `bg-white rounded-xl border border-gray-200 p-4`
- Section title: `text-lg font-semibold text-gray-900 mb-3`
- Today section: Full width
- Tomorrow + This Week: `grid grid-cols-2 gap-4` (responsive — stack on mobile)
- Each section has its own "+ Add New Task" row
- Tasks rendered in same row style as Today view

### Calendar View

```
┌──────────────────────────────────────────────────────────┐
│  16 February 2022                          [Add Event]   │  ← Date title + action button
│                                                          │
│  [Day] [Week] [Month]                         ‹  ›      │  ← Tab switcher + nav arrows
│                                                          │
│  WEDNESDAY                                               │
│  ┌──────────────────────────────────────────────────────┐│
│  │ 09:00 AM  ┌──────────────────────────────────────┐   ││
│  │           │ Session 1: Marketing Sprint    (blue) │   ││  ← Time block (pastel bg)
│  │           └──────────────────────────────────────┘   ││
│  │ ● ─────── current time indicator ──────────────────  ││  ← Black dot + dashed line
│  │ 10:00 AM  ┌──────────────────────────────────────┐   ││
│  │           │ Sales Catchup                  (gray) │   ││
│  │           └──────────────────────────────────────┘   ││
│  │ 11:00 AM  ┌──────────────────────────────────────┐   ││
│  │           │ Renew driver's license         (pink) │   ││
│  │           └──────────────────────────────────────┘   ││
│  │ 12:00 PM                                             ││
│  │ 01:00 PM                                             ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

**Calendar details:**
- Page title: Full date in `text-4xl font-bold` format ("16 February 2022")
- "Add Event" button: Outlined, top-right (`border border-gray-300 rounded-lg px-4 py-2`)
- View tabs: shadcn `Tabs` — Day / Week / Month (`bg-gray-100 rounded-lg p-1` with active tab `bg-white shadow-sm`)
- Navigation: Left/right chevron arrows for date navigation
- Day label: Uppercase weekday (`text-xs font-medium uppercase tracking-wider text-gray-500`)
- Time column: `text-xs text-gray-400 w-16` — left-aligned time labels (09:00 AM, 10:00 AM, etc.)
- Time blocks: `rounded-lg px-3 py-2 text-sm font-medium` with pastel background color tied to the task's list
- Current time indicator: Black dot (`w-2 h-2 rounded-full bg-black`) + dashed horizontal line
- Hour rows: `h-16 border-b border-gray-100` grid

### Sticky Wall View

```
┌──────────────────────────────────────────────────────────┐
│  Sticky Wall                                             │
│                                                          │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐   │
│ │  Social Media  │ │ Content       │ │ Email A/B     │   │  ← 3-column grid
│ │  (yellow)      │ │ Strategy      │ │ Tests         │   │
│ │  - Plan social │ │ (cyan)        │ │ (pink)        │   │
│ │  - Build cal   │ │ Would need    │ │ - Subject     │   │
│ │  - Plan promo  │ │ time to get...│ │ - Sender      │   │
│ │                │ │               │ │ - CTA         │   │
│ └───────────────┘ └───────────────┘ └───────────────┘   │
│ ┌───────────────┐ ┌───────────────┐                      │
│ │  Banner Ads    │ │               │                      │
│ │  (orange)      │ │      +        │  ← Add new sticky   │
│ │  Notes from    │ │               │                      │
│ │  the workshop  │ │               │                      │
│ └───────────────┘ └───────────────┘                      │
└──────────────────────────────────────────────────────────┘
```

**Sticky Wall details:**
- Page title: `text-4xl font-bold text-gray-900`
- Grid: `grid grid-cols-3 gap-4` (responsive — 2 cols on tablet, 1 on mobile)
- Sticky note card: `rounded-xl p-5 min-h-[180px]` with pastel background color
- Sticky title: `text-base font-bold text-gray-900 mb-2`
- Sticky body: `text-sm text-gray-700 leading-relaxed` — supports bullet points and freeform text
- Note colors: Yellow, cyan, pink, orange pastel variants (user-selectable)
- Add card: `rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center min-h-[180px]` with large "+" icon
- Drag-and-drop: Reorder stickies via dnd-kit

---

## Data Model

```
Tasks
├── id: string (nanoid)
├── title: string
├── notes: string (markdown)
├── status: 'active' | 'completed' | 'cancelled'
├── priority: 0 | 1 | 2 | 3  (none, low, medium, high)
├── dueDate: string | null (ISO date)
├── dueTime: string | null (HH:mm)
├── duration: number | null (minutes, for time blocking)
├── scheduledDate: string | null
├── completedAt: string | null
├── createdAt: string
├── updatedAt: string
├── listId: string | null (references Lists)
├── parentId: string | null (subtasks)
├── position: number (sort order)
├── tags: string[]
├── checklist: { id, text, done }[]
├── recurringRule: string | null (rrule format)
└── timeBlockColor: string | null (for calendar display)

Lists
├── id: string (nanoid)
├── name: string
├── color: string (dot color — pink, cyan, yellow, etc.)
├── position: number
├── taskCount: number (computed / cached)
└── createdAt: string

Tags
├── id: string (nanoid)
├── name: string
└── color: string (pastel chip color)

StickyNotes
├── id: string (nanoid)
├── title: string
├── content: string (freeform text / bullet points)
├── color: 'yellow' | 'cyan' | 'pink' | 'orange' | 'green' | 'purple'
├── position: number (grid order)
├── createdAt: string
└── updatedAt: string

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

**Key data model changes from previous design:**
- `Projects` renamed to `Lists` (simpler, flat — no emoji, just name + color dot)
- `Areas` removed entirely (flat list structure, no nesting)
- `StickyNotes` table added (new Sticky Wall feature)
- Task `projectId` → `listId` (references Lists)
- Task `areaId` removed
- Task `isEvening` removed (no evening concept)
- Task `kanbanColumn` removed (replaced by Sticky Wall)
- Task `duration` added (for calendar time blocking)
- Task `timeBlockColor` added (for calendar display)
- Task `status` simplified: `'inbox'` removed (no inbox view)

---

## Phase 1: Foundation & Core Task Management ✅

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
- [x] Install Dexie.js and define schema (Tasks, Lists, Tags tables)
- [x] Create database service (`src/db/index.ts`) with typed tables
- [x] Build CRUD hooks: `useTasks()`, `useTask(id)`, `useLists()`, `useTags()`
- [x] Implement `useLiveQuery` wrappers for reactive data
- [x] Add seed data function for development

### 1.3 App Shell & Navigation
- [x] Build sidebar layout (clean, collapsible, white background)
- [x] Implement navigation: Upcoming, Today, Calendar, Sticky Wall
- [x] Add task count badges on sidebar items
- [x] Build responsive layout (sidebar collapses on mobile via hamburger)
- [x] Add smooth page transitions with Framer Motion

### 1.4 Task CRUD
- [x] Task list view with completion checkbox (circle outline)
- [x] Quick Add bar (always accessible, `Q` shortcut or `Cmd+N`)
- [x] Natural language date parsing via chrono-node ("tomorrow", "next friday 3pm")
- [x] Task detail panel (slide-in from right via chevron click)
- [x] Inline editing of task title
- [x] Notes field with markdown support
- [x] Priority selector (color-coded dots: none, low/blue, medium/yellow, high/red)
- [x] Due date picker with calendar popup
- [x] Task completion animation (satisfying checkmark + fade)
- [x] Delete task with undo toast
- [x] Subtasks (indent under parent, collapsible)
- [x] Checklists within a task (multi-step items)

### 1.5 Keyboard Shortcuts
- [x] `Cmd+K` / `Ctrl+K` — Command palette (search tasks, lists, navigate, run actions)
- [x] `Q` — Quick Add task
- [x] `Cmd+N` — New task
- [x] `Enter` — Open selected task
- [x] `Cmd+Backspace` — Delete task
- [x] `↑` / `↓` — Navigate task list
- [x] `Cmd+1-4` — Switch views (Upcoming, Today, Calendar, Sticky Wall)
- [x] `Cmd+.` — Toggle sidebar

### 1.6 Basic Theming
- [x] Light theme (default: light gray background, white cards, neutral palette)
- [x] Dark theme (deep neutral dark, not pure black)
- [x] System theme detection with manual override
- [x] CSS custom properties for theme tokens
- [x] Smooth theme transition animation

---

## Phase 2: Organization & Views ✅

> Goal: Powerful organization without complexity.

### 2.1 Lists
- [x] Create / edit / delete lists
- [x] List color picker (dot colors: pink, cyan, yellow, green, purple, etc.)
- [x] List detail view showing all tasks
- [x] Drag to reorder lists in sidebar
- [x] Task count displayed next to list name
- [x] "+ Add New List" action in sidebar

### 2.2 Tags
- [x] Create / edit / delete tags with colors
- [x] Tag tasks from task detail or inline
- [x] Tags displayed as pastel-colored chips in sidebar TAGS section
- [x] "+ Add Tag" action in sidebar
- [x] Filter by tag
- [x] Multi-tag filtering (AND/OR)

### 2.3 Views
- [x] **Today** — Tasks due today + manually scheduled for today (full task list with metadata)
- [x] **Upcoming** — Grouped sections: Today (full width), Tomorrow + This Week (2-column grid)
- [x] Each section has its own "+ Add New Task" row

### 2.4 Search & Filters
- [x] Search bar in sidebar with search icon
- [x] Full-text search across tasks, notes, lists
- [x] Filter panel: by status, priority, date range, tags, list
- [x] Save custom filters as smart lists
- [x] Search accessible from command palette

### 2.5 Drag & Drop
- [x] Reorder tasks within a list (dnd-kit + Framer Motion)
- [x] Drag tasks to sidebar items (move to list)
- [x] Multi-select tasks and batch actions (move, tag, schedule, delete)

### 2.6 Recurring Tasks
- [x] Recurring rules: daily, weekly, monthly, yearly, custom
- [x] Natural language: "every monday", "every 2 weeks"
- [x] Generate next occurrence on completion
- [x] Visual indicator for recurring tasks

---

## Phase 3: Calendar & Timeline ✅

> Goal: See your tasks in time — plan your day and week visually.

### 3.1 Calendar View
- [x] Day / Week / Month tab switcher (shadcn Tabs component)
- [x] Navigation arrows (< >) to move between dates
- [x] Full date as page title ("16 February 2022" style)
- [x] "Add Event" outlined button top-right
- [x] Drag tasks to reschedule to different dates
- [x] Today indicator and current time line (black dot + dashed line)

### 3.2 Day View
- [x] Hour-by-hour layout with time labels (09:00 AM, 10:00 AM, etc.)
- [x] Weekday label (uppercase, e.g. "WEDNESDAY")
- [x] Time blocks as colored rectangles spanning their duration
- [x] Time block colors: Pastel tones — light blue, light pink, light gray (tied to list or user-chosen)
- [x] Click empty slot to create new task/event

### 3.3 Week View
- [x] 7-column grid with day headers
- [x] Tasks shown as compact time blocks
- [x] Drag to move tasks between days

### 3.4 Month View
- [x] Calendar grid with task dots on dates
- [x] Click date to drill into day view

### 3.5 Time Blocking
- [x] Assign time slots to tasks (start time + duration)
- [x] Visual time blocks in day/week view
- [x] Drag to resize time blocks
- [x] Conflict indicators when tasks overlap

---

## Phase 4: Sticky Wall

> Goal: A visual canvas for brainstorming, quick notes, and idea capture — like a digital sticky note wall.

### 4.1 Sticky Note CRUD
- [ ] Create new sticky notes with title + freeform content
- [ ] Edit sticky notes inline (click to edit title and body)
- [ ] Delete sticky notes with confirmation
- [ ] Color picker: yellow, cyan, pink, orange, green, purple pastels
- [ ] Auto-save on edit (debounced)

### 4.2 Wall Layout
- [ ] Responsive grid: 3 columns desktop, 2 tablet, 1 mobile (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`)
- [ ] "+" add card always visible as last grid item (dashed border, gray bg, centered plus icon)
- [ ] Sticky notes have minimum height (`min-h-[180px]`) for visual consistency
- [ ] Pastel background fills entire card (`rounded-xl p-5`)

### 4.3 Sticky Content
- [ ] Bold title at top of note (`text-base font-bold`)
- [ ] Freeform body text supporting line breaks and bullet points
- [ ] Body text in `text-sm text-gray-700 leading-relaxed`
- [ ] Markdown-lite support: bold, italic, bullet lists

### 4.4 Drag & Reorder
- [ ] Drag sticky notes to reorder on the wall (dnd-kit grid reorder)
- [ ] Smooth animations on reorder (Framer Motion layout)
- [ ] Position persisted in database

### 4.5 Navigation
- [ ] Accessible from sidebar under TASKS section (Sticky Wall icon)
- [ ] `/sticky-wall` route
- [ ] Page title: "Sticky Wall" in `text-4xl font-bold`

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
- [ ] Charts: focus time by day, by list, by tag

### 5.4 Focus Dashboard
- [ ] Today's focus summary (sessions completed, total time)
- [ ] Weekly focus heatmap
- [ ] Most focused lists
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

## Design Overhaul Checklist

> These items need to be implemented/updated to match the new design screenshots.

### Sidebar Overhaul
- [ ] Replace glassmorphism sidebar with clean white `bg-white border-r border-gray-200`
- [ ] Add "Menu" header with hamburger toggle icon
- [ ] Add search input at top of sidebar
- [ ] Restructure into TASKS / LISTS / TAGS sections with uppercase labels
- [ ] Simplify TASKS nav: Upcoming, Today, Calendar, Sticky Wall (remove Inbox, Evening, Anytime, Someday, Logbook)
- [ ] Replace Projects/Areas with flat Lists (colored dots + name + count)
- [ ] Add Tags section with pastel chip pills
- [ ] Add "+ Add New List" and "+ Add Tag" actions
- [ ] Add Settings + Sign out at bottom
- [ ] Active nav item: `font-semibold bg-gray-100` with left border accent

### Task List Overhaul
- [ ] Remove grain texture overlay from body
- [ ] Switch background to `bg-gray-100` (light warm gray)
- [ ] Task cards in white `rounded-xl` containers
- [ ] Task rows: checkbox circle + title + chevron right
- [ ] Metadata row below task: date badge, subtask count, list colored badge
- [ ] "+ Add New Task" row at top of each task list section

### Page Layout Overhaul
- [ ] Page titles: `text-4xl font-bold tracking-tight text-gray-900` with count badge
- [ ] Remove indigo/primary color system — use neutral grays
- [ ] Main content area: `p-8` padding with `max-w-none` (full width within scrollable area)

### Upcoming Page
- [ ] Today section: full-width card
- [ ] Tomorrow + This Week: 2-column grid layout
- [ ] Each section as its own white card with title and task list

### Calendar Page
- [ ] Date as page title (not "Calendar")
- [ ] Day/Week/Month tab switcher
- [ ] "Add Event" button top-right
- [ ] Pastel-colored time blocks (blue, pink, gray)
- [ ] Current time indicator (black dot + dashed line)

### Color System
- [ ] Replace indigo primary → neutral gray system
- [ ] Background: `gray-100`
- [ ] Cards: `white` with `border-gray-200`
- [ ] Text: `gray-900` / `gray-500`
- [ ] Accents: Only for list dots, tag chips, time blocks, sticky notes

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
