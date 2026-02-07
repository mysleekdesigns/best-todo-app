import { Outlet } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@/stores/ui-store'

export function AppShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar — only shows toggle when sidebar is collapsed */}
        {!sidebarOpen && (
          <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Open sidebar"
            >
              <PanelLeft size={18} />
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
