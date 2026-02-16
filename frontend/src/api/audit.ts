import apiClient from '@/lib/api-client'
import type { AuditLog, PaginatedResponse, AuditLogFilters } from '@/types'

export const auditApi = {
  // Get audit logs with filters
  getAuditLogs: async (filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> => {
    const { data } = await apiClient.get<PaginatedResponse<AuditLog>>('/audit', {
      params: filters,
    })
    return data
  },

  // Get single audit log
  getAuditLog: async (id: string): Promise<AuditLog> => {
    const { data } = await apiClient.get<AuditLog>(`/audit/${id}`)
    return data
  },

  // Export audit logs
  exportAuditLogs: async (filters?: AuditLogFilters): Promise<Blob> => {
    const { data } = await apiClient.get('/audit/export', {
      params: filters,
      responseType: 'blob',
    })
    return data
  },
}