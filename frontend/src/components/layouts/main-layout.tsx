import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  )
}

export function MainLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="relative flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}