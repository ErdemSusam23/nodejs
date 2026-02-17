// --- ORTAK TİPLER ---
export interface BaseEntity {
  _id: string
  created_at: string // Backend'den snake_case geliyor
  updated_at: string // Backend'den snake_case geliyor
}

// --- USER TYPES ---
export interface User extends BaseEntity {
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  is_active: boolean
  // Eğer backend user objesi içinde rol bilgisini populate edip gönderiyorsa:
  roles?: Role[] 
}

export interface CreateUserRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  phone_number?: string
  is_active?: boolean
  // Rol ataması backend'de ayrı bir işlem olabilir veya array olarak beklenebilir
  roles?: string[] 
}

export interface UpdateUserRequest {
  _id: string // Update için ID şart
  email?: string
  password?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  is_active?: boolean
  roles?: string[]
}

// --- ROLE TYPES ---
export interface Role extends BaseEntity {
  role_name: string // Backend'de 'role_name'
  description?: string // Şemada yok ama kodda kullanılmış, opsiyonel kalsın
  is_active: boolean
  created_by?: string
  permissions?: string[] // RolePrivileges tablosundan gelmeli
}

export interface CreateRoleRequest {
  role_name: string // 'name' yerine 'role_name'
  description?: string
  is_active?: boolean
  permissions: string[]
}

export interface UpdateRoleRequest {
  role_name?: string
  description?: string
  is_active?: boolean
  permissions?: string[]
}

// --- CATEGORY TYPES ---
export interface Category extends BaseEntity {
  name: string
  is_active: boolean
  created_by?: string
}

export interface CreateCategoryRequest {
  name: string
  is_active?: boolean
}

export interface UpdateCategoryRequest {
  _id: string
  name?: string
  is_active?: boolean
}

// --- AUTH TYPES ---
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

// --- AUDIT LOG TYPES (Backend Şemasına Göre Düzeltildi) ---
export interface AuditLog extends BaseEntity {
  level?: string
  email: string // İşlemi yapan kişi
  location: string // İşlem yeri (Örn: Users, Categories)
  proc_type: string // İşlem tipi (Örn: Login, Update)
  log: Record<string, any> // Mixed type, detaylı log verisi
}

// --- PAGINATION & FILTERS ---
export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CategoryFilters {
  page?: number
  limit?: number
  search?: string
  is_active?: boolean
}

export interface RoleFilters {
  page?: number
  limit?: number
  search?: string
  is_active?: boolean
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  is_active?: boolean
}

export interface PaginatedResponse<T> {
  code: number
  message?: string
  data: {
    data: T[]
    pagination?: Pagination
  }
}

// --- GENERIC API RESPONSE ---
// Backend yapısına uygun standart wrapper
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  error?: {
    message: string
    description?: string
  }
}