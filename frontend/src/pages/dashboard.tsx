import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/api/users'
import { roleApi } from '@/api/roles'
import { categoryApi } from '@/api/categories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, FolderTree, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: number
  icon: React.ElementType
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', { page: 1, limit: 1 }],
    queryFn: () => userApi.getUsers({ page: 1, limit: 1 }),
  })

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles', { page: 1, limit: 1 }],
    queryFn: () => roleApi.getRoles({ page: 1, limit: 1 }),
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', { page: 1, limit: 1 }],
    queryFn: () => categoryApi.getCategories({ page: 1, limit: 1 }),
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Sistem özetine hoş geldiniz
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Kullanıcı"
          value={usersData?.pagination.total || 0}
          icon={Users}
          isLoading={usersLoading}
        />
        <StatCard
          title="Toplam Rol"
          value={rolesData?.pagination.total || 0}
          icon={Shield}
          isLoading={rolesLoading}
        />
        <StatCard
          title="Toplam Kategori"
          value={categoriesData?.pagination.total || 0}
          icon={FolderTree}
          isLoading={categoriesLoading}
        />
        <StatCard
          title="Aktif Oturumlar"
          value={1}
          icon={Activity}
          isLoading={false}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hoş Geldiniz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bu admin paneli üzerinden kullanıcıları, rolleri ve kategorileri yönetebilirsiniz.
            Sol menüden ilgili bölümlere erişebilirsiniz.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}