import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Shield,
  FolderTree,
  FileText,
  ChevronLeft,
} from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { Button } from '@/components/ui/button'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Kullanıcılar',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Roller',
    href: '/roles',
    icon: Shield,
  },
  {
    title: 'Kategoriler',
    href: '/categories',
    icon: FolderTree,
  },
  {
    title: 'Audit Logs',
    href: '/audit-logs',
    icon: FileText,
  },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h1
          className={cn(
            'font-bold text-xl transition-opacity duration-200',
            !sidebarOpen && 'opacity-0'
          )}
        >
          Admin Panel
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              !sidebarOpen && 'rotate-180'
            )}
          />
        </Button>
      </div>

      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !sidebarOpen && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  'transition-opacity duration-200',
                  !sidebarOpen && 'hidden'
                )}
              >
                {item.title}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}