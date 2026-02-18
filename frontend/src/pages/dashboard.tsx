import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/api/users'
import { roleApi } from '@/api/roles'
import { categoryApi } from '@/api/categories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, FolderTree, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { statsApi } from '@/api/stats'

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
  // TEK SORGU: Backend'e tek bir istek atıyoruz
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsApi.getDashboardStats, 
    // userApi.getUsers gibi, doğrudan fonksiyonu veriyoruz.
    // Eğer apiClient response yapın data'nın içindeki data'yı dönüyorsa
    // react-query'de 'data' değişkeni direkt { users: 10, ... } objesi olur.
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
          value={stats?.users || 0}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Toplam Rol"
          value={stats?.roles || 0}
          icon={Shield}
          isLoading={isLoading}
        />
        <StatCard
          title="Toplam Kategori"
          value={stats?.categories|| 0}
          icon={FolderTree}
          isLoading={isLoading}
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