import { create } from 'zustand'

type ViewId = 'upcoming' | 'today' | 'calendar' | 'sticky-wall'

interface UIState {
  sidebarOpen: boolean
  activeView: ViewId
  collapsedSections: Record<string, boolean>
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveView: (view: ViewId) => void
  toggleSectionCollapsed: (sectionId: string) => void
  setSectionCollapsed: (sectionId: string, collapsed: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeView: 'upcoming',
  collapsedSections: {},
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),
  toggleSectionCollapsed: (sectionId) =>
    set((s) => ({
      collapsedSections: {
        ...s.collapsedSections,
        [sectionId]: !s.collapsedSections[sectionId],
      },
    })),
  setSectionCollapsed: (sectionId, collapsed) =>
    set((s) => ({
      collapsedSections: {
        ...s.collapsedSections,
        [sectionId]: collapsed,
      },
    })),
}))

export type { ViewId }
