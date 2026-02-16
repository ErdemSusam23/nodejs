import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import Cookie from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - token ekleme
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookie.get('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message = error.response?.data?.message || error.response?.data?.error || 'Bir hata oluştu'

    // 401 - Unauthorized
    if (error.response?.status === 401) {
      Cookie.remove('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Oturumunuz sonlandı. Lütfen tekrar giriş yapın.')
      return Promise.reject(error)
    }

    // 403 - Forbidden
    if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz yok.')
      return Promise.reject(error)
    }

    // 404 - Not Found
    if (error.response?.status === 404) {
      toast.error('İstenen kaynak bulunamadı.')
      return Promise.reject(error)
    }

    // 500 - Server Error
    if (error.response?.status === 500) {
      toast.error('Sunucu hatası oluştu.')
      return Promise.reject(error)
    }

    // Diğer hatalar
    toast.error(message)
    return Promise.reject(error)
  }
)

export default apiClient