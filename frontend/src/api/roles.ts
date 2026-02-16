import apiClient from '@/lib/api-client'
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PaginatedResponse,
  RoleFilters,
} from '@/types'

export const roleApi = {
  // Get all roles with filters
  getRoles: async (filters?: RoleFilters): Promise<PaginatedResponse<Role>> => {
    const { data } = await apiClient.get('/roles', {
      params: filters,
    })
    return data.data
  },

  // Get single role
  getRole: async (id: string): Promise<Role> => {
    const { data } = await apiClient.get<Role>(`/roles/${id}`)
    return data
  },

  // Create role
  createRole: async (roleData: CreateRoleRequest): Promise<Role> => {
    const { data } = await apiClient.post<Role>('/roles', roleData)
    return data
  },

  // Update role
  updateRole: async (id: string, roleData: UpdateRoleRequest): Promise<Role> => {
    const { data } = await apiClient.put<Role>(`/roles/${id}`, roleData)
    return data
  },

  // Delete role
  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`)
  },

  // Get available permissions
  getPermissions: async (): Promise<string[]> => {
    const { data } = await apiClient.get<{ permissions: string[] }>('/roles/permissions')
    return data.permissions
  },
}