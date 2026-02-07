import { create } from 'zustand'

type ViewId =
  | 'inbox'
  | 'today'
  | 'evening'
  | 'upcoming'
  | 'anytime'
  | 'someday'
  | 'logbook'

interface UIState {
  sidebarOpen: boolean
  activeView: ViewId
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveView: (view: ViewId) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeView: 'inbox',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),
}))

export type { ViewId }
