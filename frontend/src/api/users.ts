import apiClient from '@/lib/api-client'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  UserFilters,
} from '@/types'

export const userApi = {
  // Get all users with filters
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/users', {
      params: filters,
    })
    return data.data
  },

  // Get single user
  getUser: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${id}`)
    return data
  },

  // Create user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const { data } = await apiClient.post<User>('/users', userData)
    return data
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    const { data } = await apiClient.put<User>(`/users/${id}`, userData)
    return data
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },

  // Toggle user status
  toggleUserStatus: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}/toggle-status`)
    return data
  },
}