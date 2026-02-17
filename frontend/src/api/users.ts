import apiClient from '@/lib/api-client'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  UserFilters,
} from '@/types'

export const userApi = {
  // 1. Kullanıcıları Listele (GET /users)
  // Backend query parametreleri ile filtrelemeyi destekler
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/users', {
      params: filters,
    })
    return data.data // Backend wrapper { code: 200, data: { ... } } dönüyor, apiClient response interceptor bunu hallediyor olmalı.
  },

  // 2. Tek Kullanıcı Getir 
  // UYARI: Backend'inizde "GET /users/:id" endpoint'i YOK. 
  // Bu yüzden bu fonksiyon çalışmayacaktır. Listeden bulmanız gerekir.
  /* getUser: async (id: string): Promise<User> => {
    // Backend desteği yok, geçici olarak iptal edildi.
    throw new Error("Backend tekil kullanıcı çekmeyi desteklemiyor.")
  },
  */

  // 3. Kullanıcı Ekle (POST /users/add)
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    // Backend '/add' route'unu bekliyor
    const { data } = await apiClient.post('/users/add', userData)
    return data.data
  },

  // 4. Kullanıcı Güncelle (POST /users/update)
  // Backend PUT /users/:id DEĞİL, POST /users/update bekliyor
  updateUser: async (_id: string, userData: UpdateUserRequest): Promise<User> => {
    // KRİTİK DÜZELTME: Backend body içinde "_id" bekliyor (id değil)
    const { data } = await apiClient.post('/users/update', { 
      _id,
      ...userData 
    })
    return data.data
  },

  // 5. Kullanıcı Sil (POST /users/delete)
  // Backend DELETE /users/:id DEĞİL, POST /users/delete bekliyor
  deleteUser: async (_id: string): Promise<void> => {
    // Backend body içinde "id" alanını bekliyor
    await apiClient.post('/users/delete', { _id })
  },

  // 6. Durum Değiştir (toggle-status diye bir route yok, update kullanıyoruz)
  toggleUserStatus: async (_id: string, currentStatus: boolean): Promise<void> => {
    await apiClient.post('/users/update', {
      _id,
      is_active: !currentStatus
    })
  },
}