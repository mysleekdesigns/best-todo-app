import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { OfflineBanner } from './OfflineBanner'
import { useUIStore } from '@/stores/ui-store'

export function AppShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Floating toggle -- only shows when sidebar is collapsed */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute left-4 top-4 z-10 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <OfflineBanner />
    </div>
  )
}
