import apiClient from '@/lib/api-client'
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
  CategoryFilters,
} from '@/types'

export const categoryApi = {
  // Get all categories with filters
  getCategories: async (filters?: CategoryFilters): Promise<PaginatedResponse<Category>> => {
    const { data } = await apiClient.get('/categories', {
      params: filters,
    })
    return data.data
  },

  // Get single category
  getCategory: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`/categories/${id}`)
    return data
  },

  // Create category
  createCategory: async (categoryData: CreateCategoryRequest): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories', categoryData)
    return data
  },

  // Update category
  updateCategory: async (id: string, categoryData: UpdateCategoryRequest): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, categoryData)
    return data
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },

  // Get category tree
  getCategoryTree: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/categories/tree')
    return data
  },
}