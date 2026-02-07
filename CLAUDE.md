# Zenith — The Last Todo App You'll Ever Need

## Project Overview
Zenith is a local-first Progressive Web App combining the design elegance of Things 3 with the power of Todoist/TickTick. It includes a Pomodoro timer, calendar, Kanban board, and habit tracker. No server, no account — data stays on device via IndexedDB.

## Tech Stack
- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI primitives)
- **Dexie.js** — IndexedDB wrapper with `useLiveQuery` for reactive queries
- **dnd-kit** — Drag and drop
- **Framer Motion** — Animations and layout transitions
- **chrono-node** — Natural language date parsing
- **date-fns** — Date utilities
- **Zustand** — Lightweight global state
- **React Router v7** — Client-side routing
- **Lucide React** — Icon set
- **vite-plugin-pwa** — PWA/service worker support
- **Vitest** + **Testing Library** — Unit and component tests

## Project Structure
```
src/
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui primitives
│   ├── layout/       # Sidebar, AppShell, Header
│   ├── tasks/        # TaskList, TaskItem, TaskDetail, QuickAdd
│   ├── calendar/     # CalendarView, DayView, WeekView
│   ├── kanban/       # KanbanBoard, KanbanColumn, KanbanCard
│   ├── focus/        # PomodoroTimer, FocusMode, SessionTracker
│   └── habits/       # HabitTracker, HabitCard, HabitCalendar
├── hooks/            # Custom React hooks
├── db/               # Dexie.js database, schema, CRUD operations
├── stores/           # Zustand stores (UI state, settings)
├── lib/              # Utilities, helpers, constants
├── pages/            # Route-level page components
├── types/            # TypeScript type definitions
└── styles/           # Global styles, theme tokens
```

## Design Principles
1. **Speed is a feature** — Optimistic UI, local-first data, every interaction instant
2. **Calm over chaos** — Things 3-inspired minimal design, whitespace is sacred
3. **Keyboard-first** — Every action via keyboard, Cmd+K command palette
4. **Progressive disclosure** — Show only what's needed
5. **Offline by default** — PWA installable, data in IndexedDB via Dexie.js

## Key Data Models
- **Tasks**: id, title, notes (markdown), status, priority (0-3), dueDate, projectId, tags, checklist, recurringRule, kanbanColumn
- **Projects**: id, name, color, emoji, areaId, position
- **Areas**: id, name, position
- **Tags**: id, name, color
- **FocusSessions**: id, taskId, startTime, endTime, duration, type, completed
- **Habits**: id, name, frequency, streakCurrent, entries[]
- **AppSettings**: theme, pomodoro durations, defaultView, weekStartsOn

## Coding Standards
- Use TypeScript strict mode throughout
- Prefer functional components with hooks
- Use `useLiveQuery` from Dexie for reactive database queries
- Follow shadcn/ui patterns for component composition
- Use Tailwind CSS v4 for styling — no inline styles or CSS modules
- Use `nanoid` for generating IDs
- Use `date-fns` for all date operations
- Use `chrono-node` for natural language date parsing
- Use Framer Motion for all animations (layout transitions, page transitions)
- Use Zustand for ephemeral UI state only (sidebar open, active view, etc.)
- Keep database as the source of truth — never duplicate DB data in Zustand

## File Ownership Rules (for parallel work)
To avoid conflicts when multiple teammates work simultaneously:
- **Teammate working on database**: owns `src/db/`, `src/types/`
- **Teammate working on UI shell**: owns `src/components/layout/`, `src/pages/`, `src/stores/`
- **Teammate working on task components**: owns `src/components/tasks/`, `src/hooks/`
- **Teammate working on theming/shortcuts**: owns `src/styles/`, `src/lib/`, `src/components/ui/`
- Shared files (like `src/App.tsx`, `src/main.tsx`) should only be edited by the scaffolding/shell teammate

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run test` — Run Vitest tests
- `npm run lint` — ESLint check
- `npm run format` — Prettier format
