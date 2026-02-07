# Agent Team Launch Prompt for Zenith — Phase 1

Copy and paste the prompt below into a new Claude Code session (from this project directory) to launch your agent team.

---

## The Prompt

```
Create an agent team called "zenith-phase1" to build Phase 1 of Zenith — a Things 3-inspired todo app. Read the PRD.md for full requirements and CLAUDE.md for project context.

Spawn 4 teammates that work in parallel. Use Sonnet for each teammate to keep costs reasonable. Require plan approval before any teammate makes changes.

## Team Structure

### Teammate 1: "scaffolder" — Project Scaffolding & Database Layer
Owns: src/db/, src/types/, project root config files, src/App.tsx, src/main.tsx
Tasks:
- Initialize Vite 6 + React 19 + TypeScript project
- Configure Tailwind CSS v4
- Install and configure shadcn/ui (follow their Vite setup guide)
- Set up project structure: src/components, src/hooks, src/db, src/stores, src/lib, src/pages, src/types, src/styles
- Configure path aliases (@/)
- Set up Vitest + Testing Library
- Add ESLint + Prettier config
- Install Dexie.js and define schema (Tasks, Projects, Areas, Tags, FocusSessions, Habits, AppSettings)
- Create database service (src/db/index.ts) with typed tables
- Build CRUD hooks: useTasks(), useTask(id), useProjects(), useAreas(), useTags()
- Implement useLiveQuery wrappers for reactive data
- Add seed data function for development
- Create TypeScript type definitions for all data models in src/types/

### Teammate 2: "ui-shell" — App Shell & Navigation
Owns: src/components/layout/, src/pages/, src/stores/
Depends on: scaffolder completing project setup (wait for scaffolder to finish initial setup)
Tasks:
- Build sidebar layout (Things 3-style: clean, collapsible) using shadcn/ui + Tailwind
- Implement navigation: Inbox, Today, This Evening, Upcoming, Anytime, Someday, Logbook
- Add task count badges on sidebar items (using useLiveQuery from Dexie)
- Build responsive layout (sidebar collapses on mobile)
- Add smooth page transitions with Framer Motion
- Set up React Router v7 for client-side routing
- Create Zustand store for UI state (sidebar open/closed, active view)

### Teammate 3: "task-ui" — Task Components & CRUD
Owns: src/components/tasks/, src/hooks/ (task-specific hooks)
Depends on: scaffolder completing database layer
Tasks:
- Task list view with completion checkbox (animated circle, Things 3-style)
- Quick Add bar (always accessible, Q shortcut or Cmd+N)
- Natural language date parsing via chrono-node ("tomorrow", "next friday 3pm")
- Task detail panel (slide-in from right, Framer Motion animation)
- Inline editing of task title
- Notes field with markdown support
- Priority selector (color-coded dots: none, low/blue, medium/yellow, high/red)
- Due date picker with calendar popup
- Task completion animation (satisfying checkmark + fade)
- Delete task with undo toast
- Subtasks (indent under parent, collapsible)
- Checklists within a task

### Teammate 4: "theme-keys" — Theming & Keyboard Shortcuts
Owns: src/styles/, src/lib/, src/components/ui/ (custom additions)
Depends on: scaffolder completing project setup
Tasks:
- Light theme (Things 3-inspired: warm whites, subtle grays)
- Dark theme (deep dark, not pure black)
- System theme detection with manual override
- CSS custom properties for theme tokens
- Smooth theme transition animation
- Cmd+K / Ctrl+K command palette (search tasks, navigate, run actions)
- Q — Quick Add, Cmd+N — New task, Enter — Open task
- Cmd+Backspace — Delete, Arrow keys — Navigate list
- Cmd+1-7 — Switch views, Cmd+. — Toggle sidebar
- E — Toggle evening, T — Today, S — Someday

## Coordination Rules
- The scaffolder MUST complete project initialization before other teammates start coding
- Each teammate owns their directories — do NOT edit files in another teammate's directories
- If you need something from another teammate, message them directly
- Use the shared task list to track progress
- Wait for all teammates to finish before synthesizing results
- Only approve plans that follow the tech stack in CLAUDE.md (React 19, Tailwind v4, shadcn/ui, Dexie.js, etc.)
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
- The scaffolder should finish first — other teammates depend on the project being initialized
- For split panes (each teammate in own terminal), install tmux: `brew install tmux`
