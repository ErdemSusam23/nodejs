import apiClient from '@/lib/api-client'

// Bu tipi istersen @/types/index.ts dosyana taşıyıp oradan import edebilirsin.
// Şimdilik kolaylık olsun diye buraya ekledim.
export interface DashboardStats {
  users: number
  roles: number
  categories: number
}

export const statsApi = {
  // 1. Dashboard İstatistiklerini Getir (GET /stats/dashboard)
  // Backend'de routes/stats.js içinde router.get('/dashboard'...) tanımladık
  // ve app.js'de '/api/stats' altına mount ettiğimiz varsayımıyla:
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/dashboard')
    
    // Backend Response yapısı: { code: 200, data: { users: 5, roles: 2... } }
    // apiClient interceptor'ın 'data'yı döndüğünü ve buradan da içindeki 'data'yı aldığımızı varsayıyoruz.
    return data 
  },
}