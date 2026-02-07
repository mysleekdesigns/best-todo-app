import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { OfflineBanner } from './OfflineBanner'
import { useUIStore } from '@/stores/ui-store'

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Floating toggle -- only shows when sidebar is collapsed */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute left-4 top-4 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Page content */}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>

      <OfflineBanner />
    </div>
  )
}
