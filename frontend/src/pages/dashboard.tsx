import { useQuery } from '@tanstack/react-query'
import { statsApi } from '@/api/stats' // Tek ihtiyacın olan bu
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
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsApi.getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 dakika boyunca cache'den oku, tekrar istek atma (Performans)
  })

  // Eğer API yanıtın { code: 200, data: {...} } formatındaysa güvenli erişim:
  // statsData?.data varsa onu al, yoksa (direkt data dönüyorsa) statsData'yı al.
  //const stats = statsData || {};

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
          value={statsData?.users || 0}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Toplam Rol"
          value={statsData?.roles || 0}
          icon={Shield}
          isLoading={isLoading}
        />
        <StatCard
          title="Toplam Kategori"
          value={statsData?.categories || 0}
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
        
       {/* Alt kısımdaki Hoşgeldiniz kartı aynı kalabilir */}
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