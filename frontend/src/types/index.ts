// User Types
export interface User {
  _id: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  phone_number?: string
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  roleId: string
  isActive?: boolean
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  roleId?: string
  isActive?: boolean
}

// Role Types
export interface Role {
  _id: string
  name: string
  description?: string
  permissions: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: string[]
  isActive?: boolean
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
  isActive?: boolean
}

// Category Types
export interface Category {
  _id: string
  name: string
  description?: string
  parentId?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  parentId?: string
  isActive?: boolean
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  parentId?: string
  isActive?: boolean
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
  }
  token: string
}

// Audit Log Types
export interface AuditLog {
  _id: string
  userId: string | User
  action: string
  resource: string
  resourceId?: string
  changes?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Filter Types
export interface UserFilters extends PaginationParams {
  name?: string
  email?: string
  roleId?: string
  isActive?: boolean
}

export interface RoleFilters extends PaginationParams {
  name?: string
  isActive?: boolean
}

export interface CategoryFilters extends PaginationParams {
  name?: string
  parentId?: string
  isActive?: boolean
}

export interface AuditLogFilters extends PaginationParams {
  userId?: string
  action?: string
  resource?: string
  startDate?: string
  endDate?: string
}