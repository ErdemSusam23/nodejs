import apiClient from '@/lib/api-client'
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PaginatedResponse,
  RoleFilters,
} from '@/types'

// Backend'den gelen Privilege yapısı
export interface RolePrivilege {
  _id: string
  role_id: string
  permission: string
}

export const roleApi = {
  // Get all roles
  getRoles: async (filters?: RoleFilters): Promise<PaginatedResponse<Role>> => {
    const { data } = await apiClient.get('/roles', {
      params: filters,
    })
    return data
  },

  // Get single role
  getRole: async (id: string): Promise<Role> => {
    const { data } = await apiClient.get<Role>(`/roles/${id}`)
    return data
  },

  // Create role
  createRole: async (roleData: CreateRoleRequest): Promise<Role> => {
    const { data } = await apiClient.post('/roles/add', roleData)
    return data
  },

  // Update role
  updateRole: async (id: string, roleData: UpdateRoleRequest): Promise<Role> => {
    // Backend update body içinde _id bekliyor
    const { data } = await apiClient.post('/roles/update', { _id: id, ...roleData })
    return data
  },

  // Delete role
  deleteRole: async (id: string): Promise<void> => {
    await apiClient.post('/roles/delete', { _id: id })
  },

  // Get ALL system permissions (Checkbox listesi için)
  getPermissions: async (): Promise<any> => {
    const { data } = await apiClient.get('/roles/permissions')
    return data.data  // ← wrapper soyuldu: { code, data: { privileges: [...] } } → { privileges: [...] }
  },

  // Get privileges for a SPECIFIC role (Edit işlemi için gerekli)
  getRolePrivileges: async (roleId: string): Promise<RolePrivilege[]> => {
    const { data } = await apiClient.get('/roles/role_privileges', {
      params: { role_id: roleId }
    })
    return data.data  // ← wrapper soyuldu: { code, data: [...] } → [...]
  }
}