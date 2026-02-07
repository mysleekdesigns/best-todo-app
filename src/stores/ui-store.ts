import { create } from 'zustand'

type ViewId =
  | 'inbox'
  | 'today'
  | 'evening'
  | 'upcoming'
  | 'anytime'
  | 'someday'
  | 'logbook'
  | 'calendar'

interface UIState {
  sidebarOpen: boolean
  activeView: ViewId
  collapsedAreas: Record<string, boolean>
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveView: (view: ViewId) => void
  toggleAreaCollapsed: (areaId: string) => void
  setAreaCollapsed: (areaId: string, collapsed: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeView: 'inbox',
  collapsedAreas: {},
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),
  toggleAreaCollapsed: (areaId) =>
    set((s) => ({
      collapsedAreas: {
        ...s.collapsedAreas,
        [areaId]: !s.collapsedAreas[areaId],
      },
    })),
  setAreaCollapsed: (areaId, collapsed) =>
    set((s) => ({
      collapsedAreas: {
        ...s.collapsedAreas,
        [areaId]: collapsed,
      },
    })),
}))

export type { ViewId }
