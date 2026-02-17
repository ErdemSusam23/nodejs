import apiClient from '@/lib/api-client'
import type { LoginRequest, LoginResponse, User } from '@/types'


export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/users/login', credentials)
    return data.data
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', { oldPassword, newPassword })
  },
}